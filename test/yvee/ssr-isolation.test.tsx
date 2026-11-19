import { describe, it, expect } from 'bun:test';
import { Yvee, Page, State, Stateful, Scope, StateHook } from '../../src';
import { dom } from '../../src/dom/render/node.dom';
import { Wizard } from '../../src/dom/render/oz.dom';
import { snapshotData } from '../../src/yvee/rendering/request';

function barrier(count: number) {
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  return async () => { if (--count === 0) release(); await waiting; };
}

describe('SSR request isolation', () => {
  it('isolates overlapping fetch/body/head work, redirects, errors and stable IDs', async () => {
    const fetchGate = barrier(3), bodyGate = barrier(3), headGate = barrier(3);
    type Data = { user: { name: string } };
    class UserPage extends Page<Data> {
      count = State(0);
      override async fetch() { await fetchGate(); return {}; }
      override async body() {
        await bodyGate();
        if (this.params.name === 'broken') throw new Error('broken');
        return <p on={{ click() {} }}>{this.data.user.name}{this.count}</p>;
      }
      override async head() { await headGate(); return { title: this.data.user.name }; }
    }
    class ErrorPage extends Page<Data> {
      override async body() { await headGate(); return <p>{this.data.user.name} failed</p>; }
    }
    const app = new Yvee<Data>({ id: 'stable-root' });
    app.route('/:name')(UserPage); app.error(500, ErrorPage);
    app.use(({ url }) => url.path === '/redirect' ? { kind: 'redirect', to: '/good' } : undefined);
    const render = app.server();
    const original = { user: { name: 'alice' } };
    const jobs = [render({ url: '/redirect', data: original }), render({ url: '/good', data: { user: { name: 'bob' } } }), render({ url: '/broken', data: { user: { name: 'carol' } } })];
    original.user.name = 'changed-after-start';
    const [alice, bob, carol] = await Promise.all(jobs);
    expect(alice).toContain('alice'); expect(alice).not.toContain('bob'); expect(alice).not.toContain('carol');
    expect(bob).toContain('bob'); expect(bob).not.toContain('alice');
    expect(carol).toContain('carol failed'); expect(carol).not.toContain('alice');
    expect(alice!.match(/id="stable-root[^\"]*"/g)).toEqual(bob!.match(/id="stable-root[^\"]*"/g));
    expect(Wizard.keys).toEqual([]);
    expect(Object.keys(app.data)).toHaveLength(0);
  });

  it('copies and freezes nested plain data without mutating callers and rejects services', () => {
    const original = { user: { name: 'alice' }, array: new Array(3) };
    const copy = snapshotData(original);
    expect(copy).not.toBe(original); expect(copy.user).not.toBe(original.user);
    expect(Object.isFrozen(copy.user)).toBe(true);
    expect(Object.isFrozen(original.user)).toBe(false);
    expect(copy.array.length).toBe(3);
    expect(() => { copy.user.name = 'bob'; }).toThrow();
    expect(() => snapshotData({ date: new Date() })).toThrow('dataFactory');
  });

  it('owns factory services/scopes and disposes hooks on success, render failure and abort', async () => {
    const source = new Stateful('safe');
    let active = 0, notifications = 0;
    const orders: number[][] = [];
    class UserPage extends Page<{ scope: ReturnType<typeof Scope.create<{ user: { name: string } }>> }> {
      override body() { return <p>{this.data.scope.use('user').name}</p>; }
    }
    class BrokenPage extends Page { override body(): never { throw new Error('render failed'); } }
    const app = new Yvee(); app.route('/')(UserPage); app.route('/broken')(BrokenPage); app.error(500, BrokenPage);
    const render = app.server({ dataFactory: async ({ data, signal, onDispose }) => {
      active++;
      const order: number[] = []; orders.push(order);
      onDispose(() => { active--; order.push(1); });
      const stop = await StateHook<[string]>(() => { notifications++; }, [source], { id: crypto.randomUUID() });
      const listener = () => { notifications++; };
      source.addEventListener('updated', listener);
      onDispose(() => { stop(); source.removeEventListener('updated', listener); order.push(2); });
      signal!.throwIfAborted();
      return { scope: Scope.create({ user: { name: String(data?.name) } }) };
    } });
    const html = await Promise.all(['alice', 'bob'].map(name => render({ url: '/', data: { name } })));
    expect(html[0]).toContain('alice'); expect(html[0]).not.toContain('bob');
    expect(html[1]).toContain('bob');
    await expect(render({ url: '/broken' })).rejects.toThrow();
    expect(active).toBe(0); expect(orders).toEqual([[2, 1], [2, 1], [2, 1]]);
    source.value = 'after';
    expect(notifications).toBe(0);
    expect((source as unknown as { hooks: Map<string, unknown> }).hooks.size).toBe(0);
    const controller = new AbortController(); controller.abort();
    await expect(render({ url: '/', signal: controller.signal })).rejects.toThrow();
    expect(active).toBe(0);
    expect(() => Scope.use('user')).toThrow('not registered');
  });

  it('cleans up a partially failed/aborted factory and aggregates cleanup errors', async () => {
    const controller = new AbortController();
    let clean = 0;
    const render = new Yvee().server({ dataFactory: ({ onDispose }) => {
      onDispose(() => { clean++; });
      onDispose(() => { throw new Error('cleanup failed'); });
      controller.abort(new Error('aborted during factory'));
      return {};
    } });
    try { await render({ url: '/', signal: controller.signal }); throw new Error('expected failure'); }
    catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
      expect((error as AggregateError).errors.map((e: Error) => e.message)).toEqual(['aborted during factory', 'cleanup failed']);
    }
    expect(clean).toBe(1);
  });
});

it('keeps stateful body/head IDs deterministic per seed without retaining browser bindings', async () => {
  class ReactivePage extends Page {
    label = State('same');
    override body() { return <p>{this.label}</p>; }
    override async head() { return { elements: [await dom('meta', { name: 'description', content: this.label })] }; }
  }
  const app = new Yvee({ id: 'request-root' }); app.route('/')(ReactivePage);
  const render = app.server();
  const html = await Promise.all(Array.from({ length: 10 }, () => render({ url: '/' })));
  expect(new Set(html).size).toBe(1);
  expect(html[0]).toContain('id="request-root:h-0"');
  const other = await app.server({ id: 'other-root' })({ url: '/' });
  expect(other).toContain('id="other-root:h-0"');
  expect(other).not.toContain('id="request-root');
  expect(Wizard.keys).toEqual([]);
});

it('releases every request subscription across overlapping successful and failed renders', async () => {
  const gate = barrier(12);
  const source = new EventTarget();
  let live = 0, notifications = 0;
  class ResultPage extends Page {
    override async body() {
      await gate();
      if (this.params.result === 'fail') throw new Error('deliberate render failure');
      return <p>{this.data.user}</p>;
    }
  }
  class BrokenErrorPage extends Page { override body(): never { throw new Error('error view failed'); } }
  const app = new Yvee(); app.route('/:result')(ResultPage); app.error(500, BrokenErrorPage);
  const render = app.server({ dataFactory: ({ data, onDispose }) => {
    live++;
    const callback = () => { notifications++; };
    source.addEventListener('ping', callback);
    onDispose(() => { live--; source.removeEventListener('ping', callback); });
    return { user: data?.user };
  } });
  const results = await Promise.allSettled(Array.from({ length: 12 }, (_, i) =>
    render({ url: i % 2 ? '/fail' : '/ok', data: { user: `user-${i}` } })));
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(6);
  expect(results.filter(result => result.status === 'rejected')).toHaveLength(6);
  results.forEach((result, i) => { if (result.status === 'fulfilled') expect(result.value).toContain(`user-${i}`); });
  expect(live).toBe(0);
  source.dispatchEvent(new Event('ping'));
  expect(notifications).toBe(0);
});

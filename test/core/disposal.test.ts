import { expect, it } from 'bun:test';
import { DisposalScope, Yvee, Page } from '../../src';

it('disposes every owned resource once, in reverse order, despite cleanup errors', () => {
  const scope = new DisposalScope(); const order: number[] = [];
  scope.defer(() => order.push(1)); scope.defer(() => { order.push(2); throw new Error('failed'); });
  scope.own({ close() { order.push(3); } });
  expect(() => scope.dispose()).toThrow(AggregateError); scope.dispose();
  expect(order).toEqual([3, 2, 1]); expect(scope.signal.aborted).toBe(true);
  scope.defer(() => order.push(4)); expect(order.at(-1)).toBe(4);
});
it('removes listeners and timers and respects explicit early release', async () => {
  const scope = new DisposalScope(); const target = new EventTarget(); let calls = 0;
  const stop = scope.listen(target, 'ping', () => { calls++; });
  target.dispatchEvent(new Event('ping')); stop(); stop(); target.dispatchEvent(new Event('ping'));
  scope.timeout(() => { calls += 100; }, 0); scope.dispose();
  await Bun.sleep(5); expect(calls).toBe(1);
});
it('releases page scopes on SSR success, failures and guard redirects', async () => {
  let live = 0;
  class ScopedPage extends Page {
    constructor() { super(); live++; this.resources.defer(() => { live--; }); }
    override body() { if (this.path === '/broken') throw new Error('broken'); return 'ok'; }
  }
  const app = new Yvee(); app.route('/:path')(ScopedPage);
  app.use(({ url }) => url.path === '/redirect' ? { kind: 'redirect', to: '/ok' } : undefined);
  await Promise.all(['/ok', '/broken', '/redirect'].map(url => app.server()({ url })));
  expect(live).toBe(0);
});

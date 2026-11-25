import { Yvee, Page, State } from '../../src';
import { DOM, dom, frag } from '../../src/dom/render/node.dom';
import { JsxProbe, KeyedList } from './jsx-runtime';

export const metrics = { clicks: 0, live: 0, globalEvents: 0, pages: 0, pageEvents: 0, lateReadyReturned: 0 };
export const counter = State(0);
export const hostile = '<img src=x onerror="globalThis.injected=true"></script>';
export const reactiveText = State('initial');
export const stateErrors: string[] = [];
export const reactiveURL = State('/safe', { onError: error => stateErrors.push(String(error)) });
export const largeItems = State(makeLargeItems(500));
export function replaceLargeItems(count: number, changedIndex = -1) {
  largeItems.value = makeLargeItems(count, changedIndex);
}
export const largeFineRows = Array.from({ length: 500 }, (_, index) => State(`Item ${index}`));
export function replaceFineItem(index: number) {
  const row = largeFineRows[index];
  if (row) row.value = `Updated item ${index}`;
}

function makeLargeItems(count: number, changedIndex = -1) {
  return Array.from({ length: count }, (_, index) =>
    new DOM('li', {}, [index === changedIndex ? `Updated item ${index}` : `Item ${index}`]),
  );
}

export function createApp(id = 'fixture', history = true) {
  class FixturePage extends Page {
    override async fetch() {
      if (typeof window !== 'undefined') {
        metrics.pages++;
        this.resources.defer(() => { metrics.pages--; });
        this.resources.listen(window, 'page-resource', () => { metrics.pageEvents++; });
      }
      if (typeof window !== 'undefined' && this.params.name === 'slow') {
        await fetch('/gate');
      }
      return {};
    }
    override head() {
      const name = this.params.name ?? 'a';
      if (name === 'badheadready') return { title: 'Broken head', elements: [new DOM('meta', { name: 'broken', content: 'x', on: { ready() { throw new Error('head ready failed'); } } }, [])] };
      if (name === 'badhead') return { meta: [{ name: 'temporary', content: 'remove-me' }, { onload: 'bad' }] };
      return {
        title: `Route ${name}`, description: name, css: `/style/${name}.css`,
        style: '.spacer { height: 2000px }',
        ...(name === 'security' ? {
          script: [{ body: 'globalThis.trustedRuns = (globalThis.trustedRuns || 0) + 1;' }],
          elements: [new DOM('meta', { name: 'reactive', content: reactiveText }, []), new DOM('style', {}, [':root { --fixture-trusted: yes; }'])],
        } : {}),
      };
    }
    override body(): unknown {
      const name = this.params.name ?? 'a';
      if (name === 'badcommit') return () => { throw new Error('commit failed'); };
      if (name === 'accessible' || name === 'accessible-next') return <section>
        <h1>{name}</h1>
        <nav aria-label='Pages'><a href='/accessible-next'>Next page</a></nav>
        <button>Save draft</button>
        <a href='/accessible-next'>Continue</a>
      </section>;
      if (name === 'large') return <section><h1>large</h1><ul>{largeItems}</ul></section>;
      if (name === 'large-fine') return <section><h1>large-fine</h1><ul>{largeFineRows.map(row => <li>{row}</li>)}</ul></section>;
      if (name === 'jsx-runtime') return <section>
        <h1>jsx runtime</h1>
        <JsxProbe label='automatic'>
          <p>child</p>
        </JsxProbe>
        <KeyedList items={['one', 'two']} />
      </section>;
      return <section>
        <h1>{name === 'slowcommit' ? async () => { await fetch('/commit-gate'); return name; } : name}</h1>
        <button on={{ click() { metrics.clicks++; counter.value++; },
          async ready() {
            if (name === 'badready') throw new Error('ready failed');
            if (name === 'slowready') { await fetch('/ready-gate'); metrics.lateReadyReturned++; }
            metrics.live++; return () => { metrics.live--; };
          },
          resize() { metrics.globalEvents++; },
        }}>{counter}</button>
        <a href='/b'>Go B</a><a href='/c'>Go C</a>
        <a href='/b' target='_blank'>Target</a>
        <a href='/b' download>Download</a>
        <a href='https://example.com/'>External</a>
        <p class='hostile' title={hostile}>{hostile}</p><p class='reactive'>{reactiveText}</p><a class='reactive-url' href={reactiveURL}>Reactive URL</a>
        <div class='spacer'>Spacer</div><p id={`${id}-anchor`}>Anchor</p>
      </section>;
    }
  }
  const app = new Yvee({ id, history });
  app.route('/:name')(FixturePage);
  app.route('/')(FixturePage);
  return app;
}

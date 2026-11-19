import { createApp, metrics, counter, reactiveText, reactiveURL, stateErrors, largeItems, replaceLargeItems, largeFineRows, replaceFineItem } from './app';
import { IndexedDatabase, Schema, t, local, session } from '../../src';

const app = createApp();
const original = document.querySelector('button');
if (location.search.includes('mismatch')) original?.setAttribute('data-mismatch', 'yes');
const nonce = document.querySelector<HTMLScriptElement>("script[src='/client.js']")?.nonce;
let dispose = await app.render(nonce ? { nonce } : {});
const fixture = {
  storage: { IndexedDatabase, Schema, t, local, session },
  app, metrics, counter, reactiveText, reactiveURL, stateErrors, largeItems, replaceLargeItems, largeFineRows, replaceFineItem,
  reused: original === document.querySelector('button'),
  dispose: () => dispose(),
  remount: async () => { dispose = await app.render(nonce ? { nonce } : {}); },
  secondary: async () => {
    const element = document.createElement('div');
    element.id = 'secondary'; document.body.append(element);
    const other = createApp('secondary', false);
    const stop = await other.render({ id: 'secondary' });
    return { other, stop };
  },
};
Object.assign(window, { fixture });
document.documentElement.dataset.ready = 'yes';

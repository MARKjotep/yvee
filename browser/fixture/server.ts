import { createApp, hostile } from './app';
import { renderJSONScript } from '../../src/yvee';

const build = await Bun.build({ entrypoints: [`${import.meta.dir}/client.tsx`], target: 'browser', format: 'esm' });
if (!build.success) throw new AggregateError(build.logs, 'Browser fixture build failed');
const client = await build.outputs[0]!.text();
const render = createApp().server();
Bun.serve({ hostname: '127.0.0.1', port: 3851, async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === '/health') return new Response('ok');
  if (url.pathname === '/client.js') return new Response(client, { headers: { 'content-type': 'text/javascript' } });
  if (url.pathname === '/gate') return new Response('released');
  if (url.pathname.startsWith('/style/')) return new Response('body { margin: 8px }', { headers: { 'content-type': 'text/css' } });
  const nonce = url.searchParams.has('csp') ? crypto.randomUUID() : undefined;
  const html = await render({ url, ...(nonce ? { nonce } : {}) });
  return new Response(html.replace('</head>', `${renderJSONScript({ text: hostile }, { id: 'bootstrap', ...(nonce ? { nonce } : {}) })}<script type="module" src="/client.js"${nonce ? ` nonce="${nonce}"` : ''}></script></head>`), { headers: { 'content-type': 'text/html', ...(nonce ? { 'content-security-policy': `default-src 'self'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; style-src-elem 'self' 'nonce-${nonce}'` } : {}) } });
} });

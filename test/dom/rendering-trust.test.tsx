import { describe, it, expect } from 'bun:test';
import { dom, DOM } from '../../src/dom/render/node.dom';
import { renderDom } from '../../src/dom/dom.dom';
import { Idm } from '../../src/dom/render/idm.dom';
import { validateAttribute, inlineContent } from '../../src/dom/render/trust.dom';
import { Yvee, Page, serializePayload, renderJSONScript } from '../../src/yvee';

async function renderHead(head: Parameters<Yvee['head']>[0], nonce?: string) {
  const app = new Yvee();
  app.head(head);
  app.route('/')(Page);
  return app.server()({ url: '/', ...(nonce === undefined ? {} : { nonce }) });
}

describe('rendering trust boundaries', () => {
  it('escapes untrusted text, attribute values and generated ID seeds', async () => {
    const payload = '\"><img src=x onerror=alert(1)>';
    const html = (await renderDom(new DOM('p', { title: payload, on: { click() {} } }, [payload]), payload)).ctx;
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('id="&quot;&gt;');
  });

  it('rejects executable URLs and attributes in DOM and head rendering', async () => {
    for (const value of ['javascript:alert(1)', 'JaVa\nScRiPt:alert(1)', 'vbscript:x', 'data:text/html,x']) {
      await expect(renderDom(new DOM('a', { href: value }, []))).rejects.toThrow('URL scheme');
      await expect(renderHead({ link: [{ href: value }] })).rejects.toThrow('URL scheme');
    }
    for (const key of ['onload', 'OnError', 'srcdoc']) {
      await expect(renderDom(new DOM('img', { [key]: 'x' }, []))).rejects.toThrow('Executable attribute');
      await expect(renderHead({ meta: [{ [key]: 'x' }] })).rejects.toThrow('Executable attribute');
    }
    await expect(renderHead({ meta: [{ 'x" onclick="x': 'x' }] })).rejects.toThrow('Invalid attribute');
    await expect(renderDom(new DOM('img', { onload: { x: 'x' } }, []))).rejects.toThrow('Executable attribute');
  });

  it('allows documented URL schemes and raster image data while rejecting SVG and data srcsets', () => {
    for (const value of ['/relative', '#anchor', '//example.com/x', 'https://example.com', 'mailto:a@b', 'tel:123']) {
      expect(() => validateAttribute('href', value)).not.toThrow();
    }
    expect(() => validateAttribute('src', 'data:image/png;base64,YQ==')).not.toThrow();
    expect(() => validateAttribute('src', 'data:image/svg+xml;base64,YQ==')).toThrow();
    expect(() => validateAttribute('srcset', '/a.png 1x, https://example.com/b.png 2x')).not.toThrow();
    expect(() => validateAttribute('srcset', '/a.png 1x, javascript:alert(1) 2x')).toThrow();
    expect(() => validateAttribute('srcset', 'data:image/png;base64,YQ==')).toThrow();
  });

  it('rejects HTML parser breakouts in both configured and TSX inline code', async () => {
    for (const value of ['</script><img src=x>', '</ScRiPt >', '<!--<script>']) {
      expect(() => inlineContent('script', value)).toThrow();
      await expect(renderHead({ script: [{ body: value }] })).rejects.toThrow('Unsafe inline');
      await expect(renderDom(new DOM('script', {}, [value]))).rejects.toThrow('Unsafe inline');
    }
    await expect(renderHead({ style: '</style><script>x</script>' })).rejects.toThrow('Unsafe inline');
    await expect(renderDom(new DOM('style', {}, ['</STYLE >']))).rejects.toThrow('Unsafe inline');
    const code = 'if (1 < 2 && 2 > 1) globalThis.ok = "yes";';
    expect((await renderDom(new DOM('script', {}, [code]))).ctx).toContain(code);
  });

  it('round trips nested bootstrap JSON and prevents closing its script', () => {
    const value = { text: '</script><script>alert("x")</script>&\u2028\u2029', nested: [{ x: '<>' }] };
    const json = serializePayload(value);
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual(value);
    expect(renderJSONScript(value, { id: '"><x>', nonce: 'a"b' })).toContain('nonce="a&quot;b"');
    for (const unsupported of [undefined, { x: undefined }, { x: BigInt(1) }, { x: () => 1 }, NaN]) {
      expect(() => serializePayload(unsupported)).toThrow();
    }
    const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
    expect(() => serializePayload(cyclic)).toThrow();
  });

  it('propagates response nonces through configured and nested TSX scripts/styles', async () => {
    const elements = [await dom('script', {}, 'globalThis.ok = true'), await dom('style', {}, 'body { color: red }')];
    const html = await renderHead({ script: [{ body: '1', nonce: 'wrong' }], js: '/app.js', style: 'p {}', elements }, 'request-nonce');
    // Five scripts (default client entry, configured inline script, app.js,
    // nested TSX script, bootstrap JSON) and two styles (configured plus TSX).
    expect(html.match(/<script[^>]*nonce="request-nonce"/g)).toHaveLength(5);
    expect(html.match(/<style[^>]*nonce="request-nonce"/g)).toHaveLength(2);
    expect(html.match(/nonce="request-nonce"/g)).toHaveLength(7);
    expect(html).toContain('<script type="module" src="./index.js" nonce="request-nonce"');
    expect(html).toContain('<script nonce="request-nonce"');
    expect(html).toContain('<script src="/app.js" nonce="request-nonce"');
    expect(html).toContain('<script data-yv="root" nonce="request-nonce">globalThis.ok = true</script>');
    expect(html).toContain('<script type="application/json" id="ssr" nonce="request-nonce"');
    expect(html).toContain('<style nonce="request-nonce" data-yv="root">p {}</style>');
    expect(html).toContain('<style data-yv="root" nonce="request-nonce">body { color: red }</style>');
    expect(html).not.toContain('nonce="wrong"');
    const body = await renderDom(new DOM('main', {}, elements), new Idm('root', 0, 'body-nonce'));
    expect(body.ctx.match(/nonce="body-nonce"/g)).toHaveLength(2);
  });
});

it('assigns binding IDs to void elements with reactive attributes', async () => {
  const { State } = await import('../../src/core/core.core');
  const rendered = await renderDom(new DOM('meta', { name: 'description', content: State('text') }, []), 'head-root');
  expect(rendered.ctx).toContain('id="head-root-0"');
  expect(rendered.oz.keys).toEqual(['head-root-0']);
});

it('uses the same attribute policy in browser helpers and keeps insert.text literal', async () => {
  const { Elem } = await import('../../src/$/element/element.$');
  const attributes = new Map<string, string>();
  let literal = '';
  const element = new Elem({
    setAttribute(name: string, value: string) { attributes.set(name, value); },
    insertAdjacentText(_position: string, text: string) { literal += text; },
  } as unknown as HTMLElement);
  element.attr.set({ href: '/safe?x=1&y=2', title: '<img src=x>' });
  expect(attributes.get('title')).toBe('<img src=x>');
  expect(() => element.attr.set({ href: 'javascript:alert(1)' })).toThrow();
  expect(attributes.get('href')).toBe('/safe?x=1&y=2');
  expect(() => element.attr.set({ onclick: 'alert(1)' })).toThrow();
  element.insert('beforeend').text('<img src=x>');
  expect(literal).toBe('<img src=x>');
});

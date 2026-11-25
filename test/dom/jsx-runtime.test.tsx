import { describe, expect, it } from "bun:test";
import { renderDom } from "../../src/dom/dom.dom";
import type { DOMContext } from "../../src/dom/dom.dom";

/**
 * This file intentionally imports no `dom`/`frag`/`jsx` helpers: the JSX here
 * must compile through the automatic runtime (`tsconfig.json` →
 * `jsxImportSource: "yvee"` → `yvee/jsx-runtime`).
 */

function Card(props: { title: string }, ...children: DOMContext[]) {
  return (
    <section data-component="card">
      <h2>{props.title}</h2>
      {children}
    </section>
  );
}

describe("automatic JSX runtime", () => {
  it("renders intrinsics, components, fragments and keyed lists without helper imports", async () => {
    const items = ["alpha", "beta"];

    const rendered = await renderDom(
      <>
        <div class="outer" data-kind="root">
          text
        </div>
        <Card title="Greeting">
          <p>Body</p>
        </Card>
        <ul>
          {items.map((item) => (
            <li key={item} data-item={item}>
              {item}
            </li>
          ))}
        </ul>
      </>,
    );

    expect(rendered.ctx).toBe(
      '<div class="outer" data-kind="root">text</div>' +
        '<section data-component="card"><h2>Greeting</h2><p>Body</p></section>' +
        '<ul><li data-item="alpha" key="alpha">alpha</li><li data-item="beta" key="beta">beta</li></ul>',
    );
    // Classic JSX keeps `key` in the attribute object; the runtime preserves
    // that shape, so keys serialize like any other attribute.
    expect(rendered.ctx.match(/key=/g)).toHaveLength(2);
  });

  it("forwards a single expression child and explicit undefined attributes", async () => {
    const child = "single";

    const rendered = await renderDom(
      <span class={undefined} title="only">
        {child}
      </span>,
    );

    expect(rendered.ctx).toBe('<span title="only">single</span>');
  });
});

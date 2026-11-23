import { describe, expect, it } from "bun:test";
import { dom, renderDom } from "../../src/dom/dom.dom";
import type { DOMContext } from "../../src/dom/dom.dom";

describe("explicitly undefined JSX attributes", () => {
  it("renders the same markup as absent attributes", async () => {
    const absent = await renderDom(<button title="Go">Go</button>);
    const explicit = await renderDom(
      <button
        class={undefined}
        disabled={undefined}
        id={undefined}
        title="Go"
        data-phase={undefined}
        on={undefined}
        ref={undefined}
        style={undefined}
      >
        Go
      </button>,
    );

    expect(explicit.ctx).toBe(absent.ctx);
    expect(explicit.ctx).not.toContain("undefined");
  });

  it("forwards optional props and rest-args children through a component", async () => {
    const present = await renderDom(
      <FancyButton disabled={false}>Save</FancyButton>,
    );
    const omitted = await renderDom(<FancyButton>Save</FancyButton>);
    const explicit = await renderDom(
      <FancyButton disabled={undefined}>Save</FancyButton>,
    );

    expect(explicit.ctx).toBe(omitted.ctx);
    expect(explicit.ctx).toBe(present.ctx);
    expect(explicit.ctx).toContain("Save");
  });
});

function FancyButton(
  props: { disabled?: boolean | undefined },
  ...children: DOMContext[]
) {
  return <button disabled={props.disabled}>{children}</button>;
}

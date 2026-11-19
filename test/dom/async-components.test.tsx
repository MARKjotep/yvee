import { describe, expect, it } from "bun:test";
import { dom, renderDom } from "../../src/dom/dom.dom";

async function CustomFunction() {
  await Promise.resolve();
  return dom("span", {}, "async child");
}

describe("async DOM components", () => {
  it("awaits an async component nested inside an intrinsic element", async () => {
    const rendered = await renderDom(
      <div>
        <CustomFunction></CustomFunction>
      </div>,
    );

    expect(rendered.ctx).toBe("<div><span>async child</span></div>");
  });
});

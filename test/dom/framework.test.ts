import { afterEach, beforeEach, describe, expect, it } from "bun:test";

class TestElement extends EventTarget {
  isConnected = true;
  innerHTML = "";
  readonly style = {
    setProperty: (_name: string, _value: string) => undefined,
  };

  constructor(public id: string) {
    super();
  }
}

const mountedElements = new Map<string, TestElement>();
const testWindow = new EventTarget() as EventTarget & {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
};
testWindow.requestAnimationFrame = (callback) =>
  setTimeout(() => callback(Date.now()), 0) as unknown as number;
const testDocument = new EventTarget() as EventTarget & {
  getElementById: (id: string) => TestElement | null;
};
testDocument.getElementById = (id) => mountedElements.get(id) ?? null;

const globalNames = ["Element", "HTMLElement", "window", "document"] as const;
const previousGlobals = new Map(
  globalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
);

const installTestBrowser = () => {
  Object.assign(globalThis, {
    Element: TestElement,
    HTMLElement: TestElement,
    window: testWindow,
    document: testDocument,
  });
};

const restoreGlobals = () => {
  for (const name of globalNames) {
    const descriptor = previousGlobals.get(name);
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
};

installTestBrowser();

const { Elem } = await import("../../src/$/element/element.$");
const { $, getElementById } = await import("../../src/$/query.$");
const { Ref, RefState } = await import("../../src/core/ref.core");
const { RecState, State, Stateful } = await import("../../src/core/state/stateful.core");
const { dom, renderDom } = await import("../../src/dom/dom.dom");
const { Idm } = await import("../../src/dom/render/idm.dom");
const { CATT } = await import("../../src/dom/render/cat.dom");
const { OZ } = await import("../../src/dom/render/oz.dom");
const { Wizard } = await import("../../src/dom/render/oz.dom");
restoreGlobals();

beforeEach(() => {
  mountedElements.clear();
  installTestBrowser();
});
afterEach(restoreGlobals);

const connectRenderedElements = (ids: string[]) => {
  for (const id of ids) mountedElements.set(id, new TestElement(id));
};

describe("framework basics", () => {
  it("updates State values", () => {
    const count = State(0);

    count.value = 1;

    expect(count.value).toBe(1);
  });

  it("unloads state event subscriptions when their owning element is reset", async () => {
    const state = new Stateful(0);
    const seen: number[] = [];
    const catt = new CATT("state-owner");
    catt.setId("state-owner");
    catt.states.push(state.call(function (value: number) { seen.push(value); }, "event-state"));
    const oz = new OZ().set(catt);
    mountedElements.set("state-owner", new TestElement("state-owner"));

    await oz.stage();
    state.value = 1;
    await state.flush();
    expect(seen).toEqual([1]);

    oz.reset(["state-owner"]);
    state.value = 2;
    await state.flush();
    expect(seen).toEqual([1]);
  });

  it("deletes falsey values from record state", () => {
    const state = RecState({ enabled: false, count: 0 });

    state.delete("enabled");

    expect(Object.hasOwn(state.value, "enabled")).toBe(false);
    expect(state.value.count).toBe(0);
  });

  it("stores and preserves the identity of an element in Ref", () => {
    const ref = new Ref<Element>();
    const element = new TestElement("ref-target") as unknown as Element;

    ref.element = element;

    expect(ref.element).toBe(element);
    expect(ref.$).toBe(element);
    expect(ref.state.value).toBe(element);
    expect(ref.state.clone).toBe(element);
  });

  it("emits an updated event from RefState", () => {
    const state = new RefState(0);
    let detail = -1;
    state.addEventListener("updated", (event) => {
      detail = (event as CustomEvent<number>).detail;
    });

    state.value = 2;

    expect(detail).toBe(2);
  });

  it("registers and receives a native event listener", () => {
    const target = new EventTarget();
    const element = new Elem(target as unknown as HTMLElement);
    let received = false;

    element.on("click", () => {
      received = true;
    });
    target.dispatchEvent(new Event("click"));

    expect(received).toBe(true);
  });

  it("wraps an element passed directly to the selector", () => {
    const element = new TestElement("direct-target");

    expect($(element as unknown as HTMLElement)?.e).toBe(
      element as unknown as HTMLElement,
    );
  });

  it("resolves mounted element ids", () => {
    const element = new TestElement("mounted-target");
    mountedElements.set(element.id, element);

    expect(getElementById(element.id)).toBe(element as unknown as HTMLElement);
  });

  it("preserves hyphenated ID seeds without collisions", () => {
    const main = new Idm("app-main");
    const footer = new Idm("app-footer");

    expect(main.nextId).toBe("app-main-0");
    expect(footer.nextId).toBe("app-footer-0");
  });

  it("resumes an ID sequence from a generated ID", () => {
    const resumed = Idm.fromId("app-root-3");

    expect(resumed.nextId).toBe("app-root-3");
    expect(resumed.nextId).toBe("app-root-4");
  });

  it("renders nested DOM nodes through renderDom", async () => {
    const nested = await dom(
      "main",
      { class: "root" },
      dom("section", { class: "child" }, "nested content"),
    );

    const rendered = await renderDom(nested);

    expect(rendered.ctx).toBe(
      '<main class="root"><section class="child">nested content</section></main>',
    );
  });

  it("keeps a parent element's generated ID when it contains stateful content", async () => {
    const child = State(await dom("span", {}, "stateful child"));
    const tree = await dom("main", { class: "root" }, child);

    const rendered = await renderDom(tree, "body-root");

    expect(rendered.ctx).toBe(
      '<main class="root" id="body-root-0"><span>stateful child</span></main>',
    );
  });

  it("reuses the server root ID when rendering the same tree on the client", async () => {
    const tree = await dom(
      "button",
      { on: { click() {} } },
      "same tree",
    );
    const server = await renderDom(tree, "app-root");
    const client = await renderDom(tree, server.id!);

    expect(server.id).toBe("app-root-0");
    expect(client.ctx).toBe(server.ctx);
    expect(client.oz.keys).toEqual(server.oz.keys);
  });

  it("updates mounted content from State and cleans up on removal", async () => {
    const count = State(3);
    const tree = await dom("span", {}, count);
    const rendered = await renderDom(tree);
    const stateIds = rendered.oz.keys;

    connectRenderedElements(stateIds);
    await Wizard.RPS(rendered.oz);

    const element = mountedElements.get(stateIds[0]!)!;
    count.value = 4;
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(element.innerHTML).toContain("4");

    element.isConnected = false;
    await Wizard.RPS();
    element.innerHTML = "removed";
    count.value = 5;
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(element.innerHTML).toBe("removed");
  });

  it("registers mounted listeners and removes them when the node disconnects", async () => {
    let clicks = 0;
    const tree = await dom(
      "button",
      { on: { click() { clicks += 1; } } },
      "click",
    );
    const rendered = await renderDom(tree);

    connectRenderedElements(rendered.oz.keys);
    await Wizard.RPS(rendered.oz);

    const element = mountedElements.get(rendered.id!)!;
    element.dispatchEvent(new Event("click"));
    expect(clicks).toBe(1);

    element.isConnected = false;
    await Wizard.RPS();
    element.dispatchEvent(new Event("click"));
    expect(clicks).toBe(1);
  });
});

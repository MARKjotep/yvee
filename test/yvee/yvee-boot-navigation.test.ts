import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import type { PageLoad } from "../../src/yvee/client/load-page";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";

/**
 * Minimal element stand-in: the navigation listener only needs `closest`,
 * `href`, `target` and `hasAttribute`.
 */
class FakeElement {
  href = "";
  target = "";
  id = "";
  download = false;
  dataset: Record<string, string | undefined> = {};
  style: Record<string, string> = {};

  constructor(private readonly app?: FakeElement) {}

  closest(selector: string) {
    if (selector === "a") return this.href ? this : null;
    if (selector === "[data-app]") return this.app ?? null;
    return null;
  }

  hasAttribute(name: string) {
    return name === "download" ? this.download : false;
  }

  scrollIntoView() { /* scroll assertions read the fake viewport instead. */ }
}

interface ClientInternals {
  mounted: boolean;
  booting: boolean;
  bootQueue: unknown;
  element: FakeElement | undefined;
  currentURL: YveeURL | undefined;
  history: RouteHistory;
  navigation: { options: { onPop(url: YveeURL, state: unknown): void } };
  resolveInitialPage(url: YveeURL): Promise<PageLoad>;
  watchURL(): Promise<() => void>;
  settleBoot(): void;
  transition(url: YveeURL, fromHistory?: boolean, scroll?: ScrollPosition): Promise<void>;
}

interface Entry { state: Record<string, unknown>; path: string; }

type Listener = (event: any) => void;

const GLOBALS = ["window", "location", "history", "requestAnimationFrame", "document", "Element"] as const;

const flush = async () => {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  await new Promise<void>(resolve => setTimeout(resolve, 0));
};

function harness(options: {
  initial?: string;
  load?: (url: YveeURL) => Promise<PageLoad>;
} = {}) {
  const originals = GLOBALS.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  const initial = options.initial ?? "/page";
  const address = new URL(`http://localhost${initial}`);
  const entries: Entry[] = [{ state: {}, path: initial }];
  const pushedPaths: string[] = [];
  const anchors = new Map<string, FakeElement>();
  const listeners = { click: new Set<Listener>(), popstate: new Set<Listener>() };
  let index = 0;

  const root = new FakeElement();
  root.id = "app";

  const viewport = {
    location: address,
    scrollX: 0,
    scrollY: 0,
    scrollTo(x: number, y: number) { this.scrollX = x; this.scrollY = y; },
    matchMedia: () => ({ matches: false }),
    addEventListener(type: string, handler: Listener) {
      if (type === "popstate") listeners.popstate.add(handler);
    },
    removeEventListener(type: string, handler: Listener) {
      if (type === "popstate") listeners.popstate.delete(handler);
    },
  };
  const historyMock = {
    scrollRestoration: "auto" as ScrollRestoration,
    get state() { return entries[index]!.state; },
    replaceState(state: Record<string, unknown>, _title?: string, path?: string) {
      entries[index]!.state = state;
      if (path !== undefined) entries[index]!.path = path;
    },
    pushState(state: Record<string, unknown>, _title: string, path: string) {
      entries.splice(index + 1);
      entries.push({ state, path });
      pushedPaths.push(path);
      index++;
    },
    back() { if (index > 0) index--; },
    forward() { if (index < entries.length - 1) index++; },
  };
  const body: { id: string; dataset: Record<string, string | undefined> } = { id: "", dataset: {} };
  const documentMock = {
    getElementById: (id: string) => anchors.get(id) ?? (id === root.id ? root : null),
    addEventListener(type: string, handler: Listener) {
      if (type === "click") listeners.click.add(handler);
    },
    removeEventListener(type: string, handler: Listener) {
      if (type === "click") listeners.click.delete(handler);
    },
    createElement: () => new FakeElement(),
    documentElement: { style: {} },
    body,
  };

  Object.assign(globalThis, {
    window: viewport,
    location: address,
    history: historyMock,
    requestAnimationFrame: (callback: FrameRequestCallback) => { callback(0); return 1; },
    document: documentMock,
    Element: FakeElement,
  });

  const url = State(toURL(initial));
  const rootState = State<unknown[]>([]);
  const loads: YveeURL[] = [];
  const transitions: YveeURL[] = [];
  const errors: unknown[] = [];
  const load = options.load ?? ((target: YveeURL): Promise<PageLoad> => Promise.resolve({
    kind: "ready" as const,
    status: 200,
    body: [],
    head: {},
    url: target,
  }));
  const runLoad = load;
  const client = new YveeClient({
    id: "boot-test",
    base: "/",
    useHistory: true,
    url,
    root: rootState,
    load: (target) => { loads.push(target); return load(target); },
    getHead: () => ({}),
    getLayout: () => undefined,
    onLoading: () => {},
    onError: (error) => { errors.push(error); },
    onUnmount: () => {},
  });
  const internal = client as unknown as ClientInternals;
  // Transitions are recorded rather than painted; the load is still exercised
  // so a queued navigation proves it reaches the page loader.
  internal.transition = async (target) => {
    transitions.push(target);
    await runLoad(target);
    loads.push(target);
  };

  let stopHook: (() => void) | undefined;
  const watch = async () => { stopHook = await internal.watchURL(); };

  /** Enter the boot window the way `mountAtRevision` does, before the initial load. */
  const beginBoot = () => {
    internal.mounted = true;
    internal.element = root;
    internal.booting = true;
    (internal as unknown as { navigation: { start(): void } }).navigation.start();
  };

  /** Simulate the boot commit: URL, history entry and the URL hook all settle. */
  const commitBoot = async () => {
    const target = toURL(initial);
    internal.currentURL = target;
    url.value = target;
    internal.history.initialize(target);
    await watch();
  };

  /** Leave the boot window exactly where `mountAtRevision` does. */
  const settle = async () => {
    internal.settleBoot();
    await flush();
  };

  const click = (
    href: string,
    init: {
      button?: number;
      metaKey?: boolean;
      ctrlKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
      target?: string;
    } = {},
  ) => {
    const anchor = new FakeElement(root);
    anchor.href = href;
    anchor.target = init.target ?? "";
    const event = {
      defaultPrevented: false,
      button: init.button ?? 0,
      metaKey: init.metaKey ?? false,
      ctrlKey: init.ctrlKey ?? false,
      shiftKey: init.shiftKey ?? false,
      altKey: init.altKey ?? false,
      target: anchor,
      preventDefault() { this.defaultPrevented = true; },
    };
    for (const handler of [...listeners.click]) handler(event);
    return event;
  };

  const pop = (href: string, state: unknown = {}) => {
    address.href = `http://localhost${href}`;
    for (const handler of [...listeners.popstate]) handler({ state });
  };

  const restore = () => {
    stopHook?.();
    GLOBALS.forEach((name, i) => {
      const descriptor = originals[i];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  };

  return {
    client, internal, url, root, rootState, loads, transitions, errors, anchors,
    viewport, entries, pushedPaths, listeners, beginBoot, commitBoot, settle,
    click, pop, watch, restore,
  };
}

describe("boot-window navigation", () => {
  it("queues and prevents an in-app click while the initial page loads", async () => {
    const h = harness();
    try {
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));

      const event = h.click("/about");

      expect(event.defaultPrevented).toBe(true);
      expect(h.pushedPaths).toEqual([]);
      expect(h.loads.map(url => url.path)).toEqual(["/page"]);
      expect(h.url.value.path).toBe("/page");
      expect(h.transitions).toEqual([]);

      await h.commitBoot();
      await h.settle();

      expect(h.transitions.map(url => url.path)).toEqual(["/about"]);
      expect(h.loads.map(url => url.path)).toEqual(["/page", "/about"]);
      expect(h.pushedPaths).toEqual(["/about"]);
      expect(h.url.value.path).toBe("/about");
    } finally { h.restore(); }
  });

  it("drops a click that targets the URL being hydrated", async () => {
    const h = harness();
    try {
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));

      const event = h.click("/page");

      expect(event.defaultPrevented).toBe(true);
      expect(h.internal.bootQueue).toBeUndefined();

      await h.commitBoot();
      await h.settle();

      expect(h.loads.map(url => url.path)).toEqual(["/page"]);
      expect(h.transitions).toEqual([]);
      expect(h.pushedPaths).toEqual([]);
    } finally { h.restore(); }
  });

  it("queues a popstate during boot and replays it through the pop path", async () => {
    const h = harness();
    try {
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));

      h.pop("/other", { moved: true });
      await flush();

      expect(h.transitions).toEqual([]);
      expect(h.url.value.path).toBe("/page");
      expect(h.internal.currentURL).toBeUndefined();

      await h.commitBoot();
      await h.settle();

      expect(h.transitions.map(url => url.path)).toEqual(["/other"]);
      expect(h.url.value.path).toBe("/other");
      expect(h.internal.currentURL?.path).toBe("/page");
    } finally { h.restore(); }
  });

  it("applies only the last of several clicks made during boot", async () => {
    const h = harness();
    try {
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));

      h.click("/one");
      h.click("/two");
      await h.commitBoot();
      await h.settle();

      expect(h.transitions.map(url => url.path)).toEqual(["/two"]);
      expect(h.loads.map(url => url.path)).toEqual(["/page", "/two"]);
    } finally { h.restore(); }
  });

  it("leaves external links native during boot", async () => {
    const h = harness();
    try {
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));

      const event = h.click("https://example.com/away");

      expect(event.defaultPrevented).toBe(false);
      expect(h.internal.bootQueue).toBeUndefined();

      await h.commitBoot();
      await h.settle();

      expect(h.transitions).toEqual([]);
    } finally { h.restore(); }
  });

  it("leaves modified and targeted clicks native during boot", async () => {
    const h = harness();
    try {
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));

      expect(h.click("/meta", { metaKey: true }).defaultPrevented).toBe(false);
      expect(h.click("/middle", { button: 1 }).defaultPrevented).toBe(false);
      expect(h.click("/blank", { target: "_blank" }).defaultPrevented).toBe(false);
      expect(h.internal.bootQueue).toBeUndefined();
    } finally { h.restore(); }
  });

  it("clears the queue and detaches listeners when boot fails", async () => {
    let rejectLoad!: (error: unknown) => void;
    const h = harness({
      load: () => new Promise<PageLoad>((_resolve, reject) => { rejectLoad = reject; }),
    });
    try {
      const mounting = h.client.mount({ id: "app" });

      // Interception is attached before the initial load can resolve.
      expect(h.listeners.click.size).toBe(1);
      expect(h.listeners.popstate.size).toBe(1);
      expect(h.internal.booting).toBe(true);

      expect(h.click("/about").defaultPrevented).toBe(true);
      expect(h.internal.bootQueue).toBeDefined();

      rejectLoad(new Error("boot failed"));
      await expect(mounting).rejects.toThrow("boot failed");

      expect(h.internal.bootQueue).toBeUndefined();
      expect(h.internal.booting).toBe(false);
      expect(h.listeners.click.size).toBe(0);
      expect(h.listeners.popstate.size).toBe(0);

      await flush();
      expect(h.transitions).toEqual([]);
      expect(h.loads.map(url => url.path)).toEqual(["/page"]);
    } finally { h.restore(); }
  });

  it("runs normal hash navigation after the boot window closes", async () => {
    const h = harness();
    try {
      h.anchors.set("here", new FakeElement());
      h.beginBoot();
      await h.internal.resolveInitialPage(toURL("/page"));
      await h.commitBoot();
      await h.settle();

      h.client.navigate("/page#here");
      await flush();

      expect(h.pushedPaths).toEqual(["/page#here"]);
      expect(h.url.value.hash).toBe("#here");
      expect(h.transitions).toEqual([]);
    } finally { h.restore(); }
  });
});

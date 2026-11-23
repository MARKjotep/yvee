import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { RouteScroll } from "../../src/yvee/client/runtime/scroll";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";

interface ClientInternals {
  mounted: boolean;
  currentURL: YveeURL | undefined;
  revision: number;
  pendingNavigation: unknown;
  activeLoad: AbortController | undefined;
  history: RouteHistory;
  scroll: RouteScroll;
  watchURL(): Promise<() => void>;
  transition(url: YveeURL, fromHistory?: boolean, scroll?: ScrollPosition): Promise<void>;
}

interface Entry { state: Record<string, unknown>; path: string; }

interface Viewport {
  location: URL;
  scrollX: number;
  scrollY: number;
  scrollTo(x: number, y: number): void;
  matchMedia(query: string): { matches: boolean };
}

interface Anchor { scrollIntoView(): void; }

const GLOBALS = ["window", "location", "history", "requestAnimationFrame", "document"] as const;

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

function harness(options: { protocol?: string; useHistory?: boolean } = {}) {
  const originals = GLOBALS.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  const address = new URL(options.protocol === "file:" ? "file:///page" : "http://localhost/page");
  const entries: Entry[] = [{ state: {}, path: "/page" }];
  const pushedPaths: string[] = [];
  const anchors = new Map<string, Anchor>();
  let index = 0;
  const viewport: Viewport = {
    location: address,
    scrollX: 0,
    scrollY: 0,
    scrollTo(x: number, y: number) { this.scrollX = x; this.scrollY = y; },
    matchMedia: () => ({ matches: false }),
  };
  const historyMock = {
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
  };
  Object.assign(globalThis, {
    window: viewport,
    location: address,
    history: historyMock,
    requestAnimationFrame: (callback: FrameRequestCallback) => { callback(0); return 1; },
    document: {
      getElementById: (id: string) => anchors.get(id) ?? null,
      documentElement: { style: {} },
    },
  });

  const url = State(toURL("/page"));
  const root = State<unknown[]>([]);
  const loads: YveeURL[] = [];
  const transitions: YveeURL[] = [];
  const client = new YveeClient({
    id: "hash-test",
    base: "/",
    useHistory: options.useHistory ?? true,
    url,
    root,
    load: (target) => {
      loads.push(target);
      return Promise.resolve({ kind: "ready" as const, status: 200, body: [], head: {}, url: target });
    },
    getHead: () => ({}),
    getLayout: () => undefined,
    onLoading: () => {},
    onUnmount: () => {},
  });
  const internal = client as unknown as ClientInternals;
  internal.mounted = true;
  internal.currentURL = toURL("/page");
  internal.history.initialize(toURL("/page"));
  internal.transition = async (target) => { transitions.push(target); };
  let stopHook: (() => void) | undefined;

  const start = async () => { stopHook = await internal.watchURL(); };
  const restore = () => {
    stopHook?.();
    GLOBALS.forEach((name, i) => {
      const descriptor = originals[i];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  };
  const pop = async (target: YveeURL) => {
    const scroll = internal.history.pop(target, historyMock.state);
    internal.currentURL = target;
    await internal.scroll.restoreScroll(scroll, internal.revision, target);
  };

  return {
    client, internal, url, root, loads, transitions, viewport, entries, anchors,
    historyMock, pushedPaths, start, restore, pop,
    setIndex(next: number) { index = next; },
  };
}

describe("hash-only navigation", () => {
  it("scrolls to the anchor without loading the page", async () => {
    const h = harness();
    try {
      h.anchors.set("here", { scrollIntoView() { h.viewport.scrollY = 900; } });
      h.viewport.scrollY = 300;
      const root = h.root.value;
      await h.start();

      h.client.navigate("/page#here");
      await flush();

      expect(h.loads).toHaveLength(0);
      expect(h.transitions).toHaveLength(0);
      expect(h.pushedPaths).toEqual(["/page#here"]);
      expect(h.viewport.scrollY).toBe(900);
      expect(h.url.value.hash).toBe("#here");
      expect(h.internal.currentURL?.hash).toBe("#here");
      expect(h.internal.pendingNavigation).toBeUndefined();
      expect(h.internal.activeLoad).toBeUndefined();
      expect(h.root.value).toBe(root);
    } finally { h.restore(); }
  });

  it("keeps Back and Forward working with their saved scroll positions", async () => {
    const h = harness();
    try {
      h.anchors.set("here", { scrollIntoView() { h.viewport.scrollY = 900; } });
      h.viewport.scrollY = 300;
      await h.start();

      h.client.navigate("/page#here");
      await flush();
      expect(h.viewport.scrollY).toBe(900);

      // Native Back moves history before the runtime sees popstate.
      h.setIndex(0);
      await h.pop(toURL("/page"));
      expect(h.viewport.scrollY).toBe(300);

      h.setIndex(1);
      await h.pop(toURL("/page#here"));
      expect(h.viewport.scrollY).toBe(900);
    } finally { h.restore(); }
  });

  it("falls back to the saved or top position when the anchor is missing", async () => {
    const h = harness();
    try {
      h.viewport.scrollY = 300;
      await h.start();

      h.client.navigate("/page#missing");
      await flush();

      expect(h.pushedPaths).toEqual(["/page#missing"]);
      expect(h.viewport.scrollY).toBe(0);
      expect(h.loads).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("still runs a full transition when the search string differs", async () => {
    const h = harness();
    try {
      await h.start();

      h.client.navigate("/page?q=1#here");
      await flush();

      expect(h.transitions).toHaveLength(1);
      expect(h.transitions[0]!.search).toBe("?q=1");
      expect(h.transitions[0]!.hash).toBe("#here");
      expect(h.loads).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("falls back to a normal navigation while a load is in flight", async () => {
    const h = harness();
    try {
      h.anchors.set("here", { scrollIntoView() { h.viewport.scrollY = 900; } });
      await h.start();
      h.internal.activeLoad = new AbortController();

      h.client.navigate("/page#here");
      await flush();

      expect(h.transitions).toHaveLength(1);
      expect(h.transitions[0]!.hash).toBe("#here");
      expect(h.viewport.scrollY).toBe(0);
    } finally { h.restore(); }
  });

  it("ignores a navigation to the identical URL", async () => {
    const h = harness();
    try {
      await h.start();

      h.client.navigate("/page");
      await flush();

      expect(h.pushedPaths).toEqual([]);
      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("scrolls without the history API on the file protocol", async () => {
    const h = harness({ protocol: "file:" });
    try {
      h.anchors.set("here", { scrollIntoView() { h.viewport.scrollY = 900; } });
      h.viewport.scrollY = 300;
      await h.start();

      h.client.navigate("/page#here");
      await flush();

      expect(h.pushedPaths).toEqual([]);
      expect(h.viewport.scrollY).toBe(900);
      expect(h.url.value.hash).toBe("#here");
      expect(h.loads).toHaveLength(0);
    } finally { h.restore(); }
  });
});

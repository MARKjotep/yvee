import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { RouteScroll } from "../../src/yvee/client/runtime/scroll";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import type { PageLoad } from "../../src/yvee/client/load-page";
import { renderRegion } from "../../src/yvee/client/regions";
import { Page } from "../../src/yvee/pages/page";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";

class RegionPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  log: string[] = [];
  moduleLoads = new Map<string, number>();

  override regions = {
    overview: async () => {
      this.moduleLoads.set("overview", (this.moduleLoads.get("overview") ?? 0) + 1);
      return {
        default: ({ page }: { page: Page }) => {
          page.regionResources.defer(() => this.log.push("dispose:overview"));
          return `Overview:${page.region.value}`;
        },
      };
    },
    analytics: async () => {
      this.moduleLoads.set("analytics", (this.moduleLoads.get("analytics") ?? 0) + 1);
      return {
        default: ({ page }: { page: Page }) => {
          page.regionResources.defer(() => this.log.push("dispose:analytics"));
          return `Analytics:${page.region.value}`;
        },
      };
    },
    settings: async () => {
      this.moduleLoads.set("settings", (this.moduleLoads.get("settings") ?? 0) + 1);
      return {
        default: ({ page }: { page: Page }) => {
          page.regionResources.defer(() => this.log.push("dispose:settings"));
          return `Settings:${page.region.value}`;
        },
      };
    },
  };

  override body() { return this.regionContent; }
}

interface ClientInternals {
  mounted: boolean;
  booting: boolean;
  bootQueue: unknown;
  currentURL: YveeURL | undefined;
  activePage: Page | undefined;
  revision: number;
  pendingNavigation: unknown;
  activeLoad: AbortController | undefined;
  history: RouteHistory;
  scroll: RouteScroll;
  navigation: { options: { onPop(url: YveeURL, state: unknown): void } };
  watchURL(): Promise<() => void>;
  settleBoot(): void;
  transition(url: YveeURL, fromHistory?: boolean, scroll?: ScrollPosition): Promise<void>;
}

interface Entry { state: Record<string, unknown>; path: string; }
interface Replaced { state: Record<string, unknown>; path: string | undefined; }

interface Viewport {
  location: URL;
  scrollX: number;
  scrollY: number;
  scrollTo(x: number, y: number): void;
  matchMedia(query: string): { matches: boolean };
}

const GLOBALS = ["window", "location", "history", "requestAnimationFrame", "document"] as const;

const flush = async () => {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  await new Promise<void>(resolve => setTimeout(resolve, 0));
};

function harness(page: Page, initial = "/page?tab=overview") {
  const originals = GLOBALS.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  const address = new URL(`http://localhost${initial}`);
  const entries: Entry[] = [{
    state: { path: initial, scroll: { x: 0, y: 120 }, yveeScrollEntry: "e0" },
    path: initial,
  }];
  const pushedPaths: string[] = [];
  const replaceStates: Replaced[] = [];
  const scrolled: string[] = [];
  const anchors = new Map<string, { scrollIntoView(): void }>();
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
      replaceStates.push({ state, path });
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

  const url = State(toURL(initial));
  const root = State<unknown[]>([]);
  const loads: YveeURL[] = [];
  const transitions: YveeURL[] = [];
  const errors: unknown[] = [];
  const client = new YveeClient({
    id: "region-fastpath-test",
    base: "/",
    useHistory: true,
    url,
    root,
    load: (target) => {
      loads.push(target);
      return Promise.resolve<PageLoad>({
        kind: "ready" as const,
        status: 200,
        body: [],
        head: {},
        url: target,
        page,
      });
    },
    getHead: () => ({}),
    getLayout: () => undefined,
    onLoading: () => {},
    onError: (error) => { errors.push(error); },
    onUnmount: () => {},
  });
  const internal = client as unknown as ClientInternals;
  internal.mounted = true;
  internal.activePage = page;
  internal.currentURL = toURL(initial);
  internal.history.initialize(toURL(initial));
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
  const pop = (target: YveeURL) => {
    internal.navigation.options.onPop(target, entries[index]!.state);
  };
  const anchor = (id: string, y: number) => {
    anchors.set(id, {
      scrollIntoView() {
        scrolled.push(id);
        viewport.scrollY = y;
      },
    });
  };

  return {
    client, internal, url, root, loads, transitions, errors, viewport, entries,
    pushedPaths, replaceStates, scrolled, historyMock, start, restore, pop,
    anchor, anchors,
    setIndex(next: number) { index = next; },
    currentIndex() { return index; },
  };
}

async function primeRegion(page: RegionPage, id: "overview" | "analytics" | "settings") {
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
}

describe("region and hash fast paths", () => {
  it("applies a region swap with an anchor without a page transition", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      h.anchor("x", 900);
      await h.start();

      h.client.navigate("/page?tab=settings#x");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(h.errors).toHaveLength(0);
      expect(h.pushedPaths).toEqual(["/page?tab=settings#x"]);
      expect(page.region.value).toBe("settings");
      expect(page.regionContent.value).toBe("Settings:settings");
      expect(h.scrolled).toEqual(["x"]);
      expect(h.viewport.scrollY).toBe(900);
      expect(h.url.value.search).toBe("?tab=settings");
      expect(h.url.value.hash).toBe("#x");
      expect(h.internal.currentURL?.search).toBe("?tab=settings");
      expect(h.internal.currentURL?.hash).toBe("#x");
      expect(h.internal.pendingNavigation).toBeUndefined();
      expect(h.internal.activeLoad).toBeUndefined();
    } finally { h.restore(); }
  });

  it("applies a region swap and anchor scroll for a mixed Back/Forward pop", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page, "/page?tab=overview#y");
    try {
      h.anchor("x", 900);
      h.anchor("y", 50);
      await h.start();

      h.client.navigate("/page?tab=analytics#x");
      await flush();
      expect(page.region.value).toBe("analytics");
      expect(h.scrolled).toEqual(["x"]);

      // Native Back moves history before popstate fires.
      h.setIndex(0);
      h.pop(toURL("/page?tab=overview#y"));
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(h.errors).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(h.scrolled).toEqual(["x", "y"]);
      expect(h.viewport.scrollY).toBe(50);
      expect(h.url.value.hash).toBe("#y");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
    } finally { h.restore(); }
  });

  it("scrolls only for a hash-only pop without touching history or the region", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page, "/page?tab=overview#a");
    try {
      h.anchor("a", 10);
      h.anchor("b", 800);
      await h.start();

      h.client.navigate("/page?tab=overview#b");
      await flush();
      expect(h.scrolled).toEqual(["b"]);
      const before = h.entries.map(entry => entry.path);

      // Native Back moves history before popstate fires.
      h.setIndex(0);
      h.pop(toURL("/page?tab=overview#a"));
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(h.errors).toHaveLength(0);
      expect(h.scrolled).toEqual(["b", "a"]);
      expect(h.viewport.scrollY).toBe(10);
      expect(h.url.value.hash).toBe("#a");
      expect(h.internal.currentURL?.hash).toBe("#a");
      expect(h.entries.map(entry => entry.path)).toEqual(before);
      expect(h.currentIndex()).toBe(0);
      expect(page.region.value).toBe("overview");
      expect(page.moduleLoads.get("analytics")).toBeUndefined();
      expect(page.log).toEqual([]);
    } finally { h.restore(); }
  });

  it("canonicalizes an unknown region id while keeping the displayed default region", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=bogus");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(page.moduleLoads.get("overview")).toBe(1);
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=overview");
      expect(h.replaceStates[h.replaceStates.length - 1]!.path).toBe("/page?tab=overview");
    } finally { h.restore(); }
  });

  it("falls back to the default region and canonicalizes from a non-default region", async () => {
    const page = new RegionPage();
    await primeRegion(page, "analytics");
    const h = harness(page, "/page?tab=analytics");
    try {
      await h.start();

      h.client.navigate("/page?tab=bogus");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(page.log).toEqual(["dispose:analytics"]);
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=overview");
    } finally { h.restore(); }
  });

  it("still restores page scroll for a pure region pop", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.viewport.scrollY = 120;

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(page.region.value).toBe("analytics");
      h.viewport.scrollY = 400;

      h.setIndex(0);
      h.pop(toURL("/page?tab=overview"));
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.scrolled).toEqual([]);
      expect(page.region.value).toBe("overview");
      expect(h.viewport.scrollY).toBe(120);
    } finally { h.restore(); }
  });

  it("queues a mixed region click during boot and applies it with the anchor", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      h.anchor("x", 900);
      await h.start();
      h.internal.booting = true;

      h.client.navigate("/page?tab=analytics#x");
      await flush();

      expect(h.internal.bootQueue).toBeDefined();
      expect(h.pushedPaths).toEqual([]);
      expect(page.region.value).toBe("overview");

      h.internal.settleBoot();
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(page.region.value).toBe("analytics");
      expect(page.regionContent.value).toBe("Analytics:analytics");
      expect(h.scrolled).toEqual(["x"]);
      expect(h.viewport.scrollY).toBe(900);
      expect(h.pushedPaths).toEqual(["/page?tab=analytics#x"]);
      expect(h.url.value.hash).toBe("#x");
    } finally { h.restore(); }
  });
});

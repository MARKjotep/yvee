import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { RouteScroll } from "../../src/yvee/client/runtime/scroll";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { loadPage, type PageLoad } from "../../src/yvee/client/load-page";
import { renderRegion } from "../../src/yvee/client/regions";
import { Page } from "../../src/yvee/pages/page";
import { toURL, urlKey, type YveeURL } from "../../src/yvee/routing/path";
import { RouteBook } from "../../src/yvee/routing/routes";
import { Yvee, route } from "../../src/yvee";

class RegionPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  log: string[] = [];
  moduleLoads = new Map<string, number>();
  pageDisposed = false;

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
  };

  override body() {
    this.resources.defer(() => { this.pageDisposed = true; });
    return this.regionContent;
  }
}

class BrokenRegionPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override regions = {
    overview: async () => ({ default: () => "Overview" }),
    analytics: () => Promise.reject(new Error("region import failed")),
  };
  override body() { return this.regionContent; }
}

interface ClientInternals {
  mounted: boolean;
  currentURL: YveeURL | undefined;
  activePage: Page | undefined;
  revision: number;
  pendingNavigation: unknown;
  activeLoad: AbortController | undefined;
  history: RouteHistory;
  scroll: RouteScroll;
  navigation: { options: { onPop(url: YveeURL, state: unknown): void } };
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
    back() { if (index > 0) index--; },
    forward() { if (index < entries.length - 1) index++; },
  };
  Object.assign(globalThis, {
    window: viewport,
    location: address,
    history: historyMock,
    requestAnimationFrame: (callback: FrameRequestCallback) => { callback(0); return 1; },
    document: {
      getElementById: () => null,
      documentElement: { style: {} },
    },
  });

  const url = State(toURL(initial));
  const root = State<unknown[]>([]);
  const transitions: YveeURL[] = [];
  const errors: unknown[] = [];
  const client = new YveeClient({
    id: "regions-test",
    base: "/",
    useHistory: true,
    url,
    root,
    load: (target) => Promise.resolve<PageLoad>({
      kind: "ready" as const,
      status: 200,
      body: [],
      head: {},
      url: target,
      page,
    }),
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

  return {
    client, internal, url, root, transitions, errors, viewport, entries, historyMock,
    pushedPaths, start, restore, pop,
    setIndex(next: number) { index = next; },
    currentIndex() { return index; },
  };
}

async function primeRegion(page: RegionPage, id: "overview" | "analytics") {
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
}

describe("in-page regions", () => {
  it("swaps a region without transitioning, updating the URL and history entry", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.viewport.scrollY = 250;

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.pushedPaths).toEqual(["/page?tab=analytics"]);
      expect(h.url.value.search).toBe("?tab=analytics");
      expect(h.internal.currentURL?.search).toBe("?tab=analytics");
      expect(page.region.value).toBe("analytics");
      expect(page.regionContent.value).toBe("Analytics:analytics");
      expect(page.moduleLoads.get("analytics")).toBe(1);
      expect(page.log).toEqual(["dispose:overview"]);
      expect(h.entries[0]!.state.scroll).toEqual({ x: 0, y: 250 });
      expect(h.internal.pendingNavigation).toBeUndefined();
      expect(h.internal.activeLoad).toBeUndefined();

      // The module promise is cached per page, so returning is instant.
      h.client.navigate("/page?tab=overview");
      await flush();
      expect(page.moduleLoads.get("overview")).toBe(1);
      expect(page.region.value).toBe("overview");
      expect(page.log).toEqual(["dispose:overview", "dispose:analytics"]);
    } finally { h.restore(); }
  });

  it("falls through to a full transition for a non-region query delta", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics&x=1");
      await flush();

      expect(h.transitions).toHaveLength(1);
      expect(h.transitions[0]!.search).toBe("?tab=analytics&x=1");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
    } finally { h.restore(); }
  });

  it("falls through while a navigation is in flight", async () => {
    const page = new RegionPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.internal.activeLoad = new AbortController();
      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(h.transitions).toHaveLength(1);
      expect(page.region.value).toBe("overview");
    } finally { h.restore(); }
  });

  it("applies Back and Forward region pops without loading and restores page scroll", async () => {
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

      // Native Back moves history before popstate fires.
      h.setIndex(0);
      h.pop(toURL("/page?tab=overview"));
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.url.value.search).toBe("?tab=overview");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(h.viewport.scrollY).toBe(120);

      // Forward restores the scroll saved for the analytics entry.
      h.setIndex(1);
      h.pop(toURL("/page?tab=analytics"));
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(page.region.value).toBe("analytics");
      expect(h.viewport.scrollY).toBe(400);
    } finally { h.restore(); }
  });

  it("renders the default region for an unknown region id", async () => {
    class SsrPage extends Page {
      override regionParam = "tab";
      override defaultRegion = "overview";
      override regions = {
        overview: async () => ({ default: ({ page }: { page: Page }) => `${page.region.value}-panel` }),
        analytics: async () => ({ default: ({ page }: { page: Page }) => `${page.region.value}-panel` }),
      };
      override body() { return this.regionContent; }
    }

    const app = new Yvee({ history: false, id: "regions-ssr" });
    app.register(route("/dashboard")(SsrPage));

    const analytics = await app.server()({ url: "/dashboard?tab=analytics" });
    expect(analytics).toContain("analytics-panel");
    expect(analytics).not.toContain("overview-panel");

    const unknown = await app.server()({ url: "/dashboard?tab=missing" });
    expect(unknown).toContain("overview-panel");
    expect(unknown).not.toContain("analytics-panel");

    const plain = await app.server()({ url: "/dashboard" });
    expect(plain).toContain("overview-panel");

    // Client-side navigation to an unknown id also falls back to the default.
    const page = new RegionPage();
    page.region.value = "analytics";
    page.regionContent.value = "Analytics:analytics";
    const h = harness(page, "/page?tab=analytics");
    try {
      await h.start();
      h.client.navigate("/page?tab=missing");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
    } finally { h.restore(); }
  });

  it("keeps the current region and rolls back the URL when a module import fails", async () => {
    const page = new BrokenRegionPage();
    page.region.value = "overview";
    page.regionContent.value = "Overview";
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(h.errors).toHaveLength(1);
      expect(h.errors[0]).toBeInstanceOf(Error);
      expect((h.errors[0] as Error).message).toBe("region import failed");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview");
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(h.currentIndex()).toBe(0);
      expect(h.entries[0]!.path).toBe("/page?tab=overview");
    } finally { h.restore(); }
  });

  it("rolls back a replaced region URL on import failure without pushing", async () => {
    const page = new BrokenRegionPage();
    page.region.value = "overview";
    page.regionContent.value = "Overview";
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics", undefined, true);
      await flush();

      expect(h.errors).toHaveLength(1);
      expect(h.pushedPaths).toEqual([]);
      expect(page.region.value).toBe("overview");
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.entries[0]!.path).toBe("/page?tab=overview");
    } finally { h.restore(); }
  });

  it("disposes the previous region scope on switch and both scopes on page leave", async () => {
    const page = new RegionPage();
    page.region.value = "overview";
    const overview = await page.regions.overview();
    page.regionContent.value = await overview.default({ page });
    const h = harness(page);
    try {
      await h.start();
      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(page.log).toEqual(["dispose:overview"]);
      expect(page.pageDisposed).toBe(false);
    } finally { h.restore(); }

    class LeavingPage extends Page {
      log: string[] = [];
      override regionParam = "tab";
      override defaultRegion = "overview";
      override regions = {
        overview: async () => ({
          default: ({ page }: { page: Page }) => {
            page.regionResources.defer(() => this.log.push("region"));
            return "Overview";
          },
        }),
      };
      override body() {
        this.resources.defer(() => this.log.push("page"));
        return this.regionContent;
      }
    }

    const routes = new RouteBook();
    routes.add("/dashboard", LeavingPage);
    const loaded = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/dashboard?tab=overview"),
      data: {},
      signal: new AbortController().signal,
    });
    expect(loaded.kind).toBe("ready");
    if (loaded.kind !== "ready") return;
    const leaving = loaded.page as LeavingPage;
    expect(leaving.region.value).toBe("overview");
    loaded.dispose?.();
    expect(leaving.log).toEqual(["region", "page"]);
  });

  it("keeps pages without regions on the existing full-navigation path", async () => {
    const page = new Page();
    const h = harness(page, "/page");
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(h.transitions).toHaveLength(1);
      expect(h.transitions[0]!.search).toBe("?tab=analytics");
      expect(h.url.value.search).toBe("?tab=analytics");
    } finally { h.restore(); }
  });
});

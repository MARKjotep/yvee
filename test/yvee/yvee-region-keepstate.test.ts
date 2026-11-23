import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import { loadPage, type PageLoad } from "../../src/yvee/client/load-page";
import { regionCache, renderRegion } from "../../src/yvee/client/regions";
import { Page, type RegionCache, type RegionLoader } from "../../src/yvee/pages/page";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";
import { RouteBook } from "../../src/yvee/routing/routes";

interface ClientInternals {
  mounted: boolean;
  currentURL: YveeURL | undefined;
  activePage: Page | undefined;
  revision: number;
  history: RouteHistory;
  watchURL(): Promise<() => void>;
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
  const entries: Entry[] = [{ state: {}, path: initial }];
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
      querySelectorAll: () => [],
    },
  });

  const url = State(toURL(initial));
  const root = State<unknown[]>([]);
  const errors: unknown[] = [];
  const client = new YveeClient({
    id: "region-keepstate-test",
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

  return { client, internal, url, errors, entries, pushedPaths, start, restore };
}

/** Region views that keep a visit counter in the runtime-owned cache. */
class KeepPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override keepAlive: number | true = true;
  renders: string[] = [];
  override regions: Record<string, RegionLoader> = {
    overview: async () => ({ default: ({ cache }: { page: Page; cache: RegionCache }) => this.visit("overview", cache) }),
    analytics: async () => ({ default: ({ cache }: { page: Page; cache: RegionCache }) => this.visit("analytics", cache) }),
    settings: async () => ({ default: ({ cache }: { page: Page; cache: RegionCache }) => this.visit("settings", cache) }),
  };

  private visit(id: string, cache: RegionCache) {
    const retained = cache.get() as { visit?: number } | undefined;
    const count = retained?.visit;
    cache.set({ id, visit: (count ?? 0) + 1 });
    const label = count === undefined ? "none" : String(count);
    this.renders.push(`${id}:${label}`);
    return `${id}:${label}`;
  }

  override body() { return this.regionContent; }
}

class PlainPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  observed: unknown[] = [];
  override regions = {
    overview: async () => ({
      default: ({ cache }: { page: Page; cache: RegionCache }) => {
        this.observed.push(cache.get());
        cache.set("ignored");
        return "Overview";
      },
    }),
  };
  override body() { return this.regionContent; }
}

describe("region keep-state", () => {
  it("re-renders from retained state on every entry", async () => {
    const page = new KeepPage();
    page.region.value = "overview";
    page.regionContent.value = await renderRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      h.client.navigate("/page?tab=overview");
      await flush();

      // The module default ran on every entry; the second overview render read
      // the value retained by the first one.
      expect(page.renders).toEqual(["overview:none", "analytics:none", "overview:1"]);
      expect(page.regionContent.value).toBe("overview:1");
      expect(regionCache(page, "overview").get()).toEqual({ id: "overview", visit: 2 });
    } finally { h.restore(); }
  });

  it("evicts the oldest region beyond the keepAlive bound", () => {
    const page = new KeepPage();
    for (const id of ["a", "b", "c", "d", "e", "f"]) regionCache(page, id).set(id);

    // `true` retains five regions; the first inserted value was evicted.
    expect(regionCache(page, "a").get()).toBeUndefined();
    expect(["b", "c", "d", "e", "f"].map(id => regionCache(page, id).get()))
      .toEqual(["b", "c", "d", "e", "f"]);

    // Writing an existing region refreshes it, so the next insert evicts `b`.
    regionCache(page, "f").set("f2");
    regionCache(page, "g").set("g");
    expect(regionCache(page, "b").get()).toBeUndefined();
    expect(regionCache(page, "f").get()).toBe("f2");
    expect(regionCache(page, "g").get()).toBe("g");
  });

  it("honors an explicit numeric bound and drops keep-state without the flag", () => {
    const bounded = new KeepPage();
    bounded.keepAlive = 2;
    regionCache(bounded, "a").set("a");
    regionCache(bounded, "b").set("b");
    regionCache(bounded, "c").set("c");
    expect(regionCache(bounded, "a").get()).toBeUndefined();
    expect(regionCache(bounded, "b").get()).toBe("b");
    expect(regionCache(bounded, "c").get()).toBe("c");

    const plain = new PlainPage();
    const cache = regionCache(plain, "overview");
    expect(cache.get()).toBeUndefined();
    cache.set("value");
    expect(cache.get()).toBeUndefined();
  });

  it("always passes a cache to region modules and never retains without keepAlive", async () => {
    const page = new PlainPage();
    await renderRegion(page, "overview");
    await renderRegion(page, "overview");

    expect(page.observed).toEqual([undefined, undefined]);
    expect(regionCache(page, "overview").get()).toBeUndefined();
  });

  it("skips cache writes from a render whose epoch token went stale", async () => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    class SlowPage extends KeepPage {
      override regions: Record<string, RegionLoader> = {
        overview: async () => ({ default: () => "Overview" }),
        analytics: async () => ({
          default: async ({ cache }: { page: Page; cache: RegionCache }) => {
            await gate;
            cache.set("late");
            return "Analytics";
          },
        }),
        settings: async () => ({ default: () => "Settings" }),
      };
    }
    const page = new SlowPage();
    page.region.value = "overview";
    page.regionContent.value = await renderRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      // A newer region swap supersedes the pending analytics render.
      h.client.navigate("/page?tab=settings");
      await flush();
      release();
      await flush();

      expect(h.errors).toHaveLength(0);
      expect(page.region.value).toBe("settings");
      expect(page.regionContent.value).toBe("Settings");
      expect(regionCache(page, "analytics").get()).toBeUndefined();
    } finally { h.restore(); }
  });

  it("drops retained values when the page is disposed", async () => {
    const routes = new RouteBook();
    routes.add("/page", KeepPage);
    const loaded = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/page?tab=overview"),
      data: {},
      signal: new AbortController().signal,
    });
    expect(loaded.kind).toBe("ready");
    if (loaded.kind !== "ready") return;
    const page = loaded.page!;

    expect(regionCache(page, "overview").get()).toEqual({ id: "overview", visit: 1 });
    const other = new KeepPage();
    regionCache(other, "overview").set("other");

    loaded.dispose?.();
    expect(regionCache(page, "overview").get()).toBeUndefined();
    // Other pages keep their own store.
    expect(regionCache(other, "overview").get()).toBe("other");
  });
});

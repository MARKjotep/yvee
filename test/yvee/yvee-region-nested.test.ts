import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { loadPage, type PageLoad } from "../../src/yvee/client/load-page";
import {
  clearRegionMemory,
  recallRegion,
  renderRegion,
} from "../../src/yvee/client/regions";
import { Page, type RegionCache, type RegionLoader } from "../../src/yvee/pages/page";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";
import { RouteBook } from "../../src/yvee/routing/routes";
import {
  Yvee,
  regionLevel,
  regionTree,
  route,
  type RegionChromeLoader,
  type RegionGuard,
  type RegionGuardContext,
  type RegionLeaveContext,
} from "../../src/yvee";

interface ClientInternals {
  mounted: boolean;
  currentURL: YveeURL | undefined;
  activePage: Page | undefined;
  revision: number;
  pendingNavigation: unknown;
  activeLoad: AbortController | undefined;
  history: RouteHistory;
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

/**
 * Client harness matching the other region suites: a fake history stack, a
 * stubbed transition recorder, and no real DOM. Region swaps are expected to
 * complete without ever recording a transition.
 */
function harness(page: Page, initial = "/page?tab=analytics/overview") {
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
  const transitions: YveeURL[] = [];
  const errors: unknown[] = [];
  const client = new YveeClient({
    id: "region-nested-test",
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
    client, internal, url, errors, entries, pushedPaths, transitions,
    start, restore, pop,
    currentIndex() { return index; },
    setIndex(next: number) { index = next; },
    /** Finish the fake transition to `path` so the next navigation is free. */
    settle(path: string, next: Page = new Page()) {
      internal.pendingNavigation = undefined;
      internal.currentURL = toURL(path);
      internal.activePage = next;
    },
  };
}

async function primeRegion(page: Page, id: string) {
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
}

/** A leaf view that counts entries through the runtime cache for its composite id. */
function viewLoader(page: NestedPage, id: string): RegionLoader {
  return async () => ({
    default: ({ cache }: { page: Page; cache: RegionCache }) => {
      const retained = cache.get() as { visits?: number } | undefined;
      const visits = retained?.visits ?? 0;
      cache.set({ visits: visits + 1 });
      page.renders.push(`${id}:${visits}`);
      return `${id}#${visits}`;
    },
  });
}

function chromeLoader(page: NestedPage): RegionChromeLoader {
  return async () => ({
    default: ({ page: owner, cache, outlet }) => {
      page.chromeRenders.push(owner.region.value);
      // Chrome must be stateless: this cache never retains a write.
      page.chromeCaches.push(cache.get());
      cache.set("ignored");
      page.chromeCaches.push(cache.get());
      return `chrome(${owner.region.value})[${String(outlet)}]`;
    },
  });
}

class NestedPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "analytics";
  override keepAlive: number | true = true;
  override rememberRegion = true;
  override strictRegions = false;
  override regionGuards: Record<string, RegionGuard[]> = {};

  renders: string[] = [];
  chromeRenders: string[] = [];
  chromeCaches: unknown[] = [];
  events: string[] = [];
  guards: RegionGuardContext[] = [];
  leave: Array<{ from: string; to: string }> = [];

  override regions = regionTree({
    overview: viewLoader(this, "overview"),
    settings: viewLoader(this, "settings"),
    analytics: regionLevel({
      chrome: chromeLoader(this),
      views: {
        overview: viewLoader(this, "analytics/overview"),
        retention: viewLoader(this, "analytics/retention"),
      },
    }),
  });

  override regionWillLeave(context: RegionLeaveContext) {
    this.events.push(`leave:${context.from}->${context.to}`);
    this.leave.push({ from: context.from, to: context.to });
  }

  override body() { return this.regionContent; }
}

class StrictNestedPage extends NestedPage {
  override strictRegions = true;
  override rememberRegion = false;
}

beforeEach(() => { clearRegionMemory(); });
afterEach(() => { clearRegionMemory(); });

describe("regionTree flattening", () => {
  it("copies plain loaders and expands a level into its default and child ids", async () => {
    const plain: RegionLoader = async () => ({ default: () => "Plain" });
    const tree = regionTree({
      plain,
      analytics: regionLevel({
        chrome: async () => ({
          default: ({ page, outlet }) => `${page.region.value}:${String(outlet)}`,
        }),
        views: {
          overview: async () => ({ default: () => "Overview" }),
          retention: async () => ({ default: () => "Retention" }),
        },
      }),
    });

    expect(Object.keys(tree)).toEqual([
      "plain",
      "analytics",
      "analytics/overview",
      "analytics/retention",
    ]);
    // A plain loader is the same function, not a wrapper.
    expect(tree.plain).toBe(plain);

    const page = new Page();
    page.regions = tree;
    page.regionParam = "tab";

    page.region.value = "plain";
    await expect(renderRegion(page, "plain")).resolves.toBe("Plain");

    page.region.value = "analytics";
    await expect(renderRegion(page, "analytics")).resolves.toBe("analytics:Overview");

    page.region.value = "analytics/retention";
    await expect(renderRegion(page, "analytics/retention")).resolves.toBe("analytics/retention:Retention");
  });

  it("uses the first view when default is omitted and honors an explicit default", async () => {
    const first = regionTree({
      analytics: regionLevel({
        chrome: async () => ({ default: ({ outlet }) => String(outlet) }),
        views: {
          overview: async () => ({ default: () => "Overview" }),
          retention: async () => ({ default: () => "Retention" }),
        },
      }),
    });
    const explicit = regionTree({
      analytics: regionLevel({
        chrome: async () => ({ default: ({ outlet }) => String(outlet) }),
        default: "retention",
        views: {
          overview: async () => ({ default: () => "Overview" }),
          retention: async () => ({ default: () => "Retention" }),
        },
      }),
    });

    const omitted = new Page();
    omitted.regionParam = "tab";
    omitted.regions = first;
    omitted.region.value = "analytics";
    await expect(renderRegion(omitted, "analytics")).resolves.toBe("Overview");

    const chosen = new Page();
    chosen.regionParam = "tab";
    chosen.regions = explicit;
    chosen.region.value = "analytics";
    await expect(renderRegion(chosen, "analytics")).resolves.toBe("Retention");
  });

  it("forwards and combines chrome and leaf heads", async () => {
    class HeadPage extends Page {
      override regionParam = "tab";
      override defaultRegion = "analytics";
      override regions = regionTree({
        analytics: regionLevel({
          chrome: async () => ({
            default: ({ outlet }) => String(outlet),
            head: { title: "Analytics chrome" },
          }),
          views: {
            retention: async () => ({
              default: () => "Retention",
              head: ({ page }) => ({ title: `Retention ${page.region.value}` }),
            }),
          },
        }),
      });
      override body() { return this.regionContent; }
    }

    const routes = new RouteBook();
    routes.add("/head", HeadPage);
    const loaded = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/head?tab=analytics/retention"),
      data: {},
      signal: new AbortController().signal,
    });

    expect(loaded.kind).toBe("ready");
    if (loaded.kind !== "ready") return;
    // Leaf head wins over chrome head, exactly like any region head on a base head.
    expect(loaded.regionHead?.title).toBe("Retention analytics/retention");
    expect(loaded.head.title).toBe("Retention analytics/retention");
    expect(loaded.page?.region.value).toBe("analytics/retention");
    expect(loaded.page?.regionContent.value).toBe("Retention");
  });
});

describe("composite region navigation", () => {
  it("swaps an inner view softly without a transition or revision bump", async () => {
    const page = new NestedPage();
    await primeRegion(page, "analytics/overview");
    const h = harness(page, "/page?tab=analytics/overview");
    try {
      await h.start();
      const revision = h.internal.revision;

      h.client.navigate("/page?tab=analytics/retention");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.internal.revision).toBe(revision);
      expect(page.region.value).toBe("analytics/retention");
      expect(page.regionContent.value).toBe("chrome(analytics/retention)[analytics/retention#0]");
      expect(h.pushedPaths).toEqual(["/page?tab=analytics/retention"]);
      expect(h.url.value.search).toBe("?tab=analytics/retention");
      expect(h.internal.currentURL?.search).toBe("?tab=analytics/retention");

      // The outer chrome re-runs for the inner change, but stays stateless.
      expect(page.chromeRenders).toEqual(["analytics/overview", "analytics/retention"]);
      expect(page.chromeCaches.every(value => value === undefined)).toBe(true);
      // Only the new composite id rendered; the outer id never rendered.
      expect(page.renders).toEqual(["analytics/overview:0", "analytics/retention:0"]);
    } finally { h.restore(); }
  });

  it("swaps an outer region softly and restores inner keep-state after a round-trip", async () => {
    const page = new NestedPage();
    await primeRegion(page, "analytics/overview");
    const h = harness(page, "/page?tab=analytics/overview");
    try {
      await h.start();
      const revision = h.internal.revision;

      h.client.navigate("/page?tab=overview");
      await flush();
      expect(h.transitions).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("overview#0");

      h.client.navigate("/page?tab=analytics/overview");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.internal.revision).toBe(revision);
      expect(page.region.value).toBe("analytics/overview");
      // The leaf's retained visit counter survived the outer round-trip even
      // though the outer region DOM was rebuilt.
      expect(page.regionContent.value).toBe("chrome(analytics/overview)[analytics/overview#1]");
      expect(page.renders).toEqual([
        "analytics/overview:0",
        "overview:0",
        "analytics/overview:1",
      ]);
      expect(page.chromeRenders).toEqual([
        "analytics/overview",
        "analytics/overview",
      ]);
    } finally { h.restore(); }
  });

  it("remembers a composite id across pages", async () => {
    const page = new NestedPage();
    await primeRegion(page, "analytics/overview");
    const h = harness(page, "/page?tab=analytics/overview");
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics/retention");
      await flush();
      expect(recallRegion("/page")?.id).toBe("analytics/retention");
      expect(recallRegion("/page")?.regionIds).toContain("analytics/retention");

      h.client.navigate("/other");
      await flush();
      h.settle("/other");
      h.client.navigate("/page");
      await flush();

      expect(h.transitions).toHaveLength(2);
      // Memory restores the composite id; the encoded search may use `%2F`.
      expect(h.transitions[1]!.params.get("tab")).toBe("analytics/retention");
    } finally { h.restore(); }
  });

  it("passes composite from/to to guards and the leave hook", async () => {
    const page = new NestedPage();
    await primeRegion(page, "analytics/overview");
    page.regionGuards["analytics/retention"] = [
      (context) => {
        page.guards.push(context);
        page.events.push(`guard:${context.region}`);
        return { kind: "allow" };
      },
    ];
    const h = harness(page, "/page?tab=analytics/overview");
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics/retention");
      await flush();

      expect(page.guards).toHaveLength(1);
      expect(page.guards[0]!.region).toBe("analytics/retention");
      expect(page.guards[0]!.from).toBe("analytics/overview");
      expect(page.leave).toEqual([{
        from: "analytics/overview",
        to: "analytics/retention",
      }]);
      // Guards run before the leave hook and the swap render.
      expect(page.events).toEqual([
        "guard:analytics/retention",
        "leave:analytics/overview->analytics/retention",
      ]);
      expect(page.region.value).toBe("analytics/retention");
    } finally { h.restore(); }
  });
});

describe("composite region SSR and strict mode", () => {
  it("resolves a composite URL on the server inside the level chrome", async () => {
    const app = new Yvee({ history: false, id: "nested-region-ssr" });
    app.register(route("/dashboard")(NestedPage));
    const renderer = app.server();

    const retention = await renderer({ url: "/dashboard?tab=analytics/retention" });
    expect(retention).toContain("chrome(analytics/retention)");
    expect(retention).toContain("analytics/retention#0");
    expect(retention).not.toContain("analytics/overview#");

    // The bare level id renders the level's default view.
    const level = await renderer({ url: "/dashboard?tab=analytics" });
    expect(level).toContain("chrome(analytics)");
    expect(level).toContain("analytics/overview#0");

    const plain = await renderer({ url: "/dashboard?tab=overview" });
    expect(plain).toContain("overview#0");
    expect(plain).not.toContain("chrome(");
  });

  it("rejects unknown composite ids on load, soft navigation and pops in strict mode", async () => {
    const app = new Yvee({ history: false, id: "nested-region-strict" });
    app.register(route("/page")(StrictNestedPage));
    const renderer = app.server();

    const missing = await renderer.withStatus({ url: "/page?tab=analytics/missing" });
    expect(missing.status).toBe(404);
    expect(missing.html).toContain("Page not found");
    expect(missing.html).not.toContain("chrome(");

    const known = await renderer.withStatus({ url: "/page?tab=analytics/retention" });
    expect(known.status).toBe(200);
    expect(known.html).toContain("analytics/retention#0");

    const page = new StrictNestedPage();
    await primeRegion(page, "analytics/overview");
    const h = harness(page, "/page?tab=analytics/overview");
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics/missing");
      await flush();
      expect(h.transitions).toHaveLength(0);
      expect(h.pushedPaths).toEqual([]);
      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("Unknown Yvee region: analytics/missing");
      expect(page.region.value).toBe("analytics/overview");
      expect(h.url.value.search).toBe("?tab=analytics/overview");
      expect(h.internal.currentURL?.search).toBe("?tab=analytics/overview");

      // A strict pop to an unknown composite is denied and the URL restored.
      h.setIndex(0);
      h.pop(toURL("/page?tab=analytics/missing"));
      await flush();
      expect(h.transitions).toHaveLength(0);
      expect(h.errors).toHaveLength(2);
      expect(page.region.value).toBe("analytics/overview");
      expect(h.url.value.search).toBe("?tab=analytics/overview");
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=analytics/overview");
    } finally { h.restore(); }
  });
});

import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { RouteView } from "../../src/yvee/client/runtime/view";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { loadPage, type PageLoad } from "../../src/yvee/client/load-page";
import { renderRegion } from "../../src/yvee/client/regions";
import {
  MissingPage,
  Page,
  type PageFetchContext,
  type RegionModule,
} from "../../src/yvee/pages/page";
import type { HeadConfig, HeadResult } from "../../src/yvee/rendering/head";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";
import { RouteBook } from "../../src/yvee/routing/routes";
import { Yvee, route } from "../../src/yvee";

interface ClientInternals {
  mounted: boolean;
  currentURL: YveeURL | undefined;
  activePage: Page | undefined;
  revision: number;
  pendingNavigation: unknown;
  activeLoad: AbortController | undefined;
  history: RouteHistory;
  view: RouteView;
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

interface FakeScroll {
  getAttribute(name: string): string | null;
  scrollTop: number;
  scrollLeft: number;
}

const GLOBALS = ["window", "location", "history", "requestAnimationFrame", "document"] as const;

const flush = async () => {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  await new Promise<void>(resolve => setTimeout(resolve, 0));
};

/**
 * A fake scroll container whose offsets log reads and writes, so tests can
 * prove the capture/restore order without touching a real DOM.
 */
function scrollElement(key: string | undefined, top: number, left: number, log: string[]): FakeScroll {
  let vertical = top;
  let horizontal = left;
  return {
    getAttribute: (name: string) => name === "data-scroll-key" ? key ?? null : null,
    get scrollTop() {
      if (key) log.push(`capture:${key}:${vertical}`);
      return vertical;
    },
    set scrollTop(next: number) {
      if (key) log.push(`write:${key}:${next}`);
      vertical = next;
    },
    get scrollLeft() {
      return horizontal;
    },
    set scrollLeft(next: number) {
      horizontal = next;
    },
  };
}

function harness(
  page: Page,
  initial = "/page?tab=overview",
  options: { scroll?: () => FakeScroll[] } = {},
) {
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
      querySelectorAll: (selector: string) =>
        selector === "[data-scroll-key]" ? options.scroll?.() ?? [] : [],
    },
  });

  const url = State(toURL(initial));
  const root = State<unknown[]>([]);
  const transitions: YveeURL[] = [];
  const errors: unknown[] = [];
  const client = new YveeClient({
    id: "region-lifecycle-test",
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
    client, internal, view: internal.view, url, root, transitions, errors,
    pushedPaths, entries, start, restore, pop,
    currentIndex() { return index; },
    setIndex(next: number) { index = next; },
  };
}

async function primeRegion(page: Page, id: string) {
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
}

/** Replace `RouteView.stage` with a recorder so head tests need no real DOM. */
function recordHeads(view: RouteView) {
  const staged: HeadConfig[] = [];
  const cleanups: Array<() => void> = [];
  let failures = 0;
  view.stage = (config: HeadConfig) => {
    staged.push(config);
    const cleanup = Object.assign(() => { cleanups.push(() => {}); }, {
      ready: Promise.resolve(),
      async activate() {
        if (failures > 0) {
          failures--;
          throw new Error("head activation failed");
        }
      },
      cancel() {},
    });
    return cleanup;
  };
  return {
    staged,
    failNext() { failures++; },
    titles() { return staged.map(config => config.title); },
  };
}

class ScrollPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override refreshOnRegionChange = true;
  log: string[] = [];
  regions: Record<string, () => Promise<RegionModule>>;
  attach: (id: string) => void;

  constructor(attach: (id: string) => void) {
    super();
    this.attach = attach;
    this.regions = {
      overview: async () => {
        this.log.push("import:overview");
        return {
          default: ({ page }: { page: Page }) => {
            page.regionResources.defer(() => this.log.push("dispose:overview"));
            this.attach("overview");
            this.log.push("render:overview");
            return `Overview:${page.region.value}`;
          },
        };
      },
      analytics: async () => {
        this.log.push("import:analytics");
        return {
          default: ({ page }: { page: Page }) => {
            page.regionResources.defer(() => this.log.push("dispose:analytics"));
            this.attach("analytics");
            this.log.push("render:analytics");
            return `Analytics:${page.region.value}`;
          },
        };
      },
    };
  }

  override async fetch(context: PageFetchContext<Record<string, unknown>>): Promise<Record<string, unknown>> {
    this.log.push(`fetch:${context.url.params.get("tab")}`);
    return { refreshed: context.url.params.get("tab") };
  }

  override body() { return this.regionContent; }
}

class RefreshPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override refreshOnRegionChange = true;
  calls: PageFetchContext<Record<string, unknown>>[] = [];
  override regions = {
    overview: async () => ({
      default: ({ page }: { page: Page }) => `Overview:${String(page.data.greeting ?? "none")}`,
    }),
    analytics: async () => ({
      default: ({ page }: { page: Page }) => `Analytics:${String(page.data.greeting ?? "none")}`,
    }),
    failing: async () => ({
      default: ({ page }: { page: Page }) => `Failing:${String(page.data.greeting ?? "none")}`,
    }),
  };

  override async fetch(context: PageFetchContext<Record<string, unknown>>): Promise<Record<string, unknown>> {
    this.calls.push(context);
    if (context.url.params.get("tab") === "failing") throw new Error("region fetch failed");
    return { greeting: `hello-${context.url.params.get("tab") ?? "none"}` };
  }

  override body() { return this.regionContent; }
}

class HookPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  leave: Array<{ from: string; to: string }> = [];
  entered: Array<{ region: string; content: unknown }> = [];
  rejectTo: string | undefined;
  override regions = {
    overview: async () => ({ default: ({ page }: { page: Page }) => `Overview:${page.region.value}` }),
    analytics: async () => ({ default: ({ page }: { page: Page }) => `Analytics:${page.region.value}` }),
    settings: async () => ({ default: ({ page }: { page: Page }) => `Settings:${page.region.value}` }),
  };

  override regionWillLeave(context: { from: string; to: string }) {
    this.leave.push({ from: context.from, to: context.to });
    if (this.rejectTo === context.to) throw new Error(`denied:${context.to}`);
  }

  override regionDidEnter(context: { region: string }) {
    this.entered.push({ region: context.region, content: this.regionContent.value });
    if (context.region === "settings") throw new Error("enter failed");
  }

  override body() { return this.regionContent; }
}

class HeadPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override regions = {
    overview: async () => ({
      default: ({ page }: { page: Page }) => `Overview:${page.region.value}`,
      head: { title: "Overview" } as HeadResult,
    }),
    analytics: async () => ({
      default: ({ page }: { page: Page }) => `Analytics:${page.region.value}`,
      head: ({ page }: { page: Page }) => ({ title: `Analytics:${page.region.value}` }),
    }),
    settings: async () => ({
      default: ({ page }: { page: Page }) => `Settings:${page.region.value}`,
    }),
  };

  override head() { return { title: "Base" }; }
  override body() { return this.regionContent; }
}

class StrictPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override strictRegions = true;
  override regions = {
    overview: async () => ({ default: () => "Overview" }),
    analytics: async () => ({ default: () => "Analytics" }),
  };
  override body() { return this.regionContent; }
}

describe("region lifecycle", () => {
  it("captures and restores data-scroll-key offsets around a swap", async () => {
    const log: string[] = [];
    let elements: FakeScroll[] = [];
    const attach = (id: string) => {
      elements = [
        scrollElement("list", 0, 0, log),
        scrollElement(undefined, 900, 0, log),
      ];
      log.push(`attached:${id}`);
    };
    const page = new ScrollPage(attach);
    page.log = log;
    attach("overview");
    await primeRegion(page, "overview");
    elements[0]!.scrollTop = 120;
    elements[0]!.scrollLeft = 15;
    log.length = 0;

    const h = harness(page, "/page?tab=overview", { scroll: () => elements });
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      // Capture reads the outgoing list before the import and render happen.
      expect(log).toEqual([
        "capture:list:120",
        "import:analytics",
        "fetch:analytics",
        "dispose:overview",
        "attached:analytics",
        "render:analytics",
      ]);
      expect(elements[0]!.scrollTop).toBe(0);
      // The untracked container was never read or restored.
      expect(elements[1]!.scrollTop).toBe(900);

      elements[0]!.scrollTop = 300;
      log.length = 0;
      h.client.navigate("/page?tab=overview");
      await flush();

      // Capture happens before fetch; restore runs after render.
      const order = ["capture:list:300", "fetch:overview"];
      const positions = order.map(entry => log.indexOf(entry));
      expect(positions.every(position => position >= 0)).toBe(true);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(log.indexOf("render:overview")).toBeLessThan(log.indexOf("write:list:120"));
      expect(elements[0]!.scrollTop).toBe(120);
      expect(elements[0]!.scrollLeft).toBe(15);

      // Re-entering analytics restores the position captured on exit.
      log.length = 0;
      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(log).toContain("write:list:300");
      expect(elements[0]!.scrollTop).toBe(300);
    } finally { h.restore(); }
  });

  it("refreshes through fetch in the incoming scope and merges before render", async () => {
    const page = new RefreshPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(page.calls).toHaveLength(1);
      expect(page.calls[0]!.url.search).toBe("?tab=analytics");
      expect(page.calls[0]!.signal).toBe(page.regionResources.signal);
      expect(page.calls[0]!.resources).toBe(page.regionResources);
      expect(page.data.greeting).toBe("hello-analytics");
      expect(page.regionContent.value).toBe("Analytics:hello-analytics");
      expect(h.errors).toHaveLength(0);

      // Region history moves run the same refresh path.
      h.setIndex(0);
      h.pop(toURL("/page?tab=overview"));
      await flush();
      expect(page.calls).toHaveLength(2);
      expect(page.regionContent.value).toBe("Overview:hello-overview");
      expect(h.errors).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("retains the region and rolls back the URL when a refresh fails", async () => {
    const page = new RefreshPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=failing");
      await flush();

      expect(page.calls).toHaveLength(1);
      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("region fetch failed");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:none");
      expect(page.data.greeting).toBeUndefined();
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(h.pushedPaths).toEqual(["/page?tab=failing"]);
      expect(h.currentIndex()).toBe(0);
    } finally { h.restore(); }
  });

  it("applies and rolls back region heads without a route transition", async () => {
    const page = new HeadPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      h.view.base = { title: "Base" };
      h.view.regionHead = { title: "Overview" };
      const heads = recordHeads(h.view);
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(h.transitions).toHaveLength(0);
      expect(heads.titles().at(-1)).toBe("Analytics:analytics");
      expect(h.view.regionHead?.title).toBe("Analytics:analytics");

      h.client.navigate("/page?tab=settings");
      await flush();
      expect(heads.titles().at(-1)).toBe("Base");
      expect(h.view.regionHead).toBeUndefined();

      h.client.navigate("/page?tab=overview");
      await flush();
      expect(heads.titles().at(-1)).toBe("Overview");
      expect(h.view.regionHead?.title).toBe("Overview");

      // A failed head activation restores the previous region head.
      heads.failNext();
      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("head activation failed");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(heads.titles().at(-1)).toBe("Overview");
      expect(h.view.regionHead?.title).toBe("Overview");
    } finally { h.restore(); }
  });

  it("includes the region head on a full page load without folding it into the base", async () => {
    const routes = new RouteBook();
    routes.add("/page", HeadPage);
    const loaded = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/page?tab=analytics"),
      data: {},
      signal: new AbortController().signal,
    });
    expect(loaded.kind).toBe("ready");
    if (loaded.kind !== "ready") return;
    expect(loaded.head.title).toBe("Analytics:analytics");
    expect(loaded.baseHead?.title).toBe("Base");
    expect(loaded.regionHead?.title).toBe("Analytics:analytics");
    expect(loaded.page?.region.value).toBe("analytics");
    expect(loaded.page?.regionContent.value).toBe("Analytics:analytics");
  });

  it("cancels the navigation when regionWillLeave rejects", async () => {
    const page = new HookPage();
    await primeRegion(page, "overview");
    page.rejectTo = "analytics";
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(page.leave).toEqual([{ from: "overview", to: "analytics" }]);
      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("denied:analytics");
      expect(h.pushedPaths).toEqual([]);
      expect(h.currentIndex()).toBe(0);
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");

      // The runtime is not stuck: a later navigation still resolves.
      h.client.navigate("/page?tab=settings");
      await flush();
      expect(page.region.value).toBe("settings");
      expect(h.pushedPaths).toEqual(["/page?tab=settings"]);
    } finally { h.restore(); }
  });

  it("does not run leave hooks for a same-region apply", async () => {
    const page = new HookPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=bogus");
      await flush();

      expect(page.leave).toEqual([]);
      expect(h.errors).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(h.url.value.search).toBe("?tab=overview");
    } finally { h.restore(); }
  });

  it("fires regionDidEnter after the content flush settles", async () => {
    const page = new HookPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(page.entered).toEqual([{ region: "analytics", content: "Analytics:analytics" }]);
      expect(h.errors).toHaveLength(0);

      h.client.navigate("/page?tab=settings");
      await flush();
      expect(page.entered.at(-1)).toEqual({ region: "settings", content: "Settings:settings" });
      // A hook error is reported after the swap has committed.
      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("enter failed");
      expect(page.region.value).toBe("settings");
      expect(page.regionContent.value).toBe("Settings:settings");

      // The initial region never fires the entry hook.
      expect(page.entered.map(entry => entry.region)).toEqual(["analytics", "settings"]);
    } finally { h.restore(); }
  });

  it("renders the 404 page for a strict unknown region on the initial load", async () => {
    const app = new Yvee({ history: false, id: "strict-regions-ssr" });
    app.register(route("/page")(StrictPage));
    const renderer = app.server();

    const missing = await renderer.withStatus({ url: "/page?tab=missing" });
    expect(missing.status).toBe(404);
    expect(missing.html).toContain("Page not found");
    expect(missing.html).not.toContain("Overview");

    const known = await renderer.withStatus({ url: "/page?tab=analytics" });
    expect(known.status).toBe(200);
    expect(known.html).toContain("Analytics");

    const routes = new RouteBook();
    routes.add("/page", StrictPage);
    const loaded = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/page?tab=missing"),
      data: {},
      signal: new AbortController().signal,
    });
    expect(loaded.kind).toBe("ready");
    if (loaded.kind !== "ready") return;
    expect(loaded.status).toBe(404);
    expect(loaded.page).toBeInstanceOf(MissingPage);
  });

  it("denies a strict unknown region on soft navigation and restores the URL", async () => {
    const page = new StrictPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=missing");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.pushedPaths).toEqual([]);
      expect(h.currentIndex()).toBe(0);
      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("Unknown Yvee region: missing");
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(h.entries[0]!.path).toBe("/page?tab=overview");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview");

      // Mixed hash variants follow the same deny rule.
      h.client.navigate("/page?tab=missing#x");
      await flush();
      expect(h.pushedPaths).toEqual([]);
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.url.value.hash).toBe("");
      expect(h.errors).toHaveLength(2);

      // A strict pop back to an unknown id is denied and the entry restored.
      h.setIndex(0);
      h.pop(toURL("/page?tab=missing"));
      await flush();
      expect(page.region.value).toBe("overview");
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=overview");
    } finally { h.restore(); }
  });

  it("keeps the default-region fallback when strictRegions is off", async () => {
    const page = new HookPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=missing");
      await flush();

      expect(h.errors).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(h.url.value.search).toBe("?tab=overview");
      // Fallback canonicalizes the pushed entry in place, as before.
      expect(h.pushedPaths).toEqual(["/page?tab=missing"]);
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=overview");
    } finally { h.restore(); }
  });
});

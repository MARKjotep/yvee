import { describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { loadPage, type PageLoad } from "../../src/yvee/client/load-page";
import { renderRegion } from "../../src/yvee/client/regions";
import { Page, type RegionLeaveContext } from "../../src/yvee/pages/page";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";
import { RouteBook } from "../../src/yvee/routing/routes";
import { Yvee, isClient, route } from "../../src/yvee";
import type { RegionGuard, RegionGuardContext } from "../../src/yvee";

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
 * Client harness with a fake history stack, matching the region lifecycle
 * suites. The client is wired directly so guards can be observed without a
 * real document.
 */
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
  const transitions: YveeURL[] = [];
  const errors: unknown[] = [];
  const client = new YveeClient({
    id: "region-guards-test",
    base: "/",
    useHistory: true,
    url,
    root,
    app: "guard-app",
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
    client, internal, url, root, transitions, errors, entries, pushedPaths,
    start, restore, pop,
    currentIndex() { return index; },
    setIndex(next: number) { index = next; },
  };
}

class GuardPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override regionGuards: Record<string, RegionGuard[]> = {};
  log: string[] = [];
  contexts: RegionGuardContext[] = [];
  override regions = {
    overview: async () => ({
      default: () => { this.log.push("render:overview"); return "Overview"; },
    }),
    analytics: async () => ({
      default: () => { this.log.push("render:analytics"); return "Analytics"; },
    }),
    settings: async () => ({
      default: () => { this.log.push("render:settings"); return "Settings"; },
    }),
  };

  override regionWillLeave(context: RegionLeaveContext<Record<string, unknown>>) {
    this.log.push(`leave:${context.to}`);
  }

  override body() { return this.regionContent; }
}

/** A guard that records its context and returns the supplied decision. */
function guard(
  page: GuardPage,
  decide: (context: RegionGuardContext) => ReturnType<RegionGuard>,
): RegionGuard {
  return (context) => {
    page.contexts.push(context);
    page.log.push(`guard:${context.region}`);
    return decide(context);
  };
}

async function primeRegion(page: Page, id: string) {
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
}

describe("region guards", () => {
  it("denies a soft swap with stop without touching URL, history, hooks or view", async () => {
    const page = new GuardPage();
    await primeRegion(page, "overview");
    page.log = [];
    page.regionGuards.analytics = [guard(page, () => ({ kind: "stop" }))];
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(h.pushedPaths).toEqual([]);
      expect(h.currentIndex()).toBe(0);
      expect(h.entries[0]!.path).toBe("/page?tab=overview");
      expect(h.url.value.search).toBe("?tab=overview");
      expect(h.internal.currentURL?.search).toBe("?tab=overview");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview");
      // The leave hook never fires: a denied target is never left for.
      expect(page.log).toEqual(["guard:analytics"]);
      expect(h.errors).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("redirects a soft swap through navigate with replace", async () => {
    const page = new GuardPage();
    await primeRegion(page, "overview");
    page.log = [];
    page.regionGuards.analytics = [
      guard(page, () => ({ kind: "redirect", to: "/page?tab=settings" })),
    ];
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(page.region.value).toBe("settings");
      expect(page.regionContent.value).toBe("Settings");
      expect(page.regionGuards.settings).toBeUndefined();
      // The redirect replaces the entry; the denied target never commits.
      expect(h.pushedPaths).toEqual([]);
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=settings");
      expect(h.url.value.search).toBe("?tab=settings");
      // The guard ran before the leave hook, so the leave hook never fired.
      expect(page.log).toEqual(["guard:analytics", "leave:settings", "render:settings"]);
      expect(h.errors).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("bounds a redirect loop after ten region guard redirects", async () => {
    const page = new GuardPage();
    await primeRegion(page, "overview");
    let calls = 0;
    page.regionGuards.analytics = [
      (context) => {
        calls++;
        page.contexts.push(context);
        return { kind: "redirect", to: "/page?tab=analytics" };
      },
    ];
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();

      expect(h.errors).toHaveLength(1);
      expect((h.errors[0] as Error).message).toBe("Yvee redirect limit exceeded.");
      expect(calls).toBe(11);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview");
      expect(h.pushedPaths).toEqual([]);
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=overview");
      expect(h.url.value.search).toBe("?tab=overview");
    } finally { h.restore(); }
  });

  it("runs entry-region guards on the initial load and returns the redirect", async () => {
    const seen: RegionGuardContext[] = [];
    class LoadPage extends Page {
      override regionParam = "tab";
      override defaultRegion = "overview";
      override regionGuards = {
        overview: [((context: RegionGuardContext) => {
          seen.push(context);
          return { kind: "redirect" as const, to: "/login", returnTo: true };
        }) as RegionGuard],
      };
      override regions = {
        overview: async () => ({ default: () => "Overview" }),
      };
      override body() { return this.regionContent; }
    }

    const routes = new RouteBook();
    routes.add("/page", LoadPage);
    // An unknown id resolves to the default region before guards run, so the
    // guard sees (and gates) the region the page will actually display.
    const result = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/page?tab=bogus"),
      data: {},
      signal: new AbortController().signal,
    });

    expect(result.kind).toBe("redirect");
    if (result.kind !== "redirect") return;
    expect(result.to.startsWith("/login?returnTo=")).toBe(true);
    expect(decodeURIComponent(result.to.split("returnTo=")[1]!)).toBe("/page?tab=bogus");
    expect(seen).toHaveLength(1);
    expect(seen[0]!.region).toBe("overview");
    expect(seen[0]!.from).toBeUndefined();
    expect(seen[0]!.app).toEqual({});
    expect(seen[0]!.server).toBe(!isClient);
  });

  it("stops the initial load when an entry-region guard returns stop", async () => {
    class StoppedPage extends Page {
      override regionParam = "tab";
      override defaultRegion = "overview";
      override regionGuards = {
        overview: [(() => ({ kind: "stop" as const })) as RegionGuard],
      };
      override regions = {
        overview: async () => ({ default: () => "Overview" }),
      };
      override body() { return this.regionContent; }
    }

    const routes = new RouteBook();
    routes.add("/page", StoppedPage);
    const result = await loadPage({
      app: {},
      routes,
      globalGuards: [],
      errors: new Map(),
      url: toURL("/page?tab=overview"),
      data: {},
      signal: new AbortController().signal,
    });

    expect(result).toEqual({ kind: "stop" });
  });

  it("lets an initial-load region guard allow the load", async () => {
    class AllowedPage extends Page {
      override regionParam = "tab";
      override defaultRegion = "overview";
      override regionGuards = {
        overview: [(() => undefined) as RegionGuard],
      };
      override regions = {
        overview: async () => ({ default: () => "Overview" }),
      };
      override body() { return this.regionContent; }
    }

    const routes = new RouteBook();
    routes.add("/page", AllowedPage);
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
    expect(loaded.status).toBe(200);
    expect(loaded.page?.region.value).toBe("overview");
    expect(loaded.page?.regionContent.value).toBe("Overview");
  });

  it("sends the initial-load region guard through the server redirect loop", async () => {
    class GatedPage extends Page {
      override regionParam = "tab";
      override defaultRegion = "overview";
      override regionGuards = {
        overview: [(() => ({ kind: "redirect" as const, to: "/login" })) as RegionGuard],
      };
      override regions = {
        overview: async () => ({ default: () => "Overview" }),
      };
      override body() { return this.regionContent; }
    }
    class LoginPage extends Page {
      override body() { return "Please sign in"; }
    }

    const app = new Yvee({ history: false, id: "region-guard-ssr" });
    app.register(route("/page")(GatedPage), route("/login")(LoginPage));
    const html = await app.server()({ url: "/page?tab=overview" });

    expect(html).toContain("Please sign in");
    expect(html).not.toContain("Overview");
  });

  it("restores the previous URL when a pop is denied by a region guard", async () => {
    const page = new GuardPage();
    await primeRegion(page, "overview");
    page.regionGuards.settings = [guard(page, () => ({ kind: "stop" }))];
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(page.region.value).toBe("analytics");
      page.log = [];

      // Native Back moved history to the overview entry; the pop asks for a
      // guarded region and is denied before any swap.
      h.setIndex(0);
      h.pop(toURL("/page?tab=settings"));
      await flush();

      expect(page.log).toEqual(["guard:settings"]);
      expect(page.region.value).toBe("analytics");
      expect(page.regionContent.value).toBe("Analytics");
      expect(h.internal.currentURL?.search).toBe("?tab=analytics");
      expect(h.url.value.search).toBe("?tab=analytics");
      expect(h.entries[h.currentIndex()]!.path).toBe("/page?tab=analytics");
      expect(h.errors).toHaveLength(0);
    } finally { h.restore(); }
  });

  it("passes the previous region as from and runs guards before the leave hook", async () => {
    const page = new GuardPage();
    await primeRegion(page, "overview");
    page.log = [];
    page.regionGuards.settings = [guard(page, () => ({ kind: "allow" }))];
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=settings");
      await flush();

      expect(page.contexts).toHaveLength(1);
      expect(page.contexts[0]!.region).toBe("settings");
      expect(page.contexts[0]!.from).toBe("overview");
      expect(page.contexts[0]!.page).toBe(page);
      expect(page.contexts[0]!.server).toBe(!isClient);
      expect(page.contexts[0]!.signal.aborted).toBe(false);
      // Guard first, then leave hook, then the swap render.
      expect(page.log).toEqual(["guard:settings", "leave:settings", "render:settings"]);
      expect(page.region.value).toBe("settings");

      // A second switch reports the region left immediately before it.
      h.client.navigate("/page?tab=overview");
      await flush();
      expect(page.contexts).toHaveLength(1);
      expect(page.region.value).toBe("overview");
    } finally { h.restore(); }
  });
});

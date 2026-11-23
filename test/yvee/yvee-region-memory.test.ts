import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import { YveeClient } from "../../src/yvee/client/runtime";
import type { RouteHistory } from "../../src/yvee/client/runtime/history";
import type { ScrollPosition } from "../../src/yvee/client/runtime/types";
import { loadPage } from "../../src/yvee/client/load-page";
import {
  clearRegionMemory,
  recallRegion,
  regionMemoryKey,
  rememberRegion,
  renderRegion,
} from "../../src/yvee/client/regions";
import { Page } from "../../src/yvee/pages/page";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";
import { RouteBook } from "../../src/yvee/routing/routes";
import { Yvee, route } from "../../src/yvee";

class MemoryPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override rememberRegion = true;
  override regions = {
    overview: async () => ({ default: ({ page }: { page: Page }) => `Overview:${page.region.value}` }),
    analytics: async () => ({ default: ({ page }: { page: Page }) => `Analytics:${page.region.value}` }),
    settings: async () => ({ default: ({ page }: { page: Page }) => `Settings:${page.region.value}` }),
  };
  override body() { return this.regionContent; }
}

class ForgetfulPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override regions = {
    overview: async () => ({ default: ({ page }: { page: Page }) => `Overview:${page.region.value}` }),
    analytics: async () => ({ default: ({ page }: { page: Page }) => `Analytics:${page.region.value}` }),
    settings: async () => ({ default: ({ page }: { page: Page }) => `Settings:${page.region.value}` }),
  };
  override body() { return this.regionContent; }
}

class NarrowPage extends Page {
  override regionParam = "tab";
  override defaultRegion = "overview";
  override rememberRegion = true;
  override regions = {
    overview: async () => ({ default: ({ page }: { page: Page }) => `Overview:${page.region.value}` }),
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
  navigation: { options: { onPop(url: YveeURL, state: unknown): void } };
  watchURL(): Promise<() => void>;
  transition(url: YveeURL, fromHistory?: boolean, scroll?: ScrollPosition): Promise<void>;
}

interface Entry { state: Record<string, unknown>; path: string; }

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
  const viewport = {
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
    id: "region-memory-test",
    base: "/",
    useHistory: true,
    url,
    root,
    load: (target) => Promise.resolve({
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

  return {
    client, internal, url, transitions, errors, pushedPaths, start, restore,
    /** Finish the fake transition to `path` so the next navigation is free. */
    settle(path: string, next: Page = new Page()) {
      internal.pendingNavigation = undefined;
      internal.currentURL = toURL(path);
      internal.activePage = next;
    },
    pop(target: YveeURL) {
      internal.navigation.options.onPop(target, entries[index]!.state);
    },
    setIndex(next: number) { index = next; },
  };
}

async function primeRegion(page: Page, id: string) {
  page.region.value = id;
  page.regionContent.value = await renderRegion(page, id);
}

/** Install a sessionStorage replacement for the duration of one test. */
function installStorage(storage: unknown) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get: () => storage,
  });
  return () => {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  };
}

function memoryStorage(store: Map<string, string>) {
  return {
    get length() { return store.size; },
    key(index: number) { return [...store.keys()][index] ?? null; },
    getItem(key: string) { return store.get(key) ?? null; },
    setItem(key: string, value: string) { store.set(key, value); },
    removeItem(key: string) { store.delete(key); },
    clear() { store.clear(); },
  };
}

beforeEach(() => { clearRegionMemory(); });
afterEach(() => { clearRegionMemory(); });

describe("region memory", () => {
  it("restores the last active region for a region-less in-app navigation", async () => {
    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(page.region.value).toBe("analytics");
      expect(recallRegion("/page")?.id).toBe("analytics");

      // Leave the page, then come back through a link that omits the region.
      h.client.navigate("/other");
      await flush();
      h.settle("/other");
      h.client.navigate("/page");
      await flush();

      expect(h.transitions).toHaveLength(2);
      expect(h.transitions[1]!.path).toBe("/page");
      expect(h.transitions[1]!.params.get("tab")).toBe("analytics");
      // The pushed entry is the canonical rewritten URL, not the bare link.
      expect(h.pushedPaths.at(-1)).toBe("/page?tab=analytics");

      // The rewritten URL renders the remembered region through the loader.
      const routes = new RouteBook();
      routes.add("/page", MemoryPage);
      const loaded = await loadPage({
        app: {},
        routes,
        globalGuards: [],
        errors: new Map(),
        url: h.transitions.at(-1)!,
        data: {},
        signal: new AbortController().signal,
      });
      expect(loaded.kind).toBe("ready");
      if (loaded.kind === "ready") {
        expect(loaded.page?.region.value).toBe("analytics");
        expect(loaded.page?.regionContent.value).toBe("Analytics:analytics");
      }
    } finally { h.restore(); }
  });

  it("keeps same-path region-less navigations on the default region", async () => {
    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(page.region.value).toBe("analytics");
      expect(recallRegion("/page")?.id).toBe("analytics");

      // An in-page tab link such as the Overview tab stays a region swap to the
      // default region; memory must not rewrite it back to analytics.
      h.client.navigate("/page");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(h.pushedPaths.at(-1)).toBe("/page");
      expect(recallRegion("/page")?.id).toBe("overview");
    } finally { h.restore(); }
  });

  it("keeps unrelated target query parameters while rewriting the region", async () => {
    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.client.navigate("/page?tab=settings");
      await flush();
      expect(recallRegion("/page")?.id).toBe("settings");

      h.client.navigate("/other");
      await flush();
      h.settle("/other");
      h.client.navigate("/page?x=1");
      await flush();

      expect(h.transitions).toHaveLength(2);
      expect(h.transitions[1]!.params.get("x")).toBe("1");
      expect(h.transitions.at(-1)!.params.get("tab")).toBe("settings");
    } finally { h.restore(); }
  });

  it("records nothing and restores nothing for pages without the flag", async () => {
    const page = new ForgetfulPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(page.region.value).toBe("analytics");
      expect(recallRegion("/page")).toBeUndefined();

      h.client.navigate("/other");
      await flush();
      h.settle("/other");
      h.client.navigate("/page");
      await flush();

      expect(h.transitions).toHaveLength(2);
      expect(h.transitions[1]!.params.has("tab")).toBe(false);

      // The plain URL loads the default region, as it does without memory.
      const routes = new RouteBook();
      routes.add("/page", ForgetfulPage);
      const loaded = await loadPage({
        app: {},
        routes,
        globalGuards: [],
        errors: new Map(),
        url: h.transitions[1]!,
        data: {},
        signal: new AbortController().signal,
      });
      expect(loaded.kind).toBe("ready");
      if (loaded.kind === "ready") {
        expect(loaded.page?.region.value).toBe("overview");
        expect(loaded.page?.regionContent.value).toBe("Overview:overview");
      }
    } finally { h.restore(); }
  });

  it("lets an explicit region parameter win over the remembered region", async () => {
    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(recallRegion("/page")?.id).toBe("analytics");

      h.client.navigate("/other");
      await flush();
      h.settle("/other");
      h.client.navigate("/page?tab=settings");
      await flush();

      expect(h.transitions).toHaveLength(2);
      expect(h.transitions[1]!.params.get("tab")).toBe("settings");
      expect(recallRegion("/page")?.id).toBe("analytics");
    } finally { h.restore(); }
  });

  it("applies the default region for a same-page link from a non-default region", async () => {
    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.client.navigate("/page?tab=settings");
      await flush();
      expect(page.region.value).toBe("settings");
      expect(recallRegion("/page")?.id).toBe("settings");

      // Plain same-page link while settings is active: overview, not settings.
      h.client.navigate("/page");
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
      expect(h.pushedPaths.at(-1)).toBe("/page");
    } finally { h.restore(); }
  });

  it("drops a remembered id the page no longer declares", async () => {
    const store = new Map<string, string>();
    const restoreStorage = installStorage(memoryStorage(store));
    try {
      store.set(regionMemoryKey("/page"), JSON.stringify({
        regionParam: "tab",
        id: "analytics",
        regionIds: ["overview"],
      }));

      expect(recallRegion("/page")).toBeUndefined();
      expect(store.has(regionMemoryKey("/page"))).toBe(false);
    } finally { restoreStorage(); }

    // A record whose snapshot still lists the id cannot be rewritten into a
    // region the loaded page no longer declares: the loader falls back to the
    // default region.
    rememberRegion(new MemoryPage(), toURL("/page"), "analytics");
    expect(recallRegion("/page")?.id).toBe("analytics");
    const routes = new RouteBook();
    routes.add("/page", NarrowPage);
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
    if (loaded.kind === "ready") expect(loaded.page?.region.value).toBe("overview");
    clearRegionMemory("/page");

    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();
      h.client.navigate("/other");
      await flush();
      h.settle("/other");
      h.client.navigate("/page");
      await flush();
      expect(h.transitions).toHaveLength(2);
      expect(h.transitions[1]!.params.has("tab")).toBe(false);
      expect(page.region.value).toBe("overview");
    } finally { h.restore(); }
  });

  it("falls back to in-memory records when sessionStorage is unavailable", async () => {
    const restoreAccess = installStorage(undefined);
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get() { throw new Error("storage is blocked"); },
    });
    try {
      const page = new MemoryPage();
      await primeRegion(page, "overview");
      const h = harness(page);
      try {
        await h.start();
        h.client.navigate("/page?tab=analytics");
        await flush();
        expect(recallRegion("/page")?.id).toBe("analytics");

        h.client.navigate("/other");
        await flush();
        h.settle("/other");
        h.client.navigate("/page");
        await flush();

        expect(h.transitions).toHaveLength(2);
        expect(h.transitions[1]!.params.get("tab")).toBe("analytics");
      } finally { h.restore(); }
    } finally { restoreAccess(); }

    const restoreThrowingMethods = installStorage({
      get length(): number { throw new Error("storage is blocked"); },
      key(): string | null { throw new Error("storage is blocked"); },
      getItem(): string | null { throw new Error("storage is blocked"); },
      setItem(): void { throw new Error("storage is blocked"); },
      removeItem(): void { throw new Error("storage is blocked"); },
      clear(): void { throw new Error("storage is blocked"); },
    });
    try {
      rememberRegion(new MemoryPage(), toURL("/page"), "settings");
      expect(recallRegion("/page")?.id).toBe("settings");
    } finally { restoreThrowingMethods(); }
  });

  it("updates the memory after region swaps and region-only pops", async () => {
    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page);
    try {
      await h.start();

      h.client.navigate("/page?tab=analytics");
      await flush();
      expect(recallRegion("/page")?.id).toBe("analytics");

      h.client.navigate("/page?tab=settings");
      await flush();
      expect(recallRegion("/page")?.id).toBe("settings");
      expect(page.region.value).toBe("settings");

      // Native Back to the analytics entry applies a region-only pop.
      h.setIndex(1);
      h.pop(toURL("/page?tab=analytics"));
      await flush();

      expect(h.transitions).toHaveLength(0);
      expect(page.region.value).toBe("analytics");
      expect(recallRegion("/page")?.id).toBe("analytics");
    } finally { h.restore(); }
  });

  it("does not rewrite the initial document load", async () => {
    rememberRegion(new MemoryPage(), toURL("/page"), "analytics");
    expect(recallRegion("/page")?.id).toBe("analytics");

    const page = new MemoryPage();
    await primeRegion(page, "overview");
    const h = harness(page, "/page");
    try {
      await h.start();

      // Starting at the bare URL keeps the default region; only in-app
      // navigations consult the memory.
      expect(h.transitions).toHaveLength(0);
      expect(h.url.value.search).toBe("");
      expect(page.region.value).toBe("overview");
      expect(page.regionContent.value).toBe("Overview:overview");
    } finally { h.restore(); }

    // SSR likewise follows the requested URL, never the client memory.
    const app = new Yvee({ history: false, id: "region-memory-ssr" });
    app.register(route("/dashboard")(MemoryPage));
    rememberRegion(new MemoryPage(), toURL("/dashboard"), "analytics");
    const plain = await app.server()({ url: "/dashboard" });
    expect(plain).toContain("Overview:overview");
    expect(plain).not.toContain("Analytics:analytics");
    const analytics = await app.server()({ url: "/dashboard?tab=analytics" });
    expect(analytics).toContain("Analytics:analytics");
  });
});

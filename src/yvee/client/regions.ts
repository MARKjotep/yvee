import type { RegionCache, RegionLoader, RegionModule, Page } from "../pages/page";
import { normalizeHeadValue, type HeadConfig } from "../rendering/head";
import type { YveeURL } from "../routing/path";

type RegionPage = Page & {
  regions: Record<string, RegionLoader>;
  regionParam: string;
};

/**
 * Outcome of resolving a URL's region selector. `unknown` is set when the URL
 * named a region the page does not declare; `id` is then the fallback region,
 * if the page has one.
 */
export type RegionResolution =
  | { id: string; unknown?: undefined }
  | { unknown: string; id?: string };

const moduleCache = new WeakMap<Page, Map<string, Promise<RegionModule>>>();

/** True when the page declares both a region parameter and at least one region. */
export function hasRegions(page: Page | undefined): page is RegionPage {
  return Boolean(page?.regions && Object.keys(page.regions).length && page.regionParam);
}

export function defaultRegionId(page: Page): string | undefined {
  if (!page.regions) return undefined;
  if (page.defaultRegion && page.regions[page.defaultRegion]) {
    return page.defaultRegion;
  }
  return Object.keys(page.regions)[0];
}

/**
 * Resolve the region requested by `url`, keeping unknown ids distinguishable
 * from a plain default fallback so strict pages can reject them.
 */
export function resolveRegionId(page: Page, url: YveeURL): RegionResolution | undefined {
  if (!page.regions || !page.regionParam) return undefined;
  const requested = url.params.get(page.regionParam);
  if (requested && page.regions[requested]) return { id: requested };
  if (requested) {
    const fallback = defaultRegionId(page);
    return fallback === undefined ? { unknown: requested } : { unknown: requested, id: fallback };
  }
  const id = defaultRegionId(page);
  return id === undefined ? undefined : { id };
}

/**
 * Region id requested by `url`, or the page default when the parameter is
 * missing or names a region that is not configured.
 */
export function regionIdFor(page: Page, url: YveeURL): string | undefined {
  return resolveRegionId(page, url)?.id;
}

/** Import one region module at most once per page. */
export function regionModule(page: Page, id: string): Promise<RegionModule> {
  const loader = page.regions?.[id];
  if (!loader) return Promise.reject(new Error(`Unknown Yvee region: ${id}`));
  let cache = moduleCache.get(page);
  if (!cache) {
    cache = new Map();
    moduleCache.set(page, cache);
  }
  let entry = cache.get(id);
  if (!entry) {
    entry = loader();
    cache.set(id, entry);
  }
  return entry;
}

/**
 * Head contributed by one loaded region module. Region heads follow the same
 * `head` contract as body modules: a value or a function of the page.
 */
export async function regionHead(page: Page, module: RegionModule): Promise<HeadConfig | undefined> {
  const head = module.head;
  if (head === undefined) return undefined;
  const value = typeof head === "function" ? await head({ page }) : await head;
  if (value === undefined || value === null) return undefined;
  return normalizeHeadValue(value);
}

/** Resolve the view output for a region using the page's current data and state. */
export async function renderRegion(page: Page, id: string): Promise<unknown> {
  const module = await regionModule(page, id);
  return await module.default({ page, cache: regionCache(page, id) });
}

/** Region values retained per page; entries die with the page instance. */
const keepAliveMemory = new WeakMap<Page, Map<string, unknown>>();
/** Region entries retained when `Page.keepAlive` is `true`. */
const DEFAULT_KEEP_ALIVE = 5;

/** A cache that never retains anything, used by pages without `keepAlive`. */
const noCache: RegionCache = {
  get: () => undefined,
  set: () => {},
};

/**
 * Number of regions retained for `page`, or `0` when keep-state is off. A
 * non-positive or non-finite explicit bound disables retention.
 */
function keepAliveBound(page: Page): number {
  const value = page.keepAlive;
  if (value === undefined) return 0;
  const bound = value === true ? DEFAULT_KEEP_ALIVE : value;
  return Number.isFinite(bound) && bound > 0 ? Math.floor(bound) : 0;
}

/**
 * Retained-state store for one region of `page`. Pages without `keepAlive`
 * receive a shared no-op cache so region modules can always read `cache`; the
 * bound (`true` = five regions) evicts the oldest-inserted entry.
 */
export function regionCache(page: Page, region: string): RegionCache {
  const bound = keepAliveBound(page);
  if (!bound) return noCache;
  let entries = keepAliveMemory.get(page);
  if (!entries) {
    entries = new Map();
    keepAliveMemory.set(page, entries);
  }
  const store = entries;
  return {
    get: () => store.get(region),
    set: (value: unknown) => {
      // Re-inserting moves the region to the newest position.
      store.delete(region);
      store.set(region, value);
      while (store.size > bound) {
        const oldest = store.keys().next();
        if (oldest.done) break;
        store.delete(oldest.value);
      }
    },
  };
}

/**
 * Drop every retained region value of a disposed page. The store is keyed by
 * the page, so this only matters when the page object outlives its activation
 * (tests and repeated loads); no value can leak to another page either way.
 * @internal
 */
export function clearRegionCache(page: Page) {
  keepAliveMemory.delete(page);
}

/** Scroll offset remembered for one tracked region container. */
export interface RegionScrollPosition {
  /** Vertical scroll offset in pixels. */
  top: number;
  /** Horizontal scroll offset in pixels. */
  left: number;
}

/** Elements that expose the scroll offsets the runtime reads and writes. */
interface ScrollContainer {
  getAttribute(name: string): string | null;
  scrollTop: number;
  scrollLeft: number;
}

/**
 * Region-local scroll positions, keyed per page and region. The map dies with
 * the page instance; positions never cross documents or tabs.
 */
const scrollMemory = new WeakMap<Page, Map<string, Map<string, RegionScrollPosition>>>();

function scrollContainers(root: ParentNode | undefined): ScrollContainer[] {
  if (!root || typeof root.querySelectorAll !== "function") return [];
  try {
    return Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-key]"));
  } catch {
    return [];
  }
}

function scrollKey(container: ScrollContainer): string | undefined {
  const key = typeof container.getAttribute === "function"
    ? container.getAttribute("data-scroll-key")
    : null;
  return key ? key : undefined;
}

/**
 * Capture the offsets of every `data-scroll-key` container in the outgoing
 * region. Call while the old region DOM is still mounted.
 */
export function captureRegionScroll(
  page: Page,
  region: string,
  root: ParentNode | undefined = defaultScrollRoot(),
): void {
  const containers = scrollContainers(root);
  if (!containers.length) return;
  let regions = scrollMemory.get(page);
  if (!regions) {
    regions = new Map();
    scrollMemory.set(page, regions);
  }
  let entry = regions.get(region);
  if (!entry) {
    entry = new Map();
    regions.set(region, entry);
  }
  for (const container of containers) {
    const key = scrollKey(container);
    if (!key) continue;
    entry.set(key, { top: container.scrollTop, left: container.scrollLeft });
  }
}

/**
 * Restore captured offsets for the incoming region. Containers without a
 * stored entry keep their natural position. Returns `true` when at least one
 * container was restored.
 */
export function restoreRegionScroll(
  page: Page,
  region: string,
  root: ParentNode | undefined = defaultScrollRoot(),
): boolean {
  const stored = scrollMemory.get(page)?.get(region);
  if (!stored || stored.size === 0) return false;
  let restored = false;
  for (const container of scrollContainers(root)) {
    const key = scrollKey(container);
    if (!key) continue;
    const position = stored.get(key);
    if (!position) continue;
    container.scrollTop = position.top;
    container.scrollLeft = position.left;
    restored = true;
  }
  return restored;
}

function defaultScrollRoot(): ParentNode | undefined {
  return typeof document === "undefined" ? undefined : document;
}

/** Compare query maps while ignoring the region selector, independent of key order. */
export function sameRegionSearch(a: YveeURL, b: YveeURL, regionParam: string): boolean {
  const left = searchPairs(a, regionParam);
  const right = searchPairs(b, regionParam);
  return left.length === right.length &&
    left.every(([key, value], index) => key === right[index]![0] && value === right[index]![1]);
}

/**
 * URL with the region parameter normalized to the region actually rendered.
 * Returns `undefined` when the URL already names a configured region or omits
 * the parameter (the default region needs no query).
 */
export function canonicalRegionURL(page: Page, url: YveeURL): YveeURL | undefined {
  if (!page.regions || !page.regionParam) return undefined;
  const requested = url.params.get(page.regionParam);
  if (!requested || page.regions[requested]) return undefined;
  const id = defaultRegionId(page);
  if (!id) return undefined;
  const params = new URLSearchParams(url.params);
  params.set(page.regionParam, id);
  const search = params.toString();
  return { ...url, search: search ? `?${search}` : "", params };
}

/** Region remembered for one route path, captured when that region became active. */
export interface RememberedRegion {
  /** Region query parameter declared by the page that recorded the snapshot. */
  regionParam: string;
  /** Last active region id. */
  id: string;
  /** Region ids declared by the page when the snapshot was captured. */
  regionIds: string[];
}

const MEMORY_PREFIX = "yvee:region";
const remembered = new Map<string, RememberedRegion>();

/**
 * Storage key for a route path. Exposed for tests and diagnostics only.
 * @internal
 */
export function regionMemoryKey(path: string) {
  return `${MEMORY_PREFIX}:${path}`;
}

/**
 * Remember the active region of an opt-in page for `url.path`. Recording is
 * skipped for pages without `rememberRegion`, and storage failures (private
 * mode, `file:` documents, quota) silently keep the in-memory copy.
 */
export function rememberRegion(page: Page, url: YveeURL, id: string) {
  if (!page.rememberRegion || !page.regions || !page.regionParam) return;
  if (!page.regions[id]) return;
  const record: RememberedRegion = {
    regionParam: page.regionParam,
    id,
    regionIds: Object.keys(page.regions),
  };
  remembered.set(url.path, record);
  const storage = memoryStorage();
  if (!storage) return;
  try { storage.setItem(regionMemoryKey(url.path), JSON.stringify(record)); }
  catch { /* Storage is unavailable or full; the in-memory record still applies. */ }
}

/**
 * Last region remembered for `path`, or `undefined` when nothing was recorded
 * or the record no longer names a region it declared.
 */
export function recallRegion(path: string): RememberedRegion | undefined {
  const record = remembered.get(path) ?? storedRegion(path);
  if (!record) return undefined;
  if (!record.regionIds.includes(record.id)) {
    // The page config changed since the snapshot; never restore a dropped id.
    clearRegionMemory(path);
    return undefined;
  }
  remembered.set(path, record);
  return record;
}

/** Forget one path's remembered region, or every recorded path when omitted. */
export function clearRegionMemory(path?: string) {
  const storage = memoryStorage();
  if (path !== undefined) {
    remembered.delete(path);
    if (!storage) return;
    try { storage.removeItem(regionMemoryKey(path)); }
    catch { /* Ignore an unavailable store. */ }
    return;
  }
  remembered.clear();
  if (!storage) return;
  try {
    for (let index = storage.length - 1; index >= 0; index--) {
      const key = storage.key(index);
      if (key?.startsWith(`${MEMORY_PREFIX}:`)) storage.removeItem(key);
    }
  } catch { /* Ignore an unavailable store. */ }
}

function memoryStorage(): Storage | undefined {
  try {
    return typeof sessionStorage === "undefined" ? undefined : sessionStorage;
  } catch {
    return undefined;
  }
}

function storedRegion(path: string): RememberedRegion | undefined {
  const storage = memoryStorage();
  if (!storage) return undefined;
  try { return parseRegion(storage.getItem(regionMemoryKey(path))); }
  catch { return undefined; }
}

function parseRegion(raw: string | null): RememberedRegion | undefined {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<RememberedRegion>;
    if (!value.regionParam || !value.id) return undefined;
    if (!Array.isArray(value.regionIds)) return undefined;
    if (!value.regionIds.every(id => typeof id === "string")) return undefined;
    return { regionParam: value.regionParam, id: value.id, regionIds: value.regionIds };
  } catch {
    return undefined;
  }
}

function searchPairs(url: YveeURL, regionParam: string) {
  const pairs: [string, string][] = [];
  for (const [key, value] of url.params) {
    if (key !== regionParam) pairs.push([key, value]);
  }
  pairs.sort(([ak, av], [bk, bv]) =>
    ak === bk
      ? av < bv ? -1 : av > bv ? 1 : 0
      : ak < bk ? -1 : 1,
  );
  return pairs;
}

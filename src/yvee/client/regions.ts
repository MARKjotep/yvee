import type { RegionLoader, RegionModule, Page } from "../pages/page";
import type { YveeURL } from "../routing/path";

type RegionPage = Page & {
  regions: Record<string, RegionLoader>;
  regionParam: string;
};

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
 * Region id requested by `url`, or the page default when the parameter is
 * missing or names a region that is not configured.
 */
export function regionIdFor(page: Page, url: YveeURL): string | undefined {
  if (!page.regions || !page.regionParam) return undefined;
  const requested = url.params.get(page.regionParam);
  if (requested && page.regions[requested]) return requested;
  return defaultRegionId(page);
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

/** Resolve the view output for a region using the page's current data and state. */
export async function renderRegion(page: Page, id: string): Promise<unknown> {
  const module = await regionModule(page, id);
  return await module.default({ page });
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

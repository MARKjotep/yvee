import { combineHead, normalizeHeadValue, type HeadConfig, type HeadResult } from "../rendering/head";
import type { Page, RegionCache, RegionLoader, RegionModule } from "../pages/page";

declare const REGION_LEVEL: unique symbol;
const LEVEL_METADATA: unique symbol = Symbol("Yvee region level metadata");

/** Metadata `regionTree` records for one level id. */
export interface RegionLevelMetadata {
  /** View rendered by the bare level id. */
  readonly defaultView: string;
  /** Declared view segments, in declaration order. */
  readonly views: readonly string[];
}

/** Flat region map carrying the level metadata side channel. */
type RegionMapWithLevels = Record<string, RegionLoader> & {
  readonly [LEVEL_METADATA]?: Record<string, RegionLevelMetadata>;
};

/** Context passed to a level chrome module. */
export interface RegionChromeContext {
  /** Page that owns the region. */
  page: Page;
  /** Stateless cache: chrome must not retain state between renders. */
  cache: RegionCache;
  /** Render output of the active child view, to place where the panel belongs. */
  outlet: unknown;
}

/**
 * A lazily imported level chrome module. `default` renders the level shell and
 * places `outlet`; it must be stateless because the surrounding composite region
 * re-renders when the inner view changes.
 */
export interface RegionChromeModule {
  /** Render the level chrome around `outlet`. */
  default: (context: RegionChromeContext) => unknown | Promise<unknown>;
  /** Head contributed while the level is displayed, combined with the view head. */
  head?: HeadResult | ((context: { page: Page }) => HeadResult | Promise<HeadResult>);
}

/** Imports one level chrome module. */
export type RegionChromeLoader = () => Promise<RegionChromeModule>;

/** Configuration accepted by `regionLevel`. */
export interface RegionLevelOptions {
  /** Lazy chrome module that renders the shared level shell around the outlet. */
  chrome: RegionChromeLoader;
  /** View shown by the level id (`"analytics"`); defaults to the first `views` key. */
  default?: string;
  /** Child views keyed by their segment after the level id (`"analytics/<view>"`). */
  views: Record<string, RegionLoader>;
}

/**
 * A marked level produced by `regionLevel`. Pass it to `regionTree`; it is not a
 * `RegionLoader`, so nesting one inside `views` is a type error.
 */
export interface RegionLevel extends RegionLevelOptions {
  /** Compile-time marker; the runtime never reads it. */
  readonly [REGION_LEVEL]: true;
}

/**
 * Mark a level for `regionTree`: a level id plus chrome around one of its views.
 * Flattens to the level id (its default view) and one `<level>/<view>` id per
 * `views` entry. Two levels are supported by design.
 */
export function regionLevel(options: RegionLevelOptions): RegionLevel {
  return options as RegionLevel;
}

/**
 * Flatten a nested region declaration into the flat `regions` map that
 * `Page.regions` expects. Plain loaders are copied through unchanged; each
 * `regionLevel` adds its level id (the default view) and one composite
 * `<level>/<view>` id per view, all rendered inside the level chrome.
 *
 * Level ids and default views are recorded on the result and are readable
 * through `regionLevelIds` and `defaultViewFor`; they never appear as keys.
 */
export function regionTree(
  entries: Record<string, RegionLoader | RegionLevel>,
): Record<string, RegionLoader> {
  const flat: Record<string, RegionLoader> = {};
  const levels: Record<string, RegionLevelMetadata> = {};
  for (const [id, entry] of Object.entries(entries)) {
    if (isRegionLevel(entry)) levels[id] = expandLevel(flat, id, entry);
    else addLoader(flat, id, entry);
  }
  Object.defineProperty(flat, LEVEL_METADATA, { value: levels });
  return flat;
}

/**
 * Level ids recorded by `regionTree`, in declaration order; empty for maps
 * without level metadata (such as hand-built `Page.regions`).
 */
export function regionLevelIds(regions: Record<string, RegionLoader>): readonly string[] {
  const metadata = (regions as RegionMapWithLevels)[LEVEL_METADATA];
  return metadata ? Object.keys(metadata) : [];
}

/**
 * Default view of a level id from `regionTree`, or `undefined` for non-level
 * or unknown ids.
 */
export function defaultViewFor(
  regions: Record<string, RegionLoader>,
  regionId: string,
): string | undefined {
  return (regions as RegionMapWithLevels)[LEVEL_METADATA]?.[regionId]?.defaultView;
}

function isRegionLevel(entry: RegionLoader | RegionLevel): entry is RegionLevel {
  return typeof entry !== "function";
}

function expandLevel(
  flat: Record<string, RegionLoader>,
  levelId: string,
  level: RegionLevel,
): RegionLevelMetadata {
  const views = Object.keys(level.views);
  if (views.length === 0) throw new Error(`Yvee region level "${levelId}" has no views.`);
  const defaultView = level.default ?? views[0]!;
  if (!Object.hasOwn(level.views, defaultView)) {
    throw new Error(`Yvee region level "${levelId}" default view "${defaultView}" is not declared.`);
  }

  // The bare level id is a real key: it renders chrome around the default view.
  addLoader(flat, levelId, composeLevel(levelId, level.chrome, level.views[defaultView]!));
  for (const view of views) {
    addLoader(flat, `${levelId}/${view}`, composeLevel(levelId, level.chrome, level.views[view]!));
  }
  return { defaultView, views };
}

function addLoader(flat: Record<string, RegionLoader>, id: string, loader: RegionLoader) {
  if (Object.hasOwn(flat, id)) throw new Error(`Duplicate Yvee region id "${id}" in region tree.`);
  flat[id] = loader;
}

/** A cache that never retains anything; chrome must stay stateless. */
const statelessCache: RegionCache = {
  get: () => undefined,
  set: () => {},
};

/** Outlet render per page and level id; dies with the page instance. */
const outlets = new WeakMap<Page, Map<string, unknown>>();

function setOutlet(page: Page, levelId: string, value: unknown) {
  let byLevel = outlets.get(page);
  if (!byLevel) {
    byLevel = new Map();
    outlets.set(page, byLevel);
  }
  byLevel.set(levelId, value);
}

function outletFor(page: Page, levelId: string): unknown {
  return outlets.get(page)?.get(levelId);
}

/**
 * Compose one composite region: render the leaf with the runtime cache for the
 * composite id, then render the stateless chrome around it.
 */
function composeLevel(levelId: string, chrome: RegionChromeLoader, leaf: RegionLoader): RegionLoader {
  return async () => {
    const [chromeModule, leafModule] = await Promise.all([chrome(), leaf()]);
    const module: RegionModule = {
      default: async ({ page, cache }) => {
        const outlet = await leafModule.default({ page, cache });
        setOutlet(page, levelId, outlet);
        return chromeModule.default({
          page,
          cache: statelessCache,
          outlet: outletFor(page, levelId),
        });
      },
    };
    const head = levelHead(chromeModule, leafModule);
    if (head) module.head = head;
    return module;
  };
}

type RegionHead = NonNullable<RegionModule["head"]>;

/** Combine chrome and leaf heads the way the runtime combines region heads. */
function levelHead(chrome: RegionChromeModule, leaf: RegionModule): RegionHead | undefined {
  if (chrome.head === undefined && leaf.head === undefined) return undefined;
  return async ({ page }) => {
    const [chromeHead, leafHead] = await Promise.all([
      headValue(page, chrome),
      headValue(page, leaf),
    ]);
    if (!chromeHead) return leafHead;
    if (!leafHead) return chromeHead;
    return combineHead(chromeHead, leafHead);
  };
}

async function headValue(
  page: Page,
  source: { head?: RegionChromeModule["head"] },
): Promise<HeadConfig | undefined> {
  const head = source.head;
  if (head === undefined) return undefined;
  const value = typeof head === "function" ? await head({ page }) : await head;
  if (value === undefined || value === null) return undefined;
  return normalizeHeadValue(value);
}

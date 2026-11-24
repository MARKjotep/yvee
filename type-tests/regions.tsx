/**
 * Consumer-style type test for in-page regions.
 *
 * Everything below imports from the published entry point (`'yvee'`), exactly
 * like an external dashboard author would. It is compiled by `bun run
 * test:types` and doubles as a copyable template: it exercises every public
 * region capability without any `any` casts or relative `src` imports.
 */
import {
  Yvee, Page, dom, regionTree, regionLevel, regionLevelIds, defaultViewFor,
  type PageFetchContext,
  type RegionLoader,
  type RegionLevelMetadata,
  type RegionModule,
  type RegionCache,
  type RegionLeaveContext,
  type RegionEnterContext,
  type RegionGuard,
  type RegionGuardContext,
  type GuardApp,
  type RegionChromeContext,
  type RegionChromeLoader,
  type DOMContext,
} from 'yvee';

type DashboardData = {
  notes: { draft: boolean; summary: string };
  stats: { visits: number };
};

/** A region module with a typed `head`; real apps default-export this shape. */
const overviewRegion: RegionModule = {
  default: ({ page, cache }) => {
    // `cache` is plain data retained per region while `keepAlive` is set.
    const previous = cache.get() as { visits?: number } | undefined;
    const visits = (previous?.visits ?? 0) + 1;
    cache.set({ visits });
    return (
      <section>
        <h2>Overview</h2>
        <p>Active region: {page.region.value}</p>
        <p>Visits: {visits}</p>
      </section>
    );
  },
  head: ({ page }) => ({ title: `Dashboard — ${page.region.value}` }),
};

/** A `RegionLoader` can also be declared and reused like any other function. */
const analyticsRegion: RegionLoader = async () => ({
  default: ({ page, cache }: { page: Page; cache: RegionCache }) => {
    const saved = cache.get() as { depth?: number } | undefined;
    cache.set({ depth: (saved?.depth ?? 0) + 1 });
    return <p>Analytics for {page.region.value}: scroll depth {saved?.depth ?? 0}</p>;
  },
});

/**
 * Level chrome receives a stateless cache and the active child render as
 * `outlet`. The helper composes it with each `regionLevel` view.
 */
const analyticsChrome: RegionChromeLoader = async () => ({
  default: ({ page, cache, outlet }: RegionChromeContext) => {
    // Chrome must not retain state; the helper hands it a no-op cache.
    void cache.get();
    return (
      <section aria-label="Analytics">
        <h2>Analytics for {page.region.value}</h2>
        <div class="analytics-panel">{outlet as DOMContext}</div>
      </section>
    );
  },
  head: { title: 'Analytics' },
});

const analyticsViews: Record<string, RegionLoader> = {
  overview: async () => ({ default: () => <p>Analytics overview</p> }),
  retention: async () => ({ default: () => <p>Analytics retention</p> }),
};

const nestedLevel = regionLevel({ chrome: analyticsChrome, views: analyticsViews });

/** A nested region page authored through the public helpers only. */
class NestedDashboardPage extends Page<DashboardData> {
  regionParam = 'tab';
  defaultRegion = 'analytics';
  keepAlive: number | true = true;
  rememberRegion = true;

  regions = regionTree({
    overview: async () => ({ default: () => <p>Overview</p> }),
    analytics: regionLevel({
      chrome: analyticsChrome,
      default: 'overview',
      views: {
        ...analyticsViews,
        // @ts-expect-error A level view must be a RegionLoader, never a nested level.
        nested: nestedLevel,
      },
    }),
  });

  override body() {
    return <main>{this.regionContent}</main>;
  }
}

/**
 * A shared shell derives level-aware ARIA state from the declaration itself:
 * `regionLevelIds`/`defaultViewFor` read the metadata `regionTree` recorded, so
 * no parallel list of level ids is needed.
 */
function ariaCurrentFor(page: Page, tabId: string): 'page' | 'true' | 'false' {
  const regions = page.regions ?? {};
  const region = page.region.value;
  if (region === tabId) return 'page';
  const isLevel = regionLevelIds(regions).includes(tabId);
  const defaultView = defaultViewFor(regions, tabId);
  return isLevel && defaultView !== undefined && region.startsWith(`${tabId}/`)
    ? 'true'
    : 'false';
}

/** The per-level metadata shape is exported for consumer bookkeeping. */
const analyticsLevelMetadata: RegionLevelMetadata = {
  defaultView: 'overview',
  views: ['overview', 'retention'],
};
void analyticsLevelMetadata;

const nestedDashboard = new NestedDashboardPage();
// `Page.regions` stays a plain `Record<string, RegionLoader>` for consumers.
const nestedLevelIds: readonly string[] = regionLevelIds(nestedDashboard.regions);
const nestedDefaultView: string | undefined = defaultViewFor(nestedDashboard.regions, 'analytics');
void nestedLevelIds;
void nestedDefaultView;
void ariaCurrentFor;

/** Region-scoped guard: allow, or redirect to login with a return path. */
const billingGuard: RegionGuard<
  GuardApp<DashboardData>,
  Page<DashboardData>,
  DashboardData
> = (
  context: RegionGuardContext<GuardApp<DashboardData>, Page<DashboardData>, DashboardData>,
) => {
  const { region, from, data, server } = context;
  if (region === 'billing' && !data.notes.summary && !server)
    return { kind: 'redirect', to: '/login', returnTo: from ?? true };
  return { kind: 'allow' };
};

class DashboardPage extends Page<DashboardData> {
  // URL and lifecycle configuration.
  regionParam = 'tab';
  defaultRegion = 'overview';
  rememberRegion = true;
  keepAlive: number | true = true;
  refreshOnRegionChange = true;
  strictRegions = false;
  regionGuards = { billing: [billingGuard] };

  // Typed loaders; a real consumer would use `() => import('./regions/billing')`.
  regions = {
    overview: async () => overviewRegion,
    analytics: analyticsRegion,
    // billing: () => import('./regions/billing'),
  };

  override fetch(context: PageFetchContext<DashboardData>) {
    context.resources.defer(() => {});
    // Re-runs on every soft region change because of `refreshOnRegionChange`.
    return { notes: { ...context.data.notes, summary: `Fetched for ${context.params.id ?? 'dashboard'}` } };
  }

  override async regionWillLeave(context: RegionLeaveContext<DashboardData>) {
    if (context.to === 'billing' && context.data.notes.draft)
      throw new Error(`Save the ${context.from} notes before opening billing.`);
  }

  override regionDidEnter(context: RegionEnterContext) {
    // Region-scoped resources are disposed before the next region renders.
    this.regionResources.defer(() => {});
    void context.region;
  }

  override body() {
    return (
      <main class="dashboard">
        <nav class="dashboard-tabs">
          <a href="/dashboard?tab=overview" class={this.region.value === 'overview' ? 'active' : undefined}>Overview</a>
          <a href="/dashboard?tab=analytics" class={this.region.value === 'analytics' ? 'active' : undefined}>Analytics</a>
          <a href="/dashboard?tab=billing" class={this.region.value === 'billing' ? 'active' : undefined}>Billing</a>
        </nav>
        <section class="dashboard-panel">{this.regionContent}</section>
        <p>{this.data.notes.summary}</p>
      </main>
    );
  }
}

const app = new Yvee<DashboardData>();
app.route('/dashboard')(DashboardPage);
app.route('/nested')(NestedDashboardPage);
app.Main(content => <main class="app-shell">{content}</main>);
await app.render({ id: 'dashboard-root', data: { notes: { draft: false, summary: 'Ready' }, stats: { visits: 0 } } });

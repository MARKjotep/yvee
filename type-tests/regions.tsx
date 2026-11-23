/**
 * Consumer-style type test for in-page regions.
 *
 * Everything below imports from the published entry point (`'yvee'`), exactly
 * like an external dashboard author would. It is compiled by `bun run
 * test:types` and doubles as a copyable template: it exercises every public
 * region capability without any `any` casts or relative `src` imports.
 */
import {
  Yvee, Page, dom,
  type PageFetchContext,
  type RegionLoader,
  type RegionModule,
  type RegionCache,
  type RegionLeaveContext,
  type RegionEnterContext,
  type RegionGuard,
  type RegionGuardContext,
  type GuardApp,
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
app.Main(content => <main class="app-shell">{content}</main>);
await app.render({ id: 'dashboard-root', data: { notes: { draft: false, summary: 'Ready' }, stats: { visits: 0 } } });

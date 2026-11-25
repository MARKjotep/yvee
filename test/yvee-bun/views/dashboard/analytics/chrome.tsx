import { Derived, type IStateful } from "../../../../../src/core/core.core";
import type { DOMContext } from "../../../../../src/dom/render/contracts.dom";
import type { Page, RegionChromeContext } from "../../../../../src/yvee";

const tabs = [
  { id: "analytics/overview", label: "Overview" },
  { id: "analytics/retention", label: "Retention" },
] as const;

const levelId = "analytics";
/** The first tab mirrors the level's default view in the route declaration. */
const defaultViewId = tabs[0].id;

/**
 * The bare level id displays the default leaf, so it should light up that
 * sub-nav tab even though the URL names the level rather than the view.
 */
function activeView(region: string) {
  return region === levelId ? defaultViewId : region;
}

type SubTab = (typeof tabs)[number];

interface SubTabAttributes {
  class: IStateful<string>;
  "aria-current": IStateful<"page" | "false">;
}

function hrefFor(id: string) {
  return `/dashboard?${new URLSearchParams({ tab: id })}`;
}

function tabAttributes(page: Page, tab: SubTab): Promise<SubTabAttributes> {
  return Promise.all([
    Derived(
      [page.region],
      (region) => activeView(region) === tab.id
        ? "dashboard-subnav__tab dashboard-subnav__tab--active"
        : "dashboard-subnav__tab",
      { scope: page.resources },
    ),
    Derived(
      [page.region],
      (region) => activeView(region) === tab.id ? "page" as const : "false" as const,
      { scope: page.resources },
    ),
  ]).then(([className, current]) => ({
    class: className,
    "aria-current": current,
  }));
}

/**
 * Stateless level chrome for Analytics: a sub-nav followed by the active leaf
 * view. The reactive active state is scoped to the page so it outlives chrome
 * re-renders.
 */
export default async function AnalyticsChrome({ page, outlet }: RegionChromeContext) {
  const attributes = await Promise.all(tabs.map((tab) => tabAttributes(page, tab)));

  return (
    <div class="dashboard-sublevel">
      <nav class="dashboard-subnav" aria-label="Analytics">
        <p class="dashboard-subnav__label">Analytics</p>
        <ul class="dashboard-subnav__tabs">
          {tabs.map((tab, index) => {
            const attrs = attributes[index]!;
            return (
              <li key={tab.id}>
                <a
                  class={attrs.class}
                  href={hrefFor(tab.id)}
                  aria-current={attrs["aria-current"]}
                >
                  {tab.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div class="dashboard-sublevel__panel">{outlet as DOMContext}</div>
    </div>
  );
}

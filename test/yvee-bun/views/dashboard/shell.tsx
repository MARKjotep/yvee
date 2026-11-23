import { Derived, type IStateful } from "../../../../src/core/core.core";
import { dom } from "../../../../src/dom/render/node.dom";
import type { Page } from "../../../../src/yvee";

const tabs = [
  { id: "overview", href: "/dashboard?tab=overview", label: "Overview", hint: "Start here" },
  { id: "analytics", href: "/dashboard?tab=analytics", label: "Analytics", hint: "Traffic & usage" },
  { id: "settings", href: "/dashboard?tab=settings", label: "Settings", hint: "Workspace" },
] as const;

const anchors = [
  { href: "/dashboard#getting-started", label: "Getting started" },
  { href: "/dashboard#quick-links", label: "Quick links" },
  { href: "/dashboard#notes", label: "Notes" },
] as const;

type Tab = (typeof tabs)[number];

interface TabAttributes {
  class: IStateful<string>;
  "aria-current": IStateful<"page" | "false">;
}

function tabAttributes(page: Page, tab: Tab): Promise<TabAttributes> {
  return Promise.all([
    Derived(
      [page.region],
      (region) => region === tab.id
        ? "dashboard-nav__tab dashboard-nav__tab--active"
        : "dashboard-nav__tab",
      { scope: page.resources },
    ),
    Derived(
      [page.region],
      (region) => region === tab.id ? "page" as const : "false" as const,
      { scope: page.resources },
    ),
  ]).then(([className, current]) => ({
    class: className,
    "aria-current": current,
  }));
}

export default async function DashboardShell({ page }: { page: Page }) {
  const attributes = await Promise.all(tabs.map((tab) => tabAttributes(page, tab)));

  return (
    <div class="dashboard-layout">
      <aside class="dashboard-sidebar">
        <nav class="dashboard-nav" aria-label="Dashboard">
          <div class="dashboard-brand">
            <span class="dashboard-brand__mark" aria-hidden="true">Y</span>
            <span>
              <strong>Yvee Workspace</strong>
              <small>Operations demo</small>
            </span>
          </div>

          <p class="dashboard-nav__label">Tabs</p>
          <ul class="dashboard-nav__tabs">
            {tabs.map((tab, index) => {
              const attrs = attributes[index]!;
              return (
                <li key={tab.id}>
                  <a
                    class={attrs.class}
                    href={tab.href}
                    aria-current={attrs["aria-current"]}
                  >
                    <span>{tab.label}</span>
                    <small>{tab.hint}</small>
                  </a>
                </li>
              );
            })}
          </ul>

          <p class="dashboard-nav__label">On this page</p>
          <div class="dashboard-nav__anchors">
            {anchors.map((anchor) => (
              <a href={anchor.href} key={anchor.href}>{anchor.label}</a>
            ))}
          </div>
        </nav>
        <p class="dashboard-sidebar__note">
          The sidebar lives in the shared shell. Each tab is a region: only the
          panel on the right changes, and the page never reloads.
        </p>
      </aside>

      <div class="dashboard-panel">{page.regionContent}</div>
    </div>
  );
}

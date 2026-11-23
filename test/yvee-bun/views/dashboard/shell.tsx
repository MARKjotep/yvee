import type { DOMContext } from "../../../../src/dom/render/contracts.dom";
import { dom } from "../../../../src/dom/render/node.dom";
import type { Page } from "../../../../src/yvee";

const tabs = [
  { href: "/dashboard", label: "Overview", hint: "Start here" },
  { href: "/dashboard/analytics", label: "Analytics", hint: "Traffic & usage" },
  { href: "/dashboard/settings", label: "Settings", hint: "Workspace" },
] as const;

const anchors = [
  { href: "/dashboard#getting-started", label: "Getting started" },
  { href: "/dashboard#quick-links", label: "Quick links" },
  { href: "/dashboard#notes", label: "Notes" },
] as const;

export function DashboardShell(
  { page }: { page: Page },
  ...children: DOMContext[]
) {
  const path = page.url.path;

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
            {tabs.map((tab) => (
              <li key={tab.href}>
                <a
                  class={path === tab.href
                    ? "dashboard-nav__tab dashboard-nav__tab--active"
                    : "dashboard-nav__tab"}
                  href={tab.href}
                  aria-current={path === tab.href ? "page" : undefined}
                >
                  <span>{tab.label}</span>
                  <small>{tab.hint}</small>
                </a>
              </li>
            ))}
          </ul>

          <p class="dashboard-nav__label">On this page</p>
          <div class="dashboard-nav__anchors">
            {anchors.map((anchor) => (
              <a href={anchor.href} key={anchor.href}>{anchor.label}</a>
            ))}
          </div>
        </nav>
        <p class="dashboard-sidebar__note">
          The sidebar lives in the shared shell. Each tab swaps only the panel
          on the right.
        </p>
      </aside>

      <div class="dashboard-panel">{children}</div>
    </div>
  );
}

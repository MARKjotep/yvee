import { dom } from "../../../../src/dom/render/node.dom";
import type { Page } from "../../../../src/yvee";
import { DashboardShell } from "./shell";

const stats = [
  { label: "Open tasks", value: "18", note: "4 due this week" },
  { label: "Active members", value: "12", note: "2 invitations pending" },
  { label: "Sync health", value: "99.9%", note: "Last 30 days" },
];

export default function DashboardOverviewView({ page }: { page: Page }) {
  return (
    <DashboardShell page={page}>
      <article class="dashboard-tab">
        <header class="dashboard-tab__intro">
          <p class="eyebrow">Overview</p>
          <h1>Operations at a glance.</h1>
          <p>
            The dashboard shell stays put while each tab loads its own view
            module. This panel is the <code>/dashboard</code> route.
          </p>
        </header>

        <div class="dashboard-stats">
          {stats.map((stat) => (
            <article class="dashboard-stat" key={stat.label}>
              <p class="dashboard-stat__label">{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
            </article>
          ))}
        </div>

        <section class="dashboard-section" id="getting-started">
          <p class="eyebrow">First run</p>
          <h2>Getting started</h2>
          <p>
            The side navigator links to real routes, so every tab is
            bookmarked and server-rendered independently.
          </p>
          <ol class="dashboard-steps">
            <li>Connect a data source in Settings.</li>
            <li>Invite a teammate and assign a role.</li>
            <li>Open Analytics to review the first sync.</li>
          </ol>
        </section>

        <section class="dashboard-section" id="quick-links">
          <p class="eyebrow">Jump to</p>
          <h2>Quick links</h2>
          <p>
            Anchor links such as <code>/dashboard#getting-started</code> keep
            the same route and scroll to a section.
          </p>
          <div class="dashboard-links">
            <a href="/dashboard/analytics">Open analytics</a>
            <a href="/dashboard/settings">Open settings</a>
            <a href="/features">See route-specific CSS</a>
          </div>
        </section>

        <section class="dashboard-section" id="notes">
          <p class="eyebrow">Notes</p>
          <h2>Implementation notes</h2>
          <p>
            The shell is a shared view module. It renders the sidebar and the
            content slot; the three route classes only choose which tab view
            to import.
          </p>
          <blockquote class="dashboard-note">
            Each tab is a distinct URL with its own lazy chunk, so direct loads
            work without client-side state.
          </blockquote>
        </section>
      </article>
    </DashboardShell>
  );
}

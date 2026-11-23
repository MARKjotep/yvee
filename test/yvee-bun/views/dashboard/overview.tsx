import { dom } from "../../../../src/dom/render/node.dom";

const stats = [
  { label: "Open tasks", value: "18", note: "4 due this week" },
  { label: "Active members", value: "12", note: "2 invitations pending" },
  { label: "Sync health", value: "99.9%", note: "Last 30 days" },
];

export default function DashboardOverviewView() {
  return (
    <article class="dashboard-tab">
      <header class="dashboard-tab__intro">
        <p class="eyebrow">Overview</p>
        <h1>Operations at a glance.</h1>
        <p>
          The dashboard shell stays mounted while each region swaps its own
          view module in place. This panel is the overview region of{" "}
          <code>/dashboard</code>, and coming back to the dashboard reopens
          your last tab.
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
          The side navigator swaps regions in place, so switching tabs never
          reloads the page while every region is still deep-linkable and
          server-rendered on its own.
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
          the default region and scroll on the hash fast path.
        </p>
        <div class="dashboard-links">
          <a href="/dashboard?tab=analytics">Open analytics</a>
          <a href="/dashboard?tab=settings">Open settings</a>
          <a href="/features">See route-specific CSS</a>
        </div>
      </section>

      <section class="dashboard-section" id="notes">
        <p class="eyebrow">Notes</p>
        <h2>Implementation notes</h2>
        <p>
          The shell is the page body view; it renders the sidebar and the
          <code>regionContent</code> outlet, while each tab is its own lazy
          chunk.
        </p>
        <ul class="dashboard-steps">
          <li>
            <code>rememberRegion</code> reopens your last tab when you return to
            the dashboard.
          </li>
          <li>
            Anchor and hash links keep the displayed region and take the hash
            fast path; a query plus hash is still a full load by design.
          </li>
          <li>
            Analytics restores its region-local scroll offset through{" "}
            <code>data-scroll-key</code>.
          </li>
          <li>
            <code>keepAlive</code> keeps the Settings draft across tab
            round-trips.
          </li>
          <li>
            <code>regionWillLeave</code> blocks leaving Settings while its draft
            is unsaved; save or clear it to navigate on.
          </li>
          <li>
            <code>regionGuards</code> is supported but unused here, since the
            demo has no auth.
          </li>
        </ul>
      </section>
    </article>
  );
}

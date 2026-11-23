import { dom } from "../../../../src/dom/render/node.dom";

const metrics = [
  { label: "Page views", value: "12,480", note: "+18% · last 30 days" },
  { label: "Route loads", value: "3,214", note: "+9% · last 30 days" },
  { label: "Hydration time", value: "84 ms", note: "12% faster · last 30 days" },
];

const traffic = [
  { day: "Mon", value: 48 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 78 },
  { day: "Fri", value: 92 },
  { day: "Sat", value: 41 },
  { day: "Sun", value: 34 },
];

const topRoutes = [
  { path: "/dashboard", loads: "1,204" },
  { path: "/features", loads: "986" },
  { path: "/studio", loads: "742" },
  { path: "/dashboard?tab=analytics", loads: "531" },
];

export default function DashboardAnalyticsView() {
  return (
    <article class="dashboard-tab">
      <header class="dashboard-tab__intro">
        <p class="eyebrow">Analytics</p>
        <h1>Traffic that pays attention.</h1>
        <p>
          This panel is the analytics region at{" "}
          <code>/dashboard?tab=analytics</code>. It reuses the same shell and
          swaps only the panel.
        </p>
      </header>

      <div class="dashboard-stats">
        {metrics.map((metric) => (
          <article class="dashboard-stat" key={metric.label}>
            <p class="dashboard-stat__label">{metric.label}</p>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </div>

      <section class="dashboard-section">
        <p class="eyebrow">Last 7 days</p>
        <h2>Route loads</h2>
        <div
          class="dashboard-chart"
          role="img"
          aria-label="Route loads for the last seven days, peaking on Friday"
        >
          {traffic.map((bar) => (
            <div class="dashboard-chart__bar" key={bar.day}>
              <span
                class="dashboard-chart__fill"
                style={{ height: `${bar.value}%` }}
              />
              <small>{bar.day}</small>
            </div>
          ))}
        </div>
      </section>

      <section class="dashboard-section">
        <p class="eyebrow">Most requested</p>
        <h2>Top routes</h2>
        <ul class="dashboard-list">
          {topRoutes.map((row) => (
            <li key={row.path}>
              <code>{row.path}</code>
              <span>{row.loads} loads</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

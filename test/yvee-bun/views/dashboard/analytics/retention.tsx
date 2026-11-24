import { dom } from "../../../../../src/dom/render/node.dom";
import type { Page, RegionCache } from "../../../../../src/yvee";

const metrics = [
  { label: "Day-1 retention", value: "46%", note: "+5 pts · last 90 days" },
  { label: "Week-4 retention", value: "31%", note: "+2 pts · last 90 days" },
  { label: "Monthly churn", value: "2.1%", note: "-0.4 pts · last 90 days" },
];

const cohorts = [
  { name: "January · self-serve", detail: "46% day-1 return" },
  { name: "February · team plan", detail: "39% week-4 return" },
  { name: "March · API-first", detail: "31% week-4 return" },
  { name: "April · invited teams", detail: "34% week-4 return" },
];

function hrefFor(id: string) {
  return `/dashboard?${new URLSearchParams({ tab: id })}`;
}

export default function DashboardAnalyticsRetentionView(
  { cache }: { page: Page; cache: RegionCache },
) {
  if (typeof document !== "undefined") {
    const state = window as unknown as Record<string, unknown>;
    const requested = state.__dashboardFailNextSwap === true;
    // One-shot: never let a click flag leak into a later render.
    state.__dashboardFailNextSwap = false;
    if (
      requested &&
      (
        new URLSearchParams(document.location.search).get("fail") === "1" ||
        document.location.hash === "#fail"
      )
    ) {
      throw new Error("Simulated region swap failure.");
    }
  }

  const draft = (cache.get() as { draft?: string } | undefined)?.draft ?? "";

  return (
    <article class="dashboard-tab">
      <header class="dashboard-tab__intro">
        <p class="eyebrow">Analytics · Retention</p>
        <h1>Cohorts that stick around.</h1>
        <p>
          This panel is the retention view at{" "}
          <code>/dashboard?tab=analytics%2Fretention</code>. It shares the
          Analytics chrome and swaps only the leaf below the sub-nav.
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
        <p class="eyebrow">Recent cohorts</p>
        <h2>Returning teams</h2>
        <p>
          Each cohort keeps its own return window, so a single drop-off does not
          hide the teams that come back.
        </p>
        <ul class="dashboard-list">
          {cohorts.map((cohort) => (
            <li key={cohort.name}>
              <code>{cohort.name}</code>
              <span>{cohort.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section class="dashboard-section">
        <p class="eyebrow">Keep-state</p>
        <h2>Draft cohort note</h2>
        <p>
          This draft is kept in the region cache with <code>keepAlive</code>.
          Switch to Overview and back, or leave Analytics and return: the draft
          is still here because state is cached per composite region id.
        </p>
        <label>
          <span>Draft cohort note</span>
          <textarea
            name="draft"
            rows={3}
            placeholder="Write a note, switch views, then come back."
            style={{ display: "block", width: "100%", marginTop: ".4rem" }}
            on={{
              input(event) {
                const value = (event.currentTarget as HTMLTextAreaElement).value;
                cache.set({ draft: value });
              },
            }}
          >{draft}</textarea>
        </label>
        <p class="dashboard-note">
          The draft survives Analytics → Overview → Analytics because
          <code>keepAlive</code> retains it under{" "}
          <code>analytics/retention</code>, not under the outer Analytics id.
        </p>
      </section>

      <section class="dashboard-section">
        <p class="eyebrow">Next step</p>
        <h2>Compare the inner views</h2>
        <p>
          The Analytics sub-nav swaps leaves in place; the outer sidebar still
          treats the whole Analytics subtree as one active tab.
        </p>
        <div class="dashboard-links">
          <a href={hrefFor("analytics/overview")}>Open analytics overview</a>
          <a href="/dashboard?tab=overview">Leave Analytics</a>
        </div>
      </section>
    </article>
  );
}

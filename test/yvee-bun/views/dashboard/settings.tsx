import { dom } from "../../../../src/dom/render/node.dom";
import type { Page } from "../../../../src/yvee";
import { DashboardShell } from "./shell";

const preferences = [
  {
    name: "Weekly digest",
    description: "Send a summary every Monday.",
    enabled: true,
  },
  {
    name: "Route prefetch",
    description: "Load likely next tabs in the background.",
    enabled: true,
  },
  {
    name: "Compact navigation",
    description: "Hide tab hints in the side navigator.",
    enabled: false,
  },
  {
    name: "Usage analytics",
    description: "Collect anonymous route timing.",
    enabled: true,
  },
];

export default function DashboardSettingsView({ page }: { page: Page }) {
  return (
    <DashboardShell page={page}>
      <article class="dashboard-tab">
        <header class="dashboard-tab__intro">
          <p class="eyebrow">Settings</p>
          <h1>Make the workspace yours.</h1>
          <p>
            This tab is the <code>/dashboard/settings</code> route. The shell
            and the tab links stay identical between tabs.
          </p>
        </header>

        <section class="dashboard-section">
          <p class="eyebrow">Workspace preferences</p>
          <h2>General</h2>
          <ul class="dashboard-settings">
            {preferences.map((setting) => (
              <li class="dashboard-setting" key={setting.name}>
                <span>
                  <strong>{setting.name}</strong>
                  <small>{setting.description}</small>
                </span>
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  aria-label={setting.name}
                />
              </li>
            ))}
          </ul>
          <p class="dashboard-note">
            Preferences are placeholders; this demo does not persist changes.
          </p>
        </section>

        <section class="dashboard-section">
          <p class="eyebrow">Next step</p>
          <h2>Review the tab routes</h2>
          <p>
            Each tab has its own route class and lazy view chunk. Open another
            tab to watch the shell persist.
          </p>
          <div class="dashboard-links">
            <a href="/dashboard">Back to overview</a>
            <a href="/dashboard/analytics">See analytics</a>
          </div>
        </section>
      </article>
    </DashboardShell>
  );
}

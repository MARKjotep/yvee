import { dom } from "../../../../src/dom/render/node.dom";
import type { Page, RegionCache } from "../../../../src/yvee";
import type { DashboardRoute } from "../../routes/dashboard";

const preferences = [
  {
    name: "Weekly digest",
    description: "Send a summary every Monday.",
    enabled: true,
  },
  {
    name: "Route prefetch",
    description: "Load likely next regions in the background.",
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

export default function DashboardSettingsView(
  { page, cache }: { page: Page; cache: RegionCache },
) {
  const draft = (cache.get() as { draft?: string } | undefined)?.draft ?? "";
  return (
    <article class="dashboard-tab">
      <header class="dashboard-tab__intro">
        <p class="eyebrow">Settings</p>
        <h1>Make the workspace yours.</h1>
        <p>
          This panel is the settings region at{" "}
          <code>/dashboard?tab=settings</code>. The shell and the tab links stay
          identical between regions.
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
        <p class="eyebrow">Keep-state</p>
        <h2>Draft notes</h2>
        <p>
          This draft is kept in the region cache with <code>keepAlive</code>, so
          a re-entered Settings region restores it. While it is unsaved,{" "}
          <code>regionWillLeave</code> blocks tab changes; save or clear it to
          switch away.
        </p>
        <label>
          <span>Draft notes</span>
          <textarea
            name="draft"
            rows={3}
            placeholder="Write a note, save it, then try another tab."
            style={{ display: "block", width: "100%", marginTop: ".4rem" }}
            on={{
              input(event) {
                const value = (event.currentTarget as HTMLTextAreaElement).value;
                cache.set({ draft: value });
                (page as DashboardRoute).settingsDraft = value;
              },
            }}
          >{draft}</textarea>
        </label>
        <div class="dashboard-links">
          <button
            type="button"
            on={{
              click() {
                const route = page as DashboardRoute;
                route.settingsDraft = "";
                route.showNotice({
                  tone: "success",
                  message: "Draft saved — you can switch tabs again.",
                });
              },
            }}
          >
            Save draft
          </button>
        </div>
        <p class="dashboard-note">
          Saving clears the page's <code>settingsDraft</code> copy so the leave
          hook allows the tab change; the cache keeps the text for the next
          visit.
        </p>
      </section>

      <section class="dashboard-section">
        <p class="eyebrow">Next step</p>
        <h2>Review the tab regions</h2>
        <p>
          Each tab is a lazily imported region module. Open another tab to
          watch the shell persist without a page reload.
        </p>
        <div class="dashboard-links">
          <a href="/dashboard">Back to overview</a>
          <a href="/dashboard?tab=analytics">See analytics</a>
        </div>
      </section>
    </article>
  );
}

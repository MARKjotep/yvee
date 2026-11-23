import { Page, route } from "../../../src/yvee";
import { dom, frag } from "../../../src/dom/render/node.dom";

function dashboardHead(title: string, description: string) {
  return (
    <>
      <title>{title} · Yvee Bun example</title>
      <meta name="description" content={description} />
      <link rel="stylesheet" href="/styles/dashboard.css" />
    </>
  );
}

export class DashboardRoute extends Page {
  override head() {
    return dashboardHead(
      "Dashboard",
      "A persistent dashboard shell with a side navigator and lazy-loaded tab views.",
    );
  }

  override body() {
    return import("../views/dashboard/overview");
  }
}

export class DashboardAnalyticsRoute extends Page {
  override head() {
    return dashboardHead(
      "Analytics",
      "The analytics tab of a dashboard with a persistent shell and lazy route chunks.",
    );
  }

  override body() {
    return import("../views/dashboard/analytics");
  }
}

export class DashboardSettingsRoute extends Page {
  override head() {
    return dashboardHead(
      "Settings",
      "The settings tab of a dashboard with a persistent shell and lazy route chunks.",
    );
  }

  override body() {
    return import("../views/dashboard/settings");
  }
}

route("/dashboard")(DashboardRoute);
route("/dashboard/analytics")(DashboardAnalyticsRoute);
route("/dashboard/settings")(DashboardSettingsRoute);

import { Page, route, type RegionLeaveContext } from "../../../src/yvee";
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
  override regionParam = "tab";
  override defaultRegion = "overview";
  override rememberRegion = true;
  override keepAlive: number | true = true;
  /** Plain copy of the unsaved Settings draft, read by `regionWillLeave`. */
  settingsDraft = "";
  override regions = {
    overview: () => import("../views/dashboard/overview"),
    analytics: () => import("../views/dashboard/analytics"),
    settings: () => import("../views/dashboard/settings"),
  };

  override async regionWillLeave({ from }: RegionLeaveContext) {
    if (from === "settings" && this.settingsDraft.trim()) {
      throw new Error("Unsaved draft in Settings — clear it to leave.");
    }
  }

  override head() {
    return dashboardHead(
      "Dashboard",
      "A persistent dashboard shell whose side navigator swaps lazy regions in place.",
    );
  }

  override body() {
    return import("../views/dashboard/shell");
  }
}

route("/dashboard")(DashboardRoute);

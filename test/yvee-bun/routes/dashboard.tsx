import { State } from "../../../src/core/core.core";
import {
  Page,
  regionLevel,
  regionTree,
  route,
  type RegionLeaveContext,
} from "../../../src/yvee";

export type DashboardNotice = {
  tone: "warning" | "error" | "success";
  message: string;
} | null;

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
  /** Single-slot notice shown by the shell; never stacks. */
  notice = State<DashboardNotice>(null);
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;

  override regions = regionTree({
    overview: () => import("../views/dashboard/overview"),
    analytics: regionLevel({
      chrome: () => import("../views/dashboard/analytics/chrome"),
      default: "overview",
      views: {
        overview: () => import("../views/dashboard/analytics/overview"),
        retention: () => import("../views/dashboard/analytics/retention"),
      },
    }),
    settings: () => import("../views/dashboard/settings"),
  });

  showNotice(next: NonNullable<DashboardNotice>) {
    if (this.noticeTimer !== undefined) {
      clearTimeout(this.noticeTimer);
      this.noticeTimer = undefined;
    }
    this.notice.value = next;
    if (next.tone !== "success") return;

    const timer = setTimeout(() => {
      if (this.notice.value === next) this.notice.value = null;
      if (this.noticeTimer === timer) this.noticeTimer = undefined;
    }, 4000);
    this.noticeTimer = timer;
    this.resources.defer(() => clearTimeout(timer));
  }

  override async regionWillLeave({ from }: RegionLeaveContext) {
    if (from === "settings" && this.settingsDraft.trim()) {
      const denial = new Error(
        "Unsaved draft in Settings — clear it to leave.",
      );
      denial.name = "RegionLeaveDenied";
      throw denial;
    }
  }

  override regionDidEnter() {
    this.notice.value = null;
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

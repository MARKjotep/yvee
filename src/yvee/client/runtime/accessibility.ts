import type { YveeURL } from "../../routing/path";

/** Owns the live region; the coordinator supplies transition ownership checks. */
export class RouteAccessibility {
  private status: HTMLDivElement | undefined;
  constructor(private readonly id: string, private readonly element: () => HTMLElement | undefined) {}

  dispose() { this.status?.remove(); this.status = undefined; }

  mount() {
    const status = document.createElement("div");
    status.dataset.yveeRouteStatus = this.id;
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    Object.assign(status.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.append(status);
    this.status = status;
  }

  commit(url: YveeURL, isCurrent: () => boolean) {
    const element = this.element();
    if (!isCurrent() || !element) return;
    const hashTarget = url.hash
      ? document.getElementById(decodeURIComponent(url.hash.slice(1)))
      : null;
    const target = hashTarget && (element === hashTarget || element.contains(hashTarget))
      ? hashTarget
      : (element.matches("[data-yvee-focus]") ? element : null)
        ?? element.querySelector<HTMLElement>("[data-yvee-focus]")
        ?? (element.matches("h1") ? element : null)
        ?? element.querySelector<HTMLElement>("h1")
        ?? (element.tagName === "BODY" ? null : element);

    if (target) {
      const addedTabIndex = !target.hasAttribute("tabindex");
      if (addedTabIndex) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (addedTabIndex) {
        if (document.activeElement === target) {
          target.addEventListener("blur", () => {
            if (target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex");
          }, { once: true });
        } else if (target.getAttribute("tabindex") === "-1") {
          target.removeAttribute("tabindex");
        }
      }
    }

    const status = this.status;
    if (!status) return;
    status.textContent = "";
    requestAnimationFrame(() => {
      if (isCurrent() && status.isConnected) {
        status.textContent = document.title || target?.textContent?.trim() || url.path;
      }
    });
  }
}

import { toURL, type YveeURL } from "../routing/path";

interface NavigationOptions {
  base: string;
  history?: boolean;
  root?: () => HTMLElement | undefined;
  onPop(url: YveeURL, state: unknown): void;
  navigate(path: string): void;
}

export class NavigationEvents {
  private previousScrollRestoration: ScrollRestoration | undefined;
  private started = false;
  private readonly handlePop = (event: PopStateEvent) =>
    this.options.onPop(toURL(location.href), event.state);
  private readonly handleClick = (event: MouseEvent) => {
    if (!this.isEligibleClick(event)) return;

    const anchor = (event.target as Element).closest("a");
    if (!anchor) return;
    const root = this.options.root?.();
    if (root && anchor.closest("[data-app]") !== root) return;

    const target = new URL(anchor.href, location.href);
    if (target.origin !== location.origin || !this.isWithinBase(target.pathname)) return;

    event.preventDefault();
    this.options.navigate(`${target.pathname}${target.search}${target.hash}`);
  };

  constructor(private readonly options: NavigationOptions) {}

  /**
   * Attach interception of in-app anchor clicks and popstate. Idempotent so the
   * runtime can attach at hydration start and again after the boot settles
   * without duplicating listeners or losing the saved scroll restoration mode.
   */
  start() {
    if (this.started) return;
    this.started = true;
    if (this.options.history !== false) {
      this.previousScrollRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      window.addEventListener("popstate", this.handlePop);
    }
    document.addEventListener("click", this.handleClick);
  }

  /** Detach listeners once; repeated calls after a stop are no-ops. */
  stop() {
    if (!this.started) return;
    this.started = false;
    if (typeof window !== "undefined") window.removeEventListener("popstate", this.handlePop);
    if (typeof document !== "undefined") document.removeEventListener("click", this.handleClick);
    if (this.previousScrollRestoration !== undefined) {
      history.scrollRestoration = this.previousScrollRestoration;
      this.previousScrollRestoration = undefined;
    }
  }

  private isEligibleClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (!(event.target instanceof Element)) return false;

    const anchor = event.target.closest("a");
    return Boolean(anchor && !anchor.target && !anchor.hasAttribute("download"));
  }

  private isWithinBase(pathname: string) {
    const base = this.options.base === "/"
      ? "/"
      : `${this.options.base.replace(/\/$/, "")}/`;

    return base === "/" || pathname === base.slice(0, -1) || pathname.startsWith(base);
  }
}

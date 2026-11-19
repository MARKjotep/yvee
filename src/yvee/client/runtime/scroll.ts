import { urlKey, type YveeURL } from "../../routing/path";
import type { RouteHistory } from "./history";
import type { ScrollPosition } from "./types";

export class RouteScroll {
  constructor(private readonly options: { history: RouteHistory; isCurrent(revision: number): boolean }) {}

  async restoreScroll(
    position: ScrollPosition | undefined,
    revision: number,
    url: YveeURL,
  ) {
    const restored = position ?? this.options.history.getScroll(urlKey(url));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (this.options.isCurrent(revision)) {
        routeScroll(() => {
          if (restored) window.scrollTo(restored.x, restored.y);
          else window.scrollTo(0, 0);
        });
        this.options.history.trackDisplayedEntry();
      }
      resolve();
    })));
  }

  async scrollToRoute(url: YveeURL, revision: number) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    if (!this.options.isCurrent(revision)) return;
    if (url.hash) {
      const anchor = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (anchor) {
        routeScroll(() => anchor.scrollIntoView());
        this.options.history.trackDisplayedEntry();
        return;
      }
    }
    await this.restoreScroll(undefined, revision, url);
  }
}

function routeScroll(scroll: () => void) {
  if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    scroll();
    return;
  }
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  try { scroll(); }
  finally { root.style.scrollBehavior = previous; }
}

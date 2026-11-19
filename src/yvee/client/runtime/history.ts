import { urlKey, type YveeURL } from "../../routing/path";
import type { ScrollPosition } from "./types";

interface HistoryOptions {
  id: string;
  enabled: boolean;
  currentURL(): YveeURL | undefined;
}

/** Owns browser entry identity and the bounded scroll-position cache. */
export class RouteHistory {
  private displayedEntry: string | undefined;
  private nextEntryId = 0;
  private readonly scrollPositions = new Map<string, ScrollPosition>();

  constructor(private readonly options: HistoryOptions) {}

  pop(url: YveeURL, state: unknown) {
    // History already moved; capture scroll against the entry still displayed.
    this.captureDisplayedScroll();
    const key = urlKey(url);
    const scroll = this.scrollPositions.get(this.entryKey(state) ?? "")
      ?? getScrollPosition(state) ?? this.scrollPositions.get(key);
    if (scroll) this.rememberScroll(key, scroll);
    return scroll;
  }

  initialize(url: YveeURL) {
    this.trackDisplayedEntry();
    this.rememberScroll(urlKey(url), getScrollPosition(history.state) ?? getCurrentScroll());
  }

  getScroll(key: string) { return this.scrollPositions.get(key); }
  beginTransition() { this.displayedEntry = undefined; }
  reset() { this.displayedEntry = undefined; this.scrollPositions.clear(); }

  restoreAddress(url: YveeURL) {
    if (this.options.enabled && location.protocol !== "file:") {
      history.replaceState(history.state, "", urlKey(url));
    }
  }

  write(
    url: YveeURL,
    state?: Record<string, unknown>,
    replace = false,
    savedScroll?: { x: number; y: number },
  ) {
    if (!this.options.enabled || location.protocol === "file:") return;
    const method = replace ? "replaceState" : "pushState";
    const scroll = savedScroll ?? (replace ? getCurrentScroll() : { x: 0, y: 0 });
    history[method]({ ...state, path: urlKey(url), scroll, yveeScrollEntry: this.newEntryKey() }, "", urlKey(url));
  }

  private newEntryKey() {
    return `yv:${this.options.id}:${Date.now()}:${++this.nextEntryId}`;
  }

  private entryKey(state: unknown) {
    if (state && typeof state === "object" && "yveeScrollEntry" in state &&
        typeof state.yveeScrollEntry === "string") return state.yveeScrollEntry;
    return undefined;
  }

  trackDisplayedEntry() {
    const usesHistory = this.options.enabled && location.protocol !== "file:";
    const existing = usesHistory ? this.entryKey(history.state) : undefined;
    this.displayedEntry = existing ?? this.newEntryKey();
    if (usesHistory && !existing) {
      history.replaceState({ ...history.state, yveeScrollEntry: this.displayedEntry }, "");
    }
  }

  private captureDisplayedScroll() {
    const currentURL = this.options.currentURL();
    if (!currentURL || !this.displayedEntry) return;
    const position = getCurrentScroll();
    this.rememberScroll(this.displayedEntry, position);
    this.rememberScroll(urlKey(currentURL), position);
    this.displayedEntry = undefined;
    return position;
  }

  saveCurrentScroll() {
    const scroll = this.captureDisplayedScroll();
    if (!scroll || !this.options.enabled || location.protocol === "file:") return;
    history.replaceState({ ...history.state, path: urlKey(this.options.currentURL()!), scroll }, "");
  }

  private rememberScroll(key: string, position: ScrollPosition) {
    this.scrollPositions.delete(key);
    this.scrollPositions.set(key, position);
    if (this.scrollPositions.size > 100) {
      const oldest = this.scrollPositions.keys().next().value;
      if (oldest) this.scrollPositions.delete(oldest);
    }
  }

  replaceAddressIfNeeded(url: YveeURL) {
    if (!this.options.enabled || location.protocol === "file:") return;
    if (urlKey(url) === `${location.pathname}${location.search}${location.hash}`) return;
    history.replaceState(history.state, "", urlKey(url));
  }
}

function getCurrentScroll() {
  return { x: window.scrollX, y: window.scrollY };
}

function getScrollPosition(state: unknown): { x: number; y: number } | undefined {
  if (!state || typeof state !== 'object' || !('scroll' in state)) return undefined;
  const scroll = state.scroll;
  if (!scroll || typeof scroll !== 'object' || !('x' in scroll) || !('y' in scroll)) return undefined;
  if (typeof scroll.x !== 'number' || typeof scroll.y !== 'number') return undefined;
  return { x: scroll.x, y: scroll.y };
}

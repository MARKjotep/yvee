import { StateHook } from "@/core/core.core";
import { DisposalScope } from "@/core/disposal.core";
import { Wizard } from "@/dom/render/oz.dom";
import { combineHead, removeHeadElements } from "../../rendering/head";
import type { PageLoad } from "../load-page";
import type { Page } from "../../pages/page";
import { mountRoot } from "../mount";
import { NavigationEvents } from "../navigation";
import { toURL, urlKey, type YveeURL } from "../../routing/path";
import { canonicalRegionURL, hasRegions, recallRegion, regionIdFor, regionModule, rememberRegion, sameRegionSearch } from "../regions";
import { RouteHistory } from "./history";
import { RouteScroll } from "./scroll";
import { RouteAccessibility } from "./accessibility";
import { RouteView } from "./view";
import type { RuntimeOptions, RuntimeMountOptions, ScrollPosition } from "./types";

/**
 * A navigation requested while the initial page was still loading. Only the
 * latest request survives the boot window, and a request for the URL being
 * hydrated is discarded because the boot commit already delivers it.
 */
type BootNavigation =
  | {
      kind: "navigate";
      target: string;
      state?: Record<string, unknown>;
      replace: boolean;
    }
  | { kind: "pop"; url: YveeURL; state: unknown };

export class YveeClient {
  private readonly navigation: NavigationEvents;
  private readonly history: RouteHistory;
  private readonly scroll: RouteScroll;
  private readonly accessibility: RouteAccessibility;
  private readonly view: RouteView;
  private nonce: string | undefined;
  private element: HTMLElement | undefined;
  private mounted = false;
  /** True from mount start until the initial page is committed and the URL hook is attached. */
  private booting = false;
  /** Latest navigation requested during the boot window, applied when boot settles. */
  private bootQueue: BootNavigation | undefined;
  private ignoreURLHook = false;
  private revision = 0;
  private mountEpoch = 0;
  private redirects = 0;
  private stopPage: (() => void) | undefined;
  private readonly pendingPages = new Set<() => void>();
  private currentURL: YveeURL | undefined;
  private activePage: Page | undefined;
  private regionEpoch = 0;
  private pendingNavigation:
    | { key: string; replace: boolean; scroll?: ScrollPosition }
    | undefined;
  private stopURL: (() => void) | undefined;
  private activeLoad: AbortController | undefined;

  constructor(private readonly options: RuntimeOptions) {
    this.history = new RouteHistory({ id: options.id, enabled: options.useHistory, currentURL: () => this.currentURL });
    this.scroll = new RouteScroll({ history: this.history, isCurrent: revision => this.mounted && revision === this.revision });
    this.accessibility = new RouteAccessibility(options.id, () => this.element);
    this.view = new RouteView({
      id: options.id,
      root: options.root,
      isCurrent: revision => this.mounted && revision === this.revision,
    });
    this.navigation = new NavigationEvents({
      base: options.base,
      history: options.useHistory,
      root: () => this.element,
      onPop: (url, state) => this.handlePop(url, state),
      navigate: (path) => this.navigate(path),
    });
  }

  async mount(options: RuntimeMountOptions = {}) {
    this.unmount();
    const mountRevision = this.revision;
    try {
      return await this.mountAtRevision(options, mountRevision);
    } catch (error) {
      if (mountRevision === this.revision) {
        this.unmount();
        this.options.onError?.(error, this.initialURL());
      }
      throw error;
    }
  }

  private async mountAtRevision(options: RuntimeMountOptions, mountRevision: number) {
    this.options.onMount?.();
    this.nonce = options.nonce;
    this.view.nonce = options.nonce;
    const mountEpoch = this.mountEpoch;
    const stop = () => { if (mountEpoch === this.mountEpoch) this.unmount(); };
    this.element = options.id
      ? document.getElementById(options.id) ?? undefined
      : document.body;
    if (!this.element) throw new Error(`Yvee mount element not found: ${options.id}`);

    if (!document.body.id) document.body.id = options.id ?? this.options.id;
    this.element.dataset.app = this.options.id;
    this.mounted = true;
    // Intercept links and popstate from the very start of hydration. Waiting
    // until the initial page is committed leaves a window (seconds on slow
    // devices) where a click becomes a native full-page reload.
    this.booting = true;
    this.bootQueue = undefined;
    this.navigation.start();

    this.options.onLoading(true);
    const firstPage = await this.resolveInitialPage(this.initialURL());
    if (!this.mounted || mountRevision !== this.revision) { if (firstPage.kind === "ready") firstPage.dispose?.(); return stop; }

    if (firstPage.kind === "ready") {
      if (firstPage.dispose) this.pendingPages.add(firstPage.dispose);
      if (firstPage.failure !== undefined) {
        this.options.onError?.(firstPage.failure, firstPage.url);
      }
      const canonical = firstPage.page
        ? canonicalRegionURL(firstPage.page, firstPage.url)
        : undefined;
      if (canonical) {
        firstPage.url = canonical;
        firstPage.page!.url = canonical;
        this.history.write(canonical, undefined, true);
      }
      this.options.url.value = firstPage.url;
      this.options.root.value = firstPage.body;
      const initialHead = this.view.stage(
        combineHead(this.options.getHead(), firstPage.head),
        mountRevision,
      );
      this.view.active = initialHead;
      await initialHead.ready;
      if (!this.mounted || mountRevision !== this.revision) {
        initialHead();
        return stop;
      }
      // Remove SSR head nodes before activating this mount's route-owned head.
      removeHeadElements("root");
      await initialHead.activate();
      this.view.releasePending(initialHead);

      const layout = this.options.getLayout();
      await mountRoot({
        element: this.element,
        id: this.options.id,
        root: this.options.root,
        isCurrent: () => this.mounted && mountRevision === this.revision,
        ...(this.nonce === undefined ? {} : { nonce: this.nonce }),
        ...(options.className ? { className: options.className } : {}),
        ...(options.hydrate === undefined ? {} : { hydrate: options.hydrate }),
        ...(layout ? { layout } : {}),
      });
      if (!this.mounted || mountRevision !== this.revision) return stop;
      this.accessibility.mount();
      this.stopPage = firstPage.dispose;
      this.activePage = firstPage.page;
      if (firstPage.page) {
        rememberRegion(firstPage.page, firstPage.url, firstPage.page.region.value);
      }
      if (firstPage.dispose) this.pendingPages.delete(firstPage.dispose);
      this.view.remember(firstPage.body, combineHead(this.options.getHead(), firstPage.head));
      this.currentURL = firstPage.url;
      this.history.initialize(firstPage.url);
    }

    this.options.onLoading(false);
    await this.watchURL();
    if (!this.mounted || mountRevision !== this.revision) return stop;
    // The boot commit owns the URL and history entry now; replay the latest
    // request made while it was pending through the normal navigation paths.
    this.settleBoot();
    return stop;
  }

  navigate(path: string | YveeURL, state?: Record<string, unknown>, replace = false) {
    const raw = typeof path === "string"
      ? toURL(path)
      : toURL(`${path.path}${path.search}${path.hash}`);

    // While the initial page is loading the runtime owns the URL and history
    // entry; remember the raw request instead of corrupting the boot commit.
    if (this.booting) {
      this.queueBootNavigation(raw, state, replace);
      return;
    }

    const target = this.rememberedTarget(raw);

    if (urlKey(target) === urlKey(this.options.url.value)) return;
    if (!this.mounted) {
      this.options.url.value = target;
      return;
    }
    if (this.isHashNavigation(target)) {
      this.navigateHash(target, state, replace);
      return;
    }
    const region = this.regionNavigation(target);
    if (region === "apply") {
      this.navigateRegion(target, state, replace);
      return;
    }
    // A region URL that resolves to the displayed region needs no work.
    if (region === "noop") return;

    this.history.saveCurrentScroll();
    const targetKey = urlKey(target);
    const savedScroll = replace || target.hash
      ? undefined
      : this.history.getScroll(targetKey);
    this.history.write(target, state, replace, savedScroll);
    if (this.options.useHistory && location.protocol !== "file:") {
      this.pendingNavigation = {
        key: targetKey,
        replace,
        ...(savedScroll ? { scroll: savedScroll } : {}),
      };
    }
    this.options.url.value = target;
  }

  /**
   * Remember the latest in-app request made while the boot commit is pending.
   * A request for the URL being hydrated is dropped, and a newer request always
   * replaces an older one so the user's last intent wins.
   */
  private queueBootNavigation(
    target: YveeURL,
    state: Record<string, unknown> | undefined,
    replace: boolean,
  ) {
    const bootURL = this.currentURL ?? this.initialURL();
    if (urlKey(target) === urlKey(bootURL)) {
      // Clicking the URL already displayed needs no navigation. A queued pop
      // still wins: the address bar, not the link, moved.
      if (this.bootQueue?.kind !== "pop") this.bootQueue = undefined;
      return;
    }
    const queued: BootNavigation = {
      kind: "navigate",
      target: urlKey(target),
      replace,
    };
    if (state !== undefined) queued.state = state;
    this.bootQueue = queued;
  }

  /**
   * Leave the boot window and apply at most the latest request made during it.
   * The boot commit has already set the displayed URL, so the normal navigation
   * paths decide whether any work remains.
   */
  private settleBoot() {
    this.booting = false;
    const queued = this.bootQueue;
    this.bootQueue = undefined;
    if (!queued || !this.mounted) return;
    if (queued.kind === "pop") {
      this.handlePop(queued.url, queued.state);
      return;
    }
    this.navigate(queued.target, queued.state, queued.replace);
  }

  /**
   * A history move during the boot window is queued so it cannot abort or
   * desync the boot transition; it is replayed through this same path once the
   * initial page has committed.
   */
  private handlePop(url: YveeURL, state: unknown) {
    if (this.booting) {
      this.bootQueue = { kind: "pop", url, state };
      return;
    }
    // Classify before clearing pending state: an in-flight transition owns
    // the URL and must still complete as a full navigation.
    const regionOnly = this.isRegionOnlyPop(url);
    const previous = this.currentURL;
    const scroll = this.history.pop(url, state);
    this.pendingNavigation = undefined;
    this.updateURL(url);
    if (regionOnly && previous) this.applyRegionPop(previous, url, scroll);
    else void this.transition(url, true, scroll);
  }

  /**
   * Rewrite a region-less target for a different path to the region last active
   * on that path so the transition (and its server render) uses the region the
   * user last saw. Same-path targets keep their explicit query: an in-page tab
   * link that omits the region intentionally targets the default region, and
   * the region classifier swaps it without a transition. Explicit region
   * parameters win, and the initial document load never passes through here, so
   * hydration always follows the URL's region.
   */
  private rememberedTarget(target: YveeURL): YveeURL {
    if (!this.mounted || this.activeLoad || this.pendingNavigation) return target;
    // Same-page links are an explicit in-page intent; never revive memory here.
    if (this.currentURL && target.path === this.currentURL.path) return target;
    const memory = recallRegion(target.path);
    if (!memory || target.params.has(memory.regionParam)) return target;
    const params = new URLSearchParams(target.params);
    params.set(memory.regionParam, memory.id);
    const search = params.toString();
    return { ...target, search: search ? `?${search}` : "", params };
  }

  back() {
    if (typeof history !== "undefined") history.back();
  }

  forward() {
    if (typeof history !== "undefined") history.forward();
  }

  /**
   * A fragment change on the displayed page needs no page load, so it must skip
   * the URL hook while still pushing an entry and scrolling to the anchor.
   */
  private isHashNavigation(target: YveeURL) {
    const current = this.currentURL;
    return Boolean(
      current &&
      // An in-flight transition owns the URL state and history bookkeeping.
      !this.activeLoad &&
      !this.pendingNavigation &&
      target.path === current.path &&
      target.search === current.search &&
      target.hash !== current.hash,
    );
  }

  private navigateHash(target: YveeURL, state?: Record<string, unknown>, replace = false) {
    const revision = this.revision;
    this.history.saveCurrentScroll();
    this.history.write(target, state, replace);
    this.currentURL = target;
    this.updateURL(target);
    void this.scroll.scrollToRoute(target, revision).then(() => {
      if (this.mounted && revision === this.revision) this.history.trackDisplayedEntry();
    }).catch(error => {
      if (this.mounted && revision === this.revision) this.options.onError?.(error, target);
    });
  }

  /**
   * Region navigation is a soft URL change: same route, same non-region query,
   * and a different region than the one displayed. Anything else falls through
   * to the regular transition path.
   */
  private regionNavigation(target: YveeURL): "apply" | "noop" | undefined {
    if (!this.mounted || !this.currentURL) return undefined;
    if (this.activeLoad || this.pendingNavigation) return undefined;
    const page = this.activePage;
    if (!hasRegions(page)) return undefined;
    if (!this.isRegionURL(target, page)) return undefined;
    const next = regionIdFor(page, target);
    if (!next) return undefined;
    return next === page.region.value ? "noop" : "apply";
  }

  private isRegionOnlyPop(url: YveeURL) {
    if (!this.mounted || !this.currentURL) return false;
    if (this.activeLoad || this.pendingNavigation) return false;
    const page = this.activePage;
    return Boolean(page && hasRegions(page) && this.isRegionURL(url, page));
  }

  private isRegionURL(url: YveeURL, page: Page) {
    const current = this.currentURL!;
    return url.path === current.path &&
      url.hash === current.hash &&
      sameRegionSearch(url, current, page.regionParam!);
  }

  private navigateRegion(
    target: YveeURL,
    state: Record<string, unknown> | undefined,
    replace: boolean,
  ) {
    const page = this.activePage;
    const previous = this.currentURL;
    if (!page || !previous) return;
    const region = regionIdFor(page, target);
    if (!region) return;

    this.history.saveCurrentScroll();
    this.history.write(target, state, replace);
    this.currentURL = target;
    this.updateURL(target);
    this.history.trackDisplayedEntry();

    const token = { epoch: ++this.regionEpoch, revision: this.revision };
    void this.swapRegion(page, target, region, token).then(result => {
      if (result !== "failed" || !this.isRegionCurrent(page, token)) return;
      this.rollbackRegion(previous, replace);
    });
  }

  private applyRegionPop(previous: YveeURL, url: YveeURL, scroll?: ScrollPosition) {
    const page = this.activePage;
    if (!page) return;
    const region = regionIdFor(page, url);
    if (!region) return;
    this.currentURL = url;
    const revision = this.revision;
    const restore = () => {
      void this.scroll.restoreScroll(scroll, revision, url).catch(error => {
        if (this.mounted && revision === this.revision) this.options.onError?.(error, url);
      });
    };
    if (region === page.region.value) {
      restore();
      return;
    }
    const token = { epoch: ++this.regionEpoch, revision };
    void this.swapRegion(page, url, region, token).then(result => {
      if (!this.mounted || revision !== this.revision) return;
      if (result === "applied") restore();
      else if (result === "failed") this.restoreURL(previous);
    });
  }

  /**
   * Replace the active region's view. Module loading happens before any state
   * mutation so an import failure leaves the displayed region untouched.
   */
  private async swapRegion(
    page: Page,
    url: YveeURL,
    region: string,
    token: { epoch: number; revision: number },
  ): Promise<"applied" | "failed" | "stale"> {
    if (region === page.region.value) return "applied";

    let module;
    try {
      module = await regionModule(page, region);
    } catch (error) {
      if (!this.isRegionCurrent(page, token)) return "stale";
      this.options.onError?.(error, url);
      return "failed";
    }
    if (!this.isRegionCurrent(page, token)) return "stale";

    const previousScope = page.regionResources;
    const previousRegion = page.region.value;
    try { previousScope.dispose(); }
    catch (error) { this.options.onError?.(error, url); }

    const nextScope = new DisposalScope();
    page.regionResources = nextScope;
    page.region.value = region;

    let content: unknown;
    try {
      content = await module.default({ page });
    } catch (error) {
      try { nextScope.dispose(); }
      catch (cleanup) { this.options.onError?.(cleanup, url); }
      if (!this.isRegionCurrent(page, token)) return "stale";
      // The previous scope is already closed; give the retained region a fresh one.
      page.regionResources = new DisposalScope();
      page.region.value = previousRegion;
      this.options.onError?.(error, url);
      return "failed";
    }
    if (!this.isRegionCurrent(page, token)) {
      try { nextScope.dispose(); }
      catch (error) { this.options.onError?.(error, url); }
      return "stale";
    }

    page.regionContent.value = content;
    try { await page.regionContent.flush(); }
    catch (error) { this.options.onError?.(error, url); }
    rememberRegion(page, url, region);
    return "applied";
  }

  private isRegionCurrent(page: Page, token: { epoch: number; revision: number }) {
    return this.mounted &&
      this.activePage === page &&
      token.epoch === this.regionEpoch &&
      token.revision === this.revision;
  }

  private rollbackRegion(previous: YveeURL, replace: boolean) {
    this.currentURL = previous;
    if (!replace && this.options.useHistory && location.protocol !== "file:") {
      this.updateURL(previous);
      history.back();
      return;
    }
    this.restoreURL(previous);
  }

  private async resolveInitialPage(url: YveeURL): Promise<PageLoad> {
    const originalURL = url;
    const controller = new AbortController();
    this.activeLoad = controller;
    // Read the SSR hint before clearing it so a stop or failed load can put the
    // original marker back exactly as the server delivered it.
    const body = document.body;
    const marker = body.dataset.error;
    delete body.dataset.error;
    try {
      const initialStatus = Number(marker);
      let result = await this.options.load(url, controller.signal,
        initialStatus >= 400 && initialStatus <= 599 ? initialStatus : undefined);
      let redirectCount = 0;

      while (result.kind === "redirect") {
        if (++redirectCount > 10) throw new Error("Yvee redirect limit exceeded.");
        url = toURL(result.to);
        result = await this.options.load(url, controller.signal);
      }

      if (urlKey(url) !== urlKey(originalURL)) this.history.write(url, undefined, true);
      if (result.kind === "ready") reconcileBodyError(result.status, body);
      else if (marker !== undefined) body.dataset.error = marker;
      return result;
    } catch (error) {
      if (marker !== undefined) body.dataset.error = marker;
      throw error;
    } finally {
      if (this.activeLoad === controller) this.activeLoad = undefined;
    }
  }

  private async transition(url: YveeURL, fromHistory = false, restoredScroll?: ScrollPosition) {
    const revision = this.revision + 1;
    try {
      await this.runTransition(url, fromHistory, restoredScroll);
    } catch (error) {
      if (!this.mounted || revision !== this.revision) return;
      const errors = [error];
      try { this.view.discardPending(); } catch (cleanup) { errors.push(cleanup); }
      try { this.discardPendingPages(); } catch (cleanup) { errors.push(cleanup); }
      this.options.onLoading(false);
      this.options.onError?.(errors.length === 1 ? error : new AggregateError(errors, "Transition cleanup failed."), url);
      if (this.currentURL) this.cancelNavigation(url, fromHistory);
    }
  }

  private async runTransition(
    url: YveeURL,
    fromHistory = false,
    restoredScroll?: ScrollPosition,
  ) {
    const revision = ++this.revision;
    this.regionEpoch++;
    this.history.beginTransition();
    this.view.discardPending();
    this.discardPendingPages();
    this.activeLoad?.abort();
    const controller = new AbortController();
    this.activeLoad = controller;
    this.options.onLoading(true);

    let result: PageLoad;
    try {
      result = await this.options.load(url, controller.signal);
    } catch (error) {
      if (this.activeLoad !== controller || !this.mounted) return;
      this.activeLoad = undefined;
      this.options.onLoading(false);
      this.options.onError?.(error, url);
      if (this.currentURL) this.cancelNavigation(url, fromHistory);
      return;
    }

    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      if (result.kind === "ready") result.dispose?.();
      return;
    }
    this.activeLoad = undefined;

    if (result.kind === "stop") {
      this.options.onLoading(false);
      if (this.currentURL) this.cancelNavigation(url, fromHistory);
      return;
    }
    if (result.kind === "redirect") {
      this.options.onLoading(false);
      this.followRedirect(result);
      return;
    }

    if (result.dispose) this.pendingPages.add(result.dispose);
    this.redirects = 0;
    if (result.failure !== undefined) this.options.onError?.(result.failure, result.url);
    const nextHead = this.view.stage(
      combineHead(this.options.getHead(), result.head),
      revision,
    );
    await nextHead.ready;
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      nextHead();
      return;
    }

    await this.view.setBody(result.body, revision);
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      nextHead();
      return;
    }

    const navigationScroll = this.pendingNavigation?.key === urlKey(url)
      ? this.pendingNavigation.scroll
      : undefined;
    await this.view.activate(nextHead, revision);
    if (!this.mounted || revision !== this.revision) { nextHead(); return; }
    this.view.active = nextHead;
    this.view.releasePending(nextHead);
    this.clearPendingNavigation(url);
    const previousPage = this.stopPage;
    this.stopPage = result.dispose;
    this.activePage = result.page;
    if (result.page) {
      rememberRegion(result.page, result.url, result.page.region.value);
    }
    if (result.dispose) this.pendingPages.delete(result.dispose);
    try { previousPage?.(); } catch (error) { this.options.onError?.(error, result.url); }
    this.view.remember(result.body, combineHead(this.options.getHead(), result.head));
    this.currentURL = result.url;
    // Keep the SSR body marker in step with the committed page so a hydrated
    // error page cannot leave a stale marker after a successful navigation.
    reconcileBodyError(result.status);
    if (!this.options.useHistory) {
      this.accessibility.commit(result.url, () => this.mounted && revision === this.revision);
      this.options.onLoading(false);
      return;
    }
    if (fromHistory) await this.scroll.restoreScroll(restoredScroll, revision, result.url);
    else {
      this.history.replaceAddressIfNeeded(result.url);
      if (navigationScroll && !result.url.hash) {
        await this.scroll.restoreScroll(navigationScroll, revision, result.url);
      } else {
        await this.scroll.scrollToRoute(result.url, revision);
      }
    }
    if (this.mounted && revision === this.revision) {
      this.accessibility.commit(result.url, () => this.mounted && revision === this.revision);
      this.options.onLoading(false);
    }
  }

  private async watchURL() {
    this.stopURL = await StateHook(async (url) => {
      if (!this.mounted || this.ignoreURLHook) return;
      await this.transition(url);
    }, [this.options.url], { id: `${this.options.id}_url` });
  }

  private followRedirect(result: Extract<PageLoad, { kind: "redirect" }>) {
    if (++this.redirects > 10) throw new Error("Yvee redirect limit exceeded.");
    this.navigate(result.to, undefined, result.replace ?? true);
  }

  private cancelNavigation(url: YveeURL, fromHistory: boolean) {
    const pending = this.pendingNavigation;
    this.pendingNavigation = undefined;

    if (
      !fromHistory &&
      pending?.key === urlKey(url) &&
      !pending.replace &&
      this.options.useHistory &&
      location.protocol !== "file:"
    ) {
      this.updateURL(this.currentURL!);
      history.back();
      return;
    }

    this.restoreURL(this.currentURL!);
  }

  private clearPendingNavigation(url: YveeURL) {
    if (this.pendingNavigation?.key === urlKey(url)) {
      this.pendingNavigation = undefined;
    }
  }

  private restoreURL(url: YveeURL) {
    this.history.restoreAddress(url);
    this.updateURL(url);
    this.history.trackDisplayedEntry();
  }

  private updateURL(url: YveeURL) {
    this.ignoreURLHook = true;
    try {
      this.options.url.value = url;
    } finally {
      this.ignoreURLHook = false;
    }
  }

  private initialURL() {
    return toURL(location.protocol === "file:" ? "/" : location.href);
  }

  dispose() { this.unmount(); }

  private discardPendingPages() {
    const cleanups = [...this.pendingPages]; this.pendingPages.clear();
    const errors: unknown[] = [];
    for (const cleanup of cleanups) { try { cleanup(); } catch (error) { errors.push(error); } }
    if (errors.length) throw new AggregateError(errors, "Pending page cleanup failed.");
  }

  private unmount() {
    this.mountEpoch++;
    this.mounted = false;
    this.booting = false;
    this.bootQueue = undefined;
    this.revision++;
    const stopURL = this.stopURL; this.stopURL = undefined;
    const stopPage = this.stopPage; this.stopPage = undefined;
    const activeLoad = this.activeLoad; this.activeLoad = undefined;
    this.activePage = undefined;
    this.regionEpoch++;
    const errors: unknown[] = [];
    const cleanup = (fn: () => void) => { try { fn(); } catch (error) { errors.push(error); } };
    cleanup(() => activeLoad?.abort());
    cleanup(() => stopURL?.());
    cleanup(() => this.view.releaseActive());
    cleanup(() => this.view.discardPending());
    cleanup(() => this.discardPendingPages());
    cleanup(() => this.navigation.stop());
    cleanup(() => { if (this.element?.id) Wizard.resetScope(this.element.id); });
    cleanup(() => stopPage?.());
    cleanup(() => this.accessibility.dispose());
    if (this.element?.dataset.app === this.options.id) delete this.element.dataset.app;
    cleanup(() => this.options.onUnmount());
    this.options.onLoading(false);
    this.currentURL = undefined;
    this.view.reset();
    this.pendingNavigation = undefined;
    this.history.reset();
    if (errors.length) throw new AggregateError(errors, "App disposal failed.");
  }
}

function reconcileBodyError(status: number, body: HTMLElement = document.body) {
  if (status >= 400) body.dataset.error = String(status);
  else delete body.dataset.error;
}

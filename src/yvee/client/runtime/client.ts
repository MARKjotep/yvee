import { StateHook } from "@/core/core.core";
import { Wizard } from "@/dom/render/oz.dom";
import { combineHead, removeHeadElements } from "../../rendering/head";
import type { PageLoad } from "../load-page";
import { mountRoot } from "../mount";
import { NavigationEvents } from "../navigation";
import { toURL, urlKey, type YveeURL } from "../../routing/path";
import { RouteHistory } from "./history";
import { RouteScroll } from "./scroll";
import { RouteAccessibility } from "./accessibility";
import { RouteView } from "./view";
import type { RuntimeOptions, RuntimeMountOptions, ScrollPosition } from "./types";

export class YveeClient {
  private readonly navigation: NavigationEvents;
  private readonly history: RouteHistory;
  private readonly scroll: RouteScroll;
  private readonly accessibility: RouteAccessibility;
  private readonly view: RouteView;
  private nonce: string | undefined;
  private element: HTMLElement | undefined;
  private mounted = false;
  private ignoreURLHook = false;
  private revision = 0;
  private mountEpoch = 0;
  private redirects = 0;
  private stopPage: (() => void) | undefined;
  private readonly pendingPages = new Set<() => void>();
  private currentURL: YveeURL | undefined;
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
      onPop: (url, state) => {
        const scroll = this.history.pop(url, state);
        this.pendingNavigation = undefined;
        this.updateURL(url);
        void this.transition(url, true, scroll);
      },
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

    this.options.onLoading(true);
    const firstPage = await this.resolveInitialPage(this.initialURL());
    if (!this.mounted || mountRevision !== this.revision) { if (firstPage.kind === "ready") firstPage.dispose?.(); return stop; }

    if (firstPage.kind === "ready") {
      if (firstPage.dispose) this.pendingPages.add(firstPage.dispose);
      if (firstPage.failure !== undefined) {
        this.options.onError?.(firstPage.failure, firstPage.url);
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
      if (firstPage.dispose) this.pendingPages.delete(firstPage.dispose);
      this.view.remember(firstPage.body, combineHead(this.options.getHead(), firstPage.head));
      this.currentURL = firstPage.url;
      this.history.initialize(firstPage.url);
    }

    this.options.onLoading(false);
    await this.watchURL();
    if (!this.mounted || mountRevision !== this.revision) return stop;
    this.navigation.start();
    return stop;
  }

  navigate(path: string | YveeURL, state?: Record<string, unknown>, replace = false) {
    const target = typeof path === "string"
      ? toURL(path)
      : toURL(`${path.path}${path.search}${path.hash}`);

    if (urlKey(target) === urlKey(this.options.url.value)) return;
    if (!this.mounted) {
      this.options.url.value = target;
      return;
    }
    if (this.isHashNavigation(target)) {
      this.navigateHash(target, state, replace);
      return;
    }

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
    this.revision++;
    const stopURL = this.stopURL; this.stopURL = undefined;
    const stopPage = this.stopPage; this.stopPage = undefined;
    const activeLoad = this.activeLoad; this.activeLoad = undefined;
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

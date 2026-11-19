import { expect, it } from "bun:test";
import { RouteHistory } from "../../src/yvee/client/runtime/history";
import { RouteScroll } from "../../src/yvee/client/runtime/scroll";
import type { YveeURL } from "../../src/yvee/routing/path";

it("remembers a scrolled page left through Back for Forward and link revisits", async () => {
  const names = ["window", "location", "history", "requestAnimationFrame"] as const;
  const original = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  const address = new URL("http://localhost/");
  const entries = [{ state: {} as Record<string, unknown>, path: "/" }];
  let index = 0;
  const viewport = { scrollX: 0, scrollY: 0, location: address,
    scrollTo(x: number, y: number) { this.scrollX = x; this.scrollY = y; } };
  const historyMock = {
    get state() { return entries[index]!.state; },
    replaceState(state: Record<string, unknown>) { entries[index]!.state = state; },
    pushState(state: Record<string, unknown>, _title: string, path: string) {
      entries.splice(index + 1);
      entries.push({ state, path });
      index++;
      address.pathname = path;
    },
  };
  const url = (path: string): YveeURL => ({ path, search: "", hash: "", params: new URLSearchParams() });
  try {
    Object.assign(globalThis, { window: viewport, location: address, history: historyMock,
      requestAnimationFrame: (callback: FrameRequestCallback) => { callback(0); return 1; } });
    let currentURL = url("/");
    const routeHistory = new RouteHistory({ id: "scroll-test", enabled: true, currentURL: () => currentURL });
    const routeScroll = new RouteScroll({ history: routeHistory, isCurrent: () => true });
    routeHistory.trackDisplayedEntry();
    const navigate = (target: YveeURL) => {
      routeHistory.saveCurrentScroll();
      routeHistory.write(target, undefined, false, routeHistory.getScroll(target.path));
    };
    const pop = async (target: YveeURL) => {
      const scroll = routeHistory.pop(target, historyMock.state);
      currentURL = target;
      await routeScroll.restoreScroll(scroll, 0, target);
    };

    navigate(url("/studio"));
    currentURL = url("/studio");
    routeHistory.trackDisplayedEntry();
    viewport.scrollY = 640;

    // Native Back changes history before the runtime receives popstate.
    index = 0;
    address.pathname = "/";
    await pop(url("/"));
    expect(viewport.scrollY).toBe(0);
    expect(entries[0]!.state.scroll).toEqual({ x: 0, y: 0 });

    index = 1;
    address.pathname = "/studio";
    await pop(url("/studio"));
    expect(viewport.scrollY).toBe(640);

    viewport.scrollY = 820;
    index = 0;
    address.pathname = "/";
    await pop(url("/"));
    navigate(url("/studio"));
    expect(entries[index]!.state.scroll).toEqual({ x: 0, y: 820 });
  } finally {
    names.forEach((name, i) => {
      const descriptor = original[i];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
});

import { State, Stateful } from "../../stateful";

// browser-path-history.ts
export type ExtraState = Record<string, unknown>;
export type HistoryData<S extends ExtraState = ExtraState> =
  | (S & { path: string })
  | null;

type ChangeHandler<S extends ExtraState> = (
  path: string,
  state: HistoryData<S>,
) => void;

export class PathHistory<S extends ExtraState = ExtraState> {
  private onChange?: ChangeHandler<S>;
  private popListener?: (e: PopStateEvent) => void;

  constructor(path: Stateful<string> = State(""), onChange?: ChangeHandler<S>) {
    this.assertClient();
    this.onChange = onChange;

    this.onChange?.(
      this.path(),
      (history.state as HistoryData<S>) ??
        ({ path: this.path() } as HistoryData<S>),
    );

    this.popListener = (e: PopStateEvent) => {
      const state =
        (e.state as HistoryData<S>) ??
        ({ path: this.path() } as HistoryData<S>);
      //
      path.value = state?.path || path.value;

      this.onChange?.(this.path(), state);
    };
    window.addEventListener("popstate", this.popListener);
  }

  /** Current path (pathname + search + hash) */
  path(): string {
    this.assertClient();
    const { pathname, search, hash } = window.location;
    return `${pathname}${search}${hash}`;
  }

  /** Current state object */
  state(): HistoryData<S> {
    this.assertClient();
    return (
      (window.history.state as HistoryData<S>) ??
      ({ path: this.path() } as HistoryData<S>)
    );
  }

  /** Navigate to a new path using pushState (no-op if same as current) */
  navigate(path: string, state?: S, title = ""): void {
    this.assertClient();
    const target = this.resolve(path);
    const current = this.path();

    // Don't push if path is effectively the same
    if (this.samePath(current, target)) return;

    const data: HistoryData<S> = { ...(state as S), path: target };
    window.history.pushState(data, title, target);

    // Notify after pushing (your listener may call navigate again; guard above prevents loops)
    this.onChange?.(this.path(), data);
  }

  /** Replace current entry using replaceState (no-op if same as current) */
  replace(path: string, state?: S, title = ""): void {
    this.assertClient();
    const target = this.resolve(path);
    const current = this.path();

    if (this.samePath(current, target)) return;

    const data: HistoryData<S> = { ...(state as S), path: target };
    window.history.replaceState(data, title, target);
    this.onChange?.(this.path(), data);
  }

  back(): void {
    this.assertClient();
    window.history.back();
  }

  forward(): void {
    this.assertClient();
    window.history.forward();
  }

  /** Remove listeners */
  destroy(): void {
    if (this.popListener) {
      window.removeEventListener("popstate", this.popListener);
      this.popListener = undefined;
    }
  }

  private resolve(input: string): string {
    const url = new URL(input, window.location.origin);

    return `${url.pathname}${url.search}${url.hash}`;
  }

  private samePath(a: string, b: string): boolean {
    return a === b;
  }

  private assertClient() {
    if (
      typeof window === "undefined" ||
      typeof window.history === "undefined"
    ) {
      throw new Error(
        "BrowserPathHistory must be used in a client/browser environment.",
      );
    }
  }
}

import { State, Stateful } from "@@/stateful";
import { IS_BROWSER } from "@coff-r/x";

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
  private onChange: ChangeHandler<S> | undefined;
  private popListener?: ((e: PopStateEvent) => void) | undefined;

  constructor(
    path: Stateful<string> = State(""),
    isDev: boolean = false,
    onChange?: ChangeHandler<S>,
  ) {
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
      let loc = state?.path;
      if (isDev && loc) {
        loc = loc === "/" ? loc : loc.replace(/\/+$/g, "");
      }

      path.value = loc || path.value;

      this.onChange?.(this.path(), state);
    };
    if (IS_BROWSER) {
      window.addEventListener("popstate", this.popListener);
    }
  }

  /** Current path (pathname + search + hash) */
  path(): string {
    const { pathname, search, hash } = window.location;
    return `${pathname}${search}${hash}`;
  }

  /** Current state object */
  state(): HistoryData<S> {
    return (
      (window.history.state as HistoryData<S>) ??
      ({ path: this.path() } as HistoryData<S>)
    );
  }

  /** Navigate to a new path using pushState (no-op if same as current) */
  navigate(path: string, state?: S, title = ""): void {
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
    const target = this.resolve(path);
    const current = this.path();

    if (this.samePath(current, target)) return;

    const data: HistoryData<S> = { ...(state as S), path: target };
    window.history.replaceState(data, title, target);
    this.onChange?.(this.path(), data);
  }

  back(): void {
    window.history.back();
  }

  forward(): void {
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
}

import type { Elements } from "@/$/query.$";
import type { IStateful } from "@/core/state/stateful.core";
import type { maybePromise } from "@/utils";

export interface c_events<T extends Elements = HTMLElement> {
  state?:
    | ((
        this: T,
        e: T,
      ) => maybePromise<
        [(...args: any[]) => void, IStateful<any>[], boolean?, boolean?]
      >)
    | undefined;
  states?:
    | ((
        this: T,
        e: T,
      ) => maybePromise<
        [(...args: any[]) => void, IStateful<any>[], boolean?, boolean?]
      >[])
    | undefined;
  ready?: ((this: T, e: T) => maybePromise<void | (() => void)>) | undefined;
  resize?: ((this: T, e: UIEvent) => void) | undefined;
  beforeunload?: ((this: T, e: BeforeUnloadEvent) => void) | undefined;
  popstate?: ((this: T, e: PopStateEvent) => void) | undefined;
  DOMContentLoaded?: ((this: T, e: Event) => void) | undefined;
  winscroll?: ((this: T, e: Event) => void) | undefined;
  winload?: ((this: T, e: Event) => void) | undefined;
  winfocus?: ((this: T, e: Event) => void) | undefined;
  winblur?: ((this: T, e: Event) => void) | undefined;
  winkeydown?: ((this: T, e: KeyboardEvent) => void) | undefined;
  winkeypress?: ((this: T, e: KeyboardEvent) => void) | undefined;
  winkeyup?: ((this: T, e: KeyboardEvent) => void) | undefined;
}

/**
 * Event handler map accepted by `on`. Every handler is optional and may be
 * explicitly `undefined`; the renderer skips absent handlers.
 */
export type DOMEvents<T extends Elements = HTMLElement> = {
  [P in keyof GlobalEventHandlersEventMap]?:
    | ((this: T, event: GlobalEventHandlersEventMap[P]) => void)
    | undefined;
} & c_events<T>;

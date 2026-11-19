import type { Elements } from "@/$/query.$";
import type { IStateful } from "@/core/state/stateful.core";
import type { maybePromise } from "@/utils";
export interface c_events<T extends Elements = HTMLElement> {
    state?: (this: T, e: T) => maybePromise<[
        (...args: any[]) => void,
        IStateful<any>[],
        boolean?,
        boolean?
    ]>;
    states?: (this: T, e: T) => maybePromise<[
        (...args: any[]) => void,
        IStateful<any>[],
        boolean?,
        boolean?
    ]>[];
    ready?: (this: T, e: T) => maybePromise<void | (() => void)>;
    resize?: (this: T, e: UIEvent) => void;
    beforeunload?: (this: T, e: BeforeUnloadEvent) => void;
    popstate?: (this: T, e: PopStateEvent) => void;
    DOMContentLoaded?: (this: T, e: Event) => void;
    winscroll?: (this: T, e: Event) => void;
    winload?: (this: T, e: Event) => void;
    winfocus?: (this: T, e: Event) => void;
    winblur?: (this: T, e: Event) => void;
    winkeydown?: (this: T, e: KeyboardEvent) => void;
    winkeypress?: (this: T, e: KeyboardEvent) => void;
    winkeyup?: (this: T, e: KeyboardEvent) => void;
}
export type DOMEvents<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?: (this: T, event: GlobalEventHandlersEventMap[P]) => void;
} & c_events<T>;

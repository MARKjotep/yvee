import { type IStateful, type StateOptions } from "./stateful.core";
import type { DisposalScope } from "../disposal.core";
export type DerivedValue<T> = Readonly<IStateful<T>> & {
    dispose(): void;
};
export interface DerivedOptions<T> extends StateOptions<T> {
    scope?: DisposalScope;
}
/** Explicit dependencies; await installation before changing inputs. Calculations are synchronous. */
export declare function Derived<T extends unknown[], R>(states: [...{
    [K in keyof T]: IStateful<T[K]>;
}], compute: (...values: T) => R extends PromiseLike<unknown> ? never : R, options?: DerivedOptions<R>): Promise<DerivedValue<R>>;

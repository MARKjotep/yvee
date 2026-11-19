import type { GuardContext, GuardResult } from "./guards";
export type ContextGuard<C = GuardContext> = (context: C) => GuardResult | Promise<GuardResult>;
export type GuardPredicate<C = GuardContext> = (context: C) => boolean | Promise<boolean>;
export type GuardRejection = Exclude<GuardResult, void | {
    kind: "allow";
}>;
export type GuardFallback<C = GuardContext> = GuardRejection | ((context: C) => GuardRejection | Promise<GuardRejection>);
/** Requires a condition; use a context-derived fallback for redirects. */
export declare function requireGuard<C = GuardContext>(predicate: GuardPredicate<C>, fallback?: GuardFallback<C>): ContextGuard<C>;
/** Evaluates guards in order and returns the first stop/redirect decision. */
export declare function allGuards<C extends GuardContext<any, any, any> = GuardContext>(...guards: ContextGuard<C>[]): ContextGuard<C>;
/** Runs a guard only when its condition holds. */
export declare function whenGuard<C = GuardContext>(predicate: GuardPredicate<C>, guard: ContextGuard<C>): ContextGuard<C>;
/** Validates route parameters before page fetch/render. */
export declare function paramsGuard<C extends GuardContext<any, any, any> = GuardContext>(validators: Record<string, (value: string, context: C) => boolean | Promise<boolean>>, fallback?: GuardFallback<C>): ContextGuard<C>;

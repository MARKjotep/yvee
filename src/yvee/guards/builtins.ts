import type { GuardContext, GuardResult } from "./guards";

export type ContextGuard<C = GuardContext> = (context: C) => GuardResult | Promise<GuardResult>;
export type GuardPredicate<C = GuardContext> = (context: C) => boolean | Promise<boolean>;
export type GuardRejection = Exclude<GuardResult, void | { kind: "allow" }>;
export type GuardFallback<C = GuardContext> =
  | GuardRejection
  | ((context: C) => GuardRejection | Promise<GuardRejection>);

/** Requires a condition; use a context-derived fallback for redirects. */
export function requireGuard<C = GuardContext>(
  predicate: GuardPredicate<C>,
  fallback: GuardFallback<C> = { kind: "stop" },
): ContextGuard<C> {
  return async (context) => await predicate(context)
    ? { kind: "allow" }
    : typeof fallback === "function" ? fallback(context) : fallback;
}

/** Evaluates guards in order and returns the first stop/redirect decision. */
export function allGuards<C extends GuardContext<any, any, any> = GuardContext>(
  ...guards: ContextGuard<C>[]
): ContextGuard<C> {
  return async (context) => {
    for (const guard of guards) {
      context.signal.throwIfAborted();
      const result = await guard(context);
      context.signal.throwIfAborted();
      if (result && result.kind !== "allow") return result;
    }
    return { kind: "allow" };
  };
}

/** Runs a guard only when its condition holds. */
export function whenGuard<C = GuardContext>(
  predicate: GuardPredicate<C>,
  guard: ContextGuard<C>,
): ContextGuard<C> {
  return async (context) => await predicate(context) ? guard(context) : { kind: "allow" };
}

/** Validates route parameters before page fetch/render. */
export function paramsGuard<C extends GuardContext<any, any, any> = GuardContext>(
  validators: Record<string, (value: string, context: C) => boolean | Promise<boolean>>,
  fallback: GuardFallback<C> = { kind: "stop" },
): ContextGuard<C> {
  return requireGuard(async (context: C) => {
    for (const [key, validate] of Object.entries(validators)) {
      const value = context.params[key];
      if (value === undefined || !await validate(value, context)) return false;
    }
    return true;
  }, fallback);
}

import { createScopeRegistry, registerScopes, resolveScope, type ScopeConfig } from "./registry";

export interface ScopeSet<C extends ScopeConfig> {
  use<Name extends keyof C & string>(name: Name): C[Name];
}

/** Shared named objects, exposed through the static register/use interface. */
class _Scope {
  private constructor() {}

  /** An independent container. It never publishes values to global Scope/Field. */
  static create<C extends ScopeConfig>(config: C): ScopeSet<C> {
    const registry = createScopeRegistry();
    registerScopes(config, registry);
    return { use: <Name extends keyof C & string>(name: Name) => resolveScope<C[Name]>(name, registry) };
  }

  static register<C extends ScopeConfig>(config: C): ScopeSet<C> {
    registerScopes(config);
    return {
      use: <Name extends keyof C & string>(name: Name) =>
        resolveScope<C[Name]>(name),
    };
  }

  /** Prefer the typed handle returned by register when it is available. */
  static use<TValue extends object>(name: string): TValue {
    return resolveScope<TValue>(name);
  }
}

/** Describes the static interface of the Scope class. */
interface ScopeStatic {
  create<C extends ScopeConfig>(config: C): ScopeSet<C>;
  register<Config extends Record<string, Record<string, any>>>(
    data: Config,
  ): ScopeSet<Config>;
  use<T extends Record<string, any>>(name: string): T;
}

export type Scope = _Scope;
export const Scope: ScopeStatic = _Scope;

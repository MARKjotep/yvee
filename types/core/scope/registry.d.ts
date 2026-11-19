export type ScopeConfig = Record<string, object>;
export declare function createScopeRegistry(): Map<string, object>;
/** Validate the complete batch before publishing any scopes. */
export declare function registerScopes<C extends ScopeConfig>(config: C, target?: Map<string, object>): void;
export declare function resolveScope<T extends object>(name: string, target?: Map<string, object>): T;

export type ScopeConfig = Record<string, object>;

export function createScopeRegistry() {
  return new Map<string, object>();
}

const registry = createScopeRegistry();

/** Validate the complete batch before publishing any scopes. */
export function registerScopes<C extends ScopeConfig>(config: C, target = registry): void {
  const entries = Object.entries(config);
  for (const [name, value] of entries) {
    if (!name.trim()) throw new TypeError("Scope names must not be empty.");
    if (target.has(name)) throw new Error(`Scope already registered: ${name}`);
    if (value === null || typeof value !== "object" || Array.isArray(value) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
      throw new TypeError(`Scope must be a plain object: ${name}`);
    }
  }
  const prepared = entries.map(([name, value]) => [name, Object.seal({ ...value })] as const);
  for (const [name, value] of prepared) target.set(name, value);
}

export function resolveScope<T extends object>(name: string, target = registry): T {
  const value = target.get(name);
  if (!value) throw new Error(`Scope is not registered: ${name}`);
  return value as T;
}

export class Stored<T extends Record<PropertyKey, unknown>> {
  private readonly state: T;
  private readonly dev: boolean;

  constructor(initial: T, options?: { dev?: boolean }) {
    Object.seal(initial);

    // seal first-level nested objects
    for (const key in initial) {
      const value = initial[key];
      if (typeof value === "object" && value !== null) {
        Object.seal(value);
      }
    }

    this.state = initial;
    this.dev = options?.dev ?? false;
  }

  public get __(): T {
    return this.state;
  }

  // 🔹 Top-level bind (runtime injection)
  public bind(values: Partial<T>): void {
    for (const [key, value] of Object.entries(values)) {
      const k = key as keyof T;

      if (this.state[k] != null) {
        if (this.dev) {
          console.warn(`[Stored] ${String(k)} already bound`);
        }
        continue;
      }

      this.state[k] = value as T[typeof k];

      if (this.dev) {
        console.log(`[Stored] bound ${String(k)}`);
      }
    }
  }

  // 🔹 Nested mutation helper (1 level deep)
  public set<K extends keyof T, P extends keyof T[K]>(
    key: K,
    prop: P,
    value: T[K][P],
  ): void {
    const target = this.state[key];

    if (typeof target !== "object" || target === null) {
      throw new Error(`${String(key)} is not an object`);
    }

    (target as T[K])[prop] = value;

    if (this.dev) {
      console.log(`[Stored] updated ${String(key)}.${String(prop)} →`, value);
    }
  }

  public fn<R>(fn: (state: T) => R): () => R {
    return () => fn(this.state);
  }

  public safe<K extends keyof T>(key: K): NonNullable<T[K]> {
    const value = this.state[key];
    if (value == null) {
      throw new Error(`${String(key)} not bound`);
    }
    return value as NonNullable<T[K]>;
  }
}

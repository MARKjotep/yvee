type StoreName = "localStorage" | "sessionStorage";
import type { DisposalScope } from "../../core/disposal.core";

export interface StorageSchema<T> {
  version: number;
  validate: (value: unknown) => value is T;
  fallback: () => T;
  /** Destination version -> migration from the preceding version. */
  migrations?: Readonly<Record<number, (value: unknown) => unknown>>;
}
export interface StorageChange { key: string | null; oldValue: string | null; newValue: string | null; }
export interface StorageWatchOptions { signal?: AbortSignal; scope?: DisposalScope; }

export class VersionedValue<T> {
  readonly key: string;
  constructor(private readonly store: BrowserStore, private readonly base: string, private readonly schema: StorageSchema<T>) {
    if (!Number.isSafeInteger(schema.version) || schema.version < 1) throw new TypeError("Storage versions must be positive integers.");
    this.key = `${base}:v${schema.version}`;
  }

  get(): T {
    if (this.store.has(this.key)) return this.check(this.store.get(this.key).value);
    for (let version = this.schema.version - 1; version >= 1; version--) {
      const key = `${this.base}:v${version}`;
      if (!this.store.has(key)) continue;
      let value: unknown = this.store.get(key).value;
      for (let next = version + 1; next <= this.schema.version; next++) {
        const migrate = this.schema.migrations?.[next];
        if (!migrate) throw new Error(`Missing storage migration to version ${next}.`);
        value = migrate(value);
      }
      const result = this.check(value);
      this.store.set(this.key, result);
      return result;
    }
    return this.check(this.schema.fallback());
  }

  set(value: T) { this.store.set(this.key, this.check(value)); return this; }
  remove() { this.store.remove(this.key); return this; }
  watch(callback: (change: StorageChange) => void, options?: StorageWatchOptions) {
    return this.store.watch(this.key, callback, options);
  }
  private check(value: unknown): T {
    if (!this.schema.validate(value)) throw new TypeError(`Invalid stored value for '${this.key}'.`);
    return value;
  }
}

export class StoredValue<T = unknown> {
  constructor(
    private readonly storeName: StoreName,
    readonly key: string,
    private current: T,
  ) {}

  get value() {
    return this.current;
  }

  set value(value: T) {
    this.current = value;
  }

  set(value: T) {
    this.current = value;
    return this;
  }

  save() {
    if (typeof window !== "undefined") {
      this.storage().setItem(this.key, JSON.stringify(this.current));
    }
    return this;
  }

  remove() {
    if (typeof window !== "undefined") this.storage().removeItem(this.key);
    return this;
  }

  as = {
    str: () => String(this.current ?? ""),
    int: () => Number.parseInt(String(this.current), 10),
    float: () => Number.parseFloat(String(this.current)),
    bool: () => this.current === true || this.current === "true" || this.current === 1,
    json: <R = unknown>() => this.current as unknown as R,
  };

  private storage() {
    return this.storeName === "localStorage"
      ? window.localStorage
      : window.sessionStorage;
  }
}

export class BrowserStore {
  constructor(private readonly storeName: StoreName) {}

  versioned<T>(key: string, schema: StorageSchema<T>) { return new VersionedValue(this, key, schema); }

  /** Native storage events from other documents; same-document writes do not notify. */
  watch(key: string, callback: (change: StorageChange) => void, { signal, scope }: StorageWatchOptions = {}) {
    if (typeof window === "undefined" || signal?.aborted || scope?.disposed) return () => {};
    const target = window;
    const storage = this.storage();
    // Initialize the storage area before subscribing; WebKit defers it until a read.
    storage.getItem(key);
    const listener = (event: StorageEvent) => {
      if (event.storageArea === storage && (event.key === key || event.key === null)) {
        callback({ key: event.key, oldValue: event.oldValue, newValue: event.newValue });
      }
    };
    const stop = () => { target.removeEventListener("storage", listener); signal?.removeEventListener("abort", stop); };
    target.addEventListener("storage", listener);
    signal?.addEventListener("abort", stop, { once: true });
    return scope ? scope.defer(stop) : stop;
  }

  get<T = unknown>(key: string, fallback?: T) {
    let value: T | undefined;

    if (typeof window !== "undefined") {
      try {
        const raw = this.storage().getItem(key);
        if (raw !== null) value = JSON.parse(raw) as T;
      } catch {
        value = undefined;
      }
    }

    return new StoredValue<T | undefined>(this.storeName, key, value === undefined ? fallback : value);
  }

  /** Writes immediately; storage/serialization failures propagate to the caller. */
  set<T>(key: string, value: T) {
    return new StoredValue(this.storeName, key, value).save();
  }

  remove(key: string) {
    if (typeof window !== "undefined") this.storage().removeItem(key);
    return this;
  }

  has(key: string) {
    return typeof window !== "undefined" && this.storage().getItem(key) !== null;
  }

  private storage() {
    return this.storeName === "localStorage"
      ? window.localStorage
      : window.sessionStorage;
  }
}

export const local = new BrowserStore("localStorage");
export const session = new BrowserStore("sessionStorage");

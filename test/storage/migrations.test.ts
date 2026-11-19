import { expect, it } from "bun:test";
import { BrowserStore, DisposalScope } from "../../src";

function fixture(run: (store: BrowserStore, values: Map<string, string>, window: EventTarget, storage: Storage) => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  } as Storage;
  const window = Object.assign(new EventTarget(), { localStorage: storage, sessionStorage: { ...storage } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: window });
  try { run(new BrowserStore("localStorage"), values, window, storage); }
  finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
}
const validate = (value: unknown): value is number => typeof value === "number";

it("migrates sequentially to a versioned key and preserves the previous data", () => fixture((store, values) => {
  store.set("count:v1", "2");
  const count = store.versioned("count", { version: 3, validate, fallback: () => 0, migrations: { 2: value => Number(value), 3: value => Number(value) + 1 } });
  expect(count.get()).toBe(3); expect(count.key).toBe("count:v3");
  expect(values.get("count:v1")).toBe('"2"');
  expect(values.get("count:v3")).toBe("3");
  count.set(5); expect(count.get()).toBe(5); count.remove();
  expect(store.has("count:v3")).toBe(false);
  expect(store.versioned("missing", { version: 1, validate, fallback: () => 0 }).get()).toBe(0);
}));

it("leaves old values intact when migration or validation fails", () => fixture((store) => {
  store.set("count:v1", "wrong");
  expect(() => store.versioned("count", { version: 2, validate, fallback: () => 0 }).get()).toThrow("Missing");
  expect(() => store.versioned("count", { version: 2, validate, fallback: () => 0, migrations: { 2: value => value } }).get()).toThrow("Invalid");
  expect(store.has("count:v2")).toBe(false);
  store.set("count:v2", null);
  expect(() => store.versioned("count", { version: 2, validate, fallback: () => 0 }).get()).toThrow("Invalid");
}));

it("keeps native cross-document notifications separate and releases watchers", () => fixture((store, _values, window, storage) => {
  const scope = new DisposalScope(); const seen: (string | null)[] = [];
  store.watch("count", event => seen.push(event.newValue), { scope });
  store.set("count", 1); expect(seen).toEqual([]);
  const dispatch = (key: string | null, storageArea = storage) => {
    window.dispatchEvent(Object.assign(new Event("storage"), { key, storageArea, oldValue: null, newValue: key === null ? null : "2" }));
  };
  dispatch("other"); dispatch("count", {} as Storage); expect(seen).toEqual([]);
  dispatch("count"); dispatch(null); expect(seen).toEqual(["2", null]);
  scope.dispose(); dispatch("count"); expect(seen).toHaveLength(2);
}));

import { expect, it } from "bun:test";
import { BrowserStore } from "../../src/yvee/platform/storage";

it("stores direct values, preserves null, and removes stored keys", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage } });
  try {
    const local = new BrowserStore("localStorage");
    local.set("profile", { name: "Ada" });
    expect(local.has("profile")).toBe(true);
    expect(local.get("profile").value).toEqual({ name: "Ada" });
    local.set("nullable", null);
    expect(local.get("nullable", "fallback").value).toBeNull();
    local.remove("profile");
    expect(local.has("profile")).toBe(false);
    expect(local.get("missing", false).value).toBe(false);
    values.set("broken", "{bad JSON");
    expect(local.get("broken", "fallback").value).toBe("fallback");
    storage.setItem = () => { throw new Error("quota exceeded"); };
    expect(() => local.set("full", 1)).toThrow("quota exceeded");
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

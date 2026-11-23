import { afterEach, describe, expect, it } from "bun:test";
import { BrowserStore } from "../../src/yvee/platform/storage";

interface Session { token: string }

const isSession = (value: unknown): value is Session =>
  typeof value === "object" &&
  value !== null &&
  "token" in value &&
  typeof (value as { token: unknown }).token === "string";

const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

function store(entries: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(entries));
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage, sessionStorage: storage } });
  return { local: new BrowserStore("localStorage"), values };
}

afterEach(() => {
  if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

describe("BrowserStore.get validation", () => {
  it("returns the stored value when it passes the predicate", () => {
    const { local } = store({ session: JSON.stringify({ token: "abc" }) });

    const stored = local.get("session", isSession);
    expect(stored.value).toEqual({ token: "abc" });
    expect(stored.key).toBe("session");
  });

  it("returns undefined when the stored JSON fails the predicate and keeps the key", () => {
    const { local, values } = store({ session: JSON.stringify({ token: 42 }) });

    const stored = local.get("session", isSession);
    expect(stored.value).toBeUndefined();
    expect(local.has("session")).toBe(true);
    expect(values.has("session")).toBe(true);

    stored.remove();
    expect(local.has("session")).toBe(false);
  });

  it("returns undefined for malformed JSON, absent keys and throwing predicates", () => {
    const { local } = store({ broken: "{not json", session: JSON.stringify({ token: "abc" }) });
    const explode = (_value: unknown): _value is Session => { throw new Error("boom"); };

    expect(local.get("broken", isSession).value).toBeUndefined();
    expect(local.get("missing", isSession).value).toBeUndefined();
    expect(local.get("session", explode).value).toBeUndefined();
  });

  it("keeps the fallback overload unchanged", () => {
    const { local, values } = store({ theme: JSON.stringify("dark"), nullable: "null", broken: "{bad" });

    expect(local.get("theme", "light").value).toBe("dark");
    expect(local.get("missing", "light").value).toBe("light");
    expect(local.get("nullable", "light").value).toBeNull();
    expect(local.get("broken", "light").value).toBe("light");
    expect(local.get("theme").value).toBe("dark");

    values.delete("theme");
    expect(local.get("theme", 0).value).toBe(0);
    expect(local.get("missing").value).toBeUndefined();
  });
});

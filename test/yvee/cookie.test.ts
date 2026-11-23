import { afterEach, describe, expect, it } from "bun:test";
import { readCookie } from "../../src/yvee/platform/cookie";

const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

function setCookie(cookie: string) {
  Object.defineProperty(globalThis, "document", { configurable: true, value: { cookie } });
}

afterEach(() => {
  if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

describe("readCookie", () => {
  it("reads a cookie from document.cookie", () => {
    setCookie("theme=dark; csrf_token=abc123");
    expect(readCookie("theme")).toBe("dark");
    expect(readCookie("csrf_token")).toBe("abc123");
  });

  it("decodes the value exactly once", () => {
    setCookie("next=%2Faccount%3Ftab%3D1; note=a%20b");
    expect(readCookie("next")).toBe("/account?tab=1");
    expect(readCookie("note")).toBe("a b");
  });

  it("returns undefined for an absent cookie", () => {
    setCookie("theme=dark");
    expect(readCookie("csrf_token")).toBeUndefined();
    expect(readCookie("them")).toBeUndefined();
  });

  it("returns undefined without a document", () => {
    Reflect.deleteProperty(globalThis, "document");
    expect(readCookie("theme")).toBeUndefined();
  });

  it("returns the raw value when percent-encoding is malformed", () => {
    setCookie("bad=%E0%A4%A; theme=dark");
    expect(readCookie("bad")).toBe("%E0%A4%A");
    expect(readCookie("theme")).toBe("dark");
  });

  it("matches the exact cookie name", () => {
    setCookie("xcsrf_token=wrong; csrf_token=right");
    expect(readCookie("csrf_token")).toBe("right");
  });
});

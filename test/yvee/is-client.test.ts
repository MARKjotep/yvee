import { describe, expect, it } from "bun:test";
import { checkGuards, type GuardContextInput } from "../../src/yvee/guards";
import { isClient } from "../../src/yvee/platform/env";
import { toURL } from "../../src/yvee/routing/path";

const context = (): GuardContextInput => ({
  app: {},
  page: {},
  data: {},
  params: {},
  url: toURL("/"),
  signal: new AbortController().signal,
});

describe("isClient", () => {
  it("is false when no browser window exists", () => {
    expect(typeof window).toBe("undefined");
    expect(isClient).toBe(false);
  });

  it("imports without throwing outside a browser", async () => {
    const module = await import("../../src/yvee/platform/env");
    expect(typeof module.isClient).toBe("boolean");
    expect(module.isClient).toBe(false);
  });

  it("exposes server: true on contexts evaluated without a window", async () => {
    let seen: boolean | undefined;
    await checkGuards([(ctx) => { seen = ctx.server; }], context());

    expect(seen).toBe(true);
  });

  it("honours an explicitly supplied server flag", async () => {
    let seen: boolean | undefined;
    await checkGuards([(ctx) => { seen = ctx.server; }], { ...context(), server: false });

    expect(seen).toBe(false);
  });
});

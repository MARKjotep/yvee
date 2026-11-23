import { describe, expect, it } from "bun:test";
import { Page, Yvee, route } from "../../src/yvee";
import {
  buildReturnTo,
  checkGuards,
  readReturnTo,
  type GuardContextInput,
} from "../../src/yvee/guards";
import { toURL } from "../../src/yvee/routing/path";

const context = (path: string): GuardContextInput => ({
  app: {},
  page: {},
  data: {},
  params: {},
  url: toURL(path),
  signal: new AbortController().signal,
});

describe("guard returnTo", () => {
  it("appends the rejected request URL to the redirect target", async () => {
    const decision = await checkGuards(
      [() => ({ kind: "redirect" as const, to: "/login", returnTo: true })],
      context("/account"),
    );

    expect(decision).toEqual({ kind: "redirect", to: "/login?returnTo=%2Faccount" });
  });

  it("preserves the rejected search and hash", async () => {
    const decision = await checkGuards(
      [() => ({ kind: "redirect" as const, to: "/login", returnTo: true })],
      context("/account?tab=billing#invoices"),
    );

    expect(decision).toEqual({
      kind: "redirect",
      to: `/login?returnTo=${encodeURIComponent("/account?tab=billing#invoices")}`,
    });
    if (decision.kind === "redirect") {
      expect(readReturnTo(decision.to)).toBe("/account?tab=billing#invoices");
    }
  });

  it("accepts an explicit string value and keeps the target query and hash", async () => {
    const decision = await checkGuards(
      [() => ({ kind: "redirect" as const, to: "/login?mode=signin#form", returnTo: "/account?tab=profile" })],
      context("/ignored"),
    );

    expect(decision).toEqual({
      kind: "redirect",
      to: `/login?mode=signin&returnTo=${encodeURIComponent("/account?tab=profile")}#form`,
    });
    if (decision.kind === "redirect") {
      expect(readReturnTo(decision.to)).toBe("/account?tab=profile");
    }
  });

  it("keeps bare redirects byte-for-byte when returnTo is omitted", async () => {
    const bare = { kind: "redirect" as const, to: "/login", replace: true };
    const decision = await checkGuards([() => bare], context("/account"));

    expect(decision).toBe(bare);
    expect(decision).toEqual({ kind: "redirect", to: "/login", replace: true });
  });

  it("does not append when returnTo is false", async () => {
    const bare = { kind: "redirect" as const, to: "/login", returnTo: false };
    const decision = await checkGuards([() => bare], context("/account"));

    expect(decision).toBe(bare);
  });

  it("builds and reads returnTo targets round-trip", () => {
    const target = buildReturnTo(toURL("/account?tab=billing#invoices"), "/login");
    expect(target).toBe(`/login?returnTo=${encodeURIComponent("/account?tab=billing#invoices")}`);
    expect(readReturnTo(target)).toBe("/account?tab=billing#invoices");
    expect(readReturnTo(buildReturnTo(toURL("/"), "/login"))).toBe("/");
  });

  it("appends to an existing query even when it ends with an ampersand", () => {
    expect(buildReturnTo(toURL("/account"), "/login?next=1&"))
      .toBe("/login?next=1&returnTo=%2Faccount");
  });

  it("reads returnTo from strings, URL and YveeURL", () => {
    expect(readReturnTo("/login?returnTo=%2Faccount")).toBe("/account");
    expect(readReturnTo("https://example.test/login?next=1&returnTo=%2Faccount%3Ftab%3D1")).toBe("/account?tab=1");
    expect(readReturnTo(new URL("https://example.test/login?returnTo=%2Faccount"))).toBe("/account");
    expect(readReturnTo(toURL("/login?returnTo=%2Faccount"))).toBe("/account");
  });

  it("returns undefined when no returnTo parameter exists", () => {
    expect(readReturnTo("/login")).toBeUndefined();
    expect(readReturnTo("/login?next=%2Faccount")).toBeUndefined();
    expect(readReturnTo(new URL("https://example.test/login"))).toBeUndefined();
    expect(readReturnTo(toURL("/login"))).toBeUndefined();
  });

  it("follows the annotated redirect during server rendering", async () => {
    class AccountPage extends Page {
      override body() { return "Account"; }
    }
    class LoginPage extends Page {
      override body() { return `Login returnTo=${readReturnTo(this.url) ?? "none"}`; }
    }

    const app = new Yvee({ history: false });
    app.register(route("/account")(AccountPage), route("/login")(LoginPage));
    app.use(({ url }) => url.path === "/account"
      ? { kind: "redirect" as const, to: "/login", returnTo: true }
      : { kind: "allow" as const });

    const result = await app.server().withStatus({ url: "/account?tab=1" });
    expect(result.status).toBe(200);
    expect(result.html).toContain("Login returnTo=/account?tab=1");
  });
});

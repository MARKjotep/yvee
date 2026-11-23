import { describe, expect, it } from "bun:test";
import { Page, Yvee, route, paramsGuard, allGuards, requireGuard, whenGuard } from "../../src/yvee";
import { checkGuards, type GuardContext } from "../../src/yvee/guards";
import { toURL } from "../../src/yvee/routing/path";

const context = (signal = new AbortController().signal): GuardContext => ({
  app: {}, page: {}, data: {}, params: {}, url: toURL("/"), signal, server: true,
});

describe("guard helpers", () => {
  it("short circuits composed guards on a failed condition", async () => {
    let calls = 0;
    const guard = allGuards(
      requireGuard(async () => false, { kind: "redirect", to: "/login" }),
      () => { calls++; },
    );
    expect(await guard(context())).toEqual({ kind: "redirect", to: "/login" });
    expect(calls).toBe(0);
  });

  it("skips a conditional guard when its predicate is false", async () => {
    const guard = whenGuard(() => false, () => { throw new Error("must not run"); });
    expect(await guard(context())).toEqual({ kind: "allow" });
  });

  it("checks cancellation before and after async guards", async () => {
    const controller = new AbortController();
    await expect(checkGuards([() => { controller.abort(new Error("cancelled")); }], context(controller.signal)))
      .rejects.toThrow("cancelled");
    await expect(checkGuards([() => { throw new Error("must not run"); }], context(controller.signal)))
      .rejects.toThrow("cancelled");
  });

  it("validates parameters before fetching a server page", async () => {
    let fetched = false;
    class UserPage extends Page {
      override fetch() { fetched = true; return {}; }
    }
    const app = new Yvee().register(route("/users/:id")(UserPage));
    app.use(paramsGuard({ id: (value) => /^\d+$/.test(value) }));
    const stopped = await app.server().withStatus({ url: "/users/invalid" });
    expect(stopped.status).toBe(403);
    expect(stopped.reason).toBe("guard-stop");
    expect(stopped.html).toContain('data-error="403"');
    expect(fetched).toBe(false);
    await app.server()({ url: "/users/42" });
    expect(fetched).toBe(true);
  });

  it("renders a registered 403 page for a guard stop and marks only that result", async () => {
    class GuardedPage extends Page {
      override body() { return "Guarded content"; }
    }
    class ForbiddenPage extends Page {
      override body() { return "Forbidden"; }
    }
    const app = new Yvee({ history: false });
    app.register(route("/guard/:param")(GuardedPage));
    app.error(403, ForbiddenPage);
    app.use(paramsGuard({ param: (value) => value === "ok" }));

    const stopped = await app.server().withStatus({ url: "/guard/nope" });
    expect(stopped.status).toBe(403);
    expect(stopped.reason).toBe("guard-stop");
    expect(stopped.html).toContain('data-error="403"');
    expect(stopped.html).toContain("Forbidden");
    expect(stopped.html).not.toContain("Guarded content");

    const allowed = await app.server().withStatus({ url: "/guard/ok" });
    expect(allowed.status).toBe(200);
    expect("reason" in allowed).toBe(false);
    expect(allowed.html).toContain("Guarded content");

    const explicit = await app.server().withStatus({ url: "/guard/ok", error: 403 });
    expect(explicit.status).toBe(403);
    expect("reason" in explicit).toBe(false);
    expect(explicit.html).toContain('data-error="403"');
    expect(explicit.html).toContain("Forbidden");
  });
});

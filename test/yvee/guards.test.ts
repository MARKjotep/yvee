import { describe, expect, it } from "bun:test";
import { Page, Yvee, route, paramsGuard, allGuards, requireGuard, whenGuard } from "../../src/yvee";
import { checkGuards, type GuardContext } from "../../src/yvee/guards";
import { toURL } from "../../src/yvee/routing/path";

const context = (signal = new AbortController().signal): GuardContext => ({
  app: {}, page: {}, data: {}, params: {}, url: toURL("/"), signal,
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
    await expect(app.server()({ url: "/users/invalid" })).rejects.toThrow("stopped by a guard");
    expect(fetched).toBe(false);
    await app.server()({ url: "/users/42" });
    expect(fetched).toBe(true);
  });
});

import { describe, expect, it } from "bun:test";
import { dom } from "../../src/dom/render/node.dom";
import { use } from "../../src/yvee/guards";
import { Page } from "../../src/yvee/pages/page";
import { toURL } from "../../src/yvee/routing/path";
import { RouteBook, route } from "../../src/yvee/routing/routes";
import { loadPage } from "../../src/yvee/client/load-page";
import { Yvee } from "../../src/yvee";

class ItemPage extends Page<{ label?: string }> {
  override async fetch({
    params,
    signal,
  }: {
    params: Readonly<Record<string, string>>;
    signal: AbortSignal;
  }) {
    if (signal.aborted) throw new Error("aborted");
    return { label: `Item ${params.id}` };
  }

  override head() {
    return { title: this.data.label ?? "Item", description: "A rendered item" };
  }

  override body() {
    return <h1>{this.data.label ?? "Missing label"}</h1>;
  }
}

describe("Yvee routes", () => {
  it("normalizes route paths and decodes named parameters", () => {
    const routes = new RouteBook("/portal/");
    routes.add("/items/:itemId/", ItemPage);

    const match = routes.find("/portal//items/a%20b/?view=full");

    expect(match?.entry.path).toBe("/portal/items/:itemId");
    expect(match?.params).toEqual({ itemId: "a b" });
  });

  it("rejects duplicates for the same transport", () => {
    const routes = new RouteBook();
    routes.add("/items/:itemId", ItemPage);

    expect(() => routes.add("/items/:itemId/", ItemPage)).toThrow(
      "Route already registered: /items/:itemId",
    );
  });
});

describe("Yvee guards", () => {
  it("runs global guards before decorated guards and shares an abort signal", async () => {
    const seen: string[] = [];
    const routeGuard = async (context: { signal: AbortSignal }) => {
      seen.push(`route:${context.signal.aborted}`);
      return { kind: "allow" as const };
    };

    class GuardedPage extends Page {
      override body() {
        return <h1>Guarded page</h1>;
      }
    }
    use(routeGuard)(GuardedPage);

    const app = new Yvee({ history: false });
    app.use((context) => {
      seen.push(`global:${context.signal.aborted}`);
      return { kind: "allow" };
    });
    app.register(route("/guarded")(GuardedPage));

    const render = app.server();
    const html = await render({ url: "/guarded" });

    expect(html).toContain("Guarded page");
    expect(seen).toEqual(["global:false", "route:false"]);
  });
});

describe("Yvee server rendering", () => {
  it("renders route content, fetched data, and escaped head metadata", async () => {
    const app = new Yvee({
      base: "/portal",
      history: false,
      id: "portal-root",
    });
    app.register(route("/items/:id")(ItemPage));

    const html = await app.server()({ url: "/portal/items/42" });

    expect(html).toContain('<body id="portal-root">');
    expect(html).toContain("Item 42");
    expect(html).toContain('<title data-yv="root">Item 42</title>');
    expect(html).toContain('content="A rendered item"');
  });

  it("follows guard redirects while rendering", async () => {
    class HomePage extends Page {
      override body() {
        return <h1>Home route</h1>;
      }
    }

    const app = new Yvee({ history: false });
    app.register(route("/home")(HomePage));
    app.use(({ url }) =>
      url.path === "/private"
        ? { kind: "redirect", to: "/home" }
        : { kind: "allow" },
    );

    const html = await app.server()({ url: "/private" });
    expect(html).toContain("Home route");
  });

  it("resolves a 403 result when a server guard stops it", async () => {
    class PrivatePage extends Page {
      override body() {
        return <h1>Private content</h1>;
      }
    }

    const app = new Yvee({ history: false });
    app.register(route("/private")(PrivatePage));
    app.use(() => ({ kind: "stop" }));

    const result = await app.server().withStatus({ url: "/private" });

    expect(result.status).toBe(403);
    expect(result.reason).toBe("guard-stop");
    expect(result.html).toContain('data-error="403"');
    expect(result.html).not.toContain("Private content");
  });

  it("renders a registered 500 page when a page fails", async () => {
    class BrokenPage extends Page {
      override body(): never {
        throw new Error("render failure");
      }
    }
    class ServerErrorPage extends Page {
      override body() {
        return <h1>Error {this.status}</h1>;
      }
    }

    const app = new Yvee({ history: false });
    app.register(route("/broken")(BrokenPage));
    app.error(500, ServerErrorPage);

    const html = await app.server()({ url: "/broken" });
    expect(html).toContain("Error 500");
    expect(html).not.toContain("render failure");
  });

  it("aborts page loading before fetch when the guard cancels its signal", async () => {
    let fetchCalled = false;
    class AbortPage extends Page {
      override fetch() {
        fetchCalled = true;
        return {};
      }
    }

    const routes = new RouteBook();
    routes.add("/abort", AbortPage);
    const controller = new AbortController();
    const app = {};

    await expect(
      loadPage({
        app,
        routes,
        globalGuards: [
          ({ signal }) => {
            controller.abort(new Error("superseded"));
            return { kind: "allow" };
          },
        ],
        errors: new Map(),
        url: toURL("/abort"),
        data: {},
        signal: controller.signal,
      }),
    ).rejects.toThrow("superseded");
    expect(fetchCalled).toBe(false);
  });
});

import { describe, expect, it } from "bun:test";
import { Page, route, Yvee } from "../../src/yvee";
import { dom } from "../../src/dom/render/node.dom";

@route("/")
class HomePage extends Page {
  override body() {
    return <h1>Home</h1>;
  }
}

@route("/about")
class AboutPage extends Page {
  override body() {
    return <h1>About</h1>;
  }
}

describe("Yvee render result", () => {
  it("exposes the app instance on the returned renderer", () => {
    const app = new Yvee({ history: false });
    app.register(HomePage, AboutPage);

    const renderer = app.render();

    expect(renderer.app).toBe(app);
    expect(renderer.app.listPaths()).toEqual(["/", "/about"]);
    expect(renderer.app.listRoutes().map((entry) => entry.path)).toEqual([
      "/",
      "/about",
    ]);
    expect(typeof renderer.withStatus).toBe("function");
  });

  it("keeps the default renderer callable and thenable", async () => {
    const app = new Yvee({ history: false });
    app.register(HomePage, AboutPage);

    const renderer = app.render();

    expect(typeof renderer.then).toBe("function");
    expect(typeof renderer.catch).toBe("function");
    expect(typeof renderer.finally).toBe("function");

    const html = await renderer({ url: "/" });
    expect(typeof html).toBe("string");
    expect(html).toStartWith("<!doctype html>");
    expect(html).toContain("Home");
  });
});

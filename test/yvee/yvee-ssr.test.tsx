import { describe, expect, it } from "bun:test";
import { Page, route, Yvee } from "../../src/yvee";
import { dom } from "../../src/dom/render/node.dom";

@route("/users/:id")
class ServerUserPage extends Page {
  override body() {
    return <h1>User {this.params.id}</h1>;
  }
}

describe("Yvee server rendering", () => {
  it("renders listed sample paths and concrete URLs to complete HTML documents", async () => {
    const app = new Yvee({ base: "/app", id: "export-root" });
    app.register(ServerUserPage);

    const html = await app.renderHTML(app.listPaths()[0]!, {
      data: { visitor: "Local test" },
    });
    expect(html).toStartWith("<!doctype html>");
    expect(html).toContain("User id");
    expect(html).toContain('id="export-root"');
    expect(html).toContain('"visitor":"Local test"');
    expect(await app.renderHTML(new URL("http://localhost/app/users/42")))
      .toContain("User 42");

    const controller = new AbortController();
    controller.abort();
    await expect(app.renderHTML("/app/users/42", { signal: controller.signal }))
      .rejects.toThrow();
  });

  it("renders a matched route using the app root id", async () => {
    const app = new Yvee({ base: "/app", history: false, id: "app-root" });
    app.register(ServerUserPage);

    const html = await app.server()({ url: "/app/users/42?view=full" });

    expect(html).toContain('id="app-root"');
    expect(html).toContain("User 42");
  });
});

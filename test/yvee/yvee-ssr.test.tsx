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
  it("renders a matched route using the app root id", async () => {
    const app = new Yvee({ base: "/app", history: false, id: "app-root" });
    app.register(ServerUserPage);

    const html = await app.server()({ url: "/app/users/42?view=full" });

    expect(html).toContain('id="app-root"');
    expect(html).toContain("User 42");
  });
});

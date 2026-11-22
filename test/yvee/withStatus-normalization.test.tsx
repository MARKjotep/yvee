import { describe, expect, it } from "bun:test";
import { MissingPage, Page, route, Yvee } from "../../src/yvee";
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

const render = () => {
  const app = new Yvee({ history: false });
  app.register(HomePage, AboutPage);
  app.error(404, MissingPage);
  return app.render();
};

describe("withStatus URL normalization", () => {
  it("renders the home page for empty and query-only input", async () => {
    const renderer = render();

    for (const url of ["", "?"]) {
      const { html, status } = await renderer.withStatus({ url });
      expect(status).toBe(200);
      expect(html).toContain("<h1>Home</h1>");
    }
  });

  it("treats a bare path as root-relative", async () => {
    const { html, status } = await render().withStatus({ url: "about" });

    expect(status).toBe(200);
    expect(html).toContain("<h1>About</h1>");
  });

  it("ignores the query string when selecting a page", async () => {
    const { html, status } = await render().withStatus({ url: "/?x=1" });

    expect(status).toBe(200);
    expect(html).toContain("<h1>Home</h1>");
  });

  it("strips the query string from the reported missing path", async () => {
    const { html, status } = await render().withStatus({ url: "/missing?x=1" });

    expect(status).toBe(404);
    expect(html).toContain('data-error="404"');
    expect(html).toContain("Page not found: /missing<");
  });

  it("strips the trailing slash from the reported missing path", async () => {
    const { html, status } = await render().withStatus({ url: "/missing/" });

    expect(status).toBe(404);
    expect(html).toContain("Page not found: /missing<");
  });

  it("percent-encodes markup in the reported missing path", async () => {
    const { html, status } = await render().withStatus({
      url: "/missing<script>",
    });

    expect(status).toBe(404);
    expect(html).toContain("Page not found: /missing%3Cscript%3E");
    expect(html).not.toContain("/missing<script>");
  });

  it("returns 404 without throwing for traversal-like input", async () => {
    const renderer = render();

    for (const url of ["/%252e%252e/", "/%00"]) {
      const { status } = await renderer.withStatus({ url });
      expect(status).toBe(404);
    }

    const traversal = await renderer.withStatus({ url: "/%252e%252e/" });
    expect(traversal.html).toContain("Page not found: /%252e%252e<");

    const nul = await renderer.withStatus({ url: "/%00" });
    expect(nul.html).toContain("Page not found: /%00<");
  });

  it("returns 404 without throwing for an oversized path", async () => {
    const url = `/${"a".repeat(8192)}`;
    const { html, status } = await render().withStatus({ url });

    expect(status).toBe(404);
    expect(html).toContain("Page not found: /");
  });
});

import { describe, expect, it } from "bun:test";
import { Page, route, Yvee } from "../../src/yvee";
import { resolveHeadAssets, type HeadConfig } from "../../src/yvee/rendering/head";

@route("/about")
class AboutPage extends Page {
  override body() {
    return <p>About</p>;
  }
}

const base = (...hrefs: string[]) => hrefs.map(href => ({ href }));
const linkHref = (head: HeadConfig, index = 0) => head.link?.[index]?.href;
const scriptSrc = (head: HeadConfig, index = 0) => head.script?.[index]?.src;

describe("resolveHeadAssets", () => {
  it("resolves ./ values against the root base", () => {
    const head: HeadConfig = {
      base: base("/"),
      link: [{ rel: "icon", type: "image/svg+xml", href: "./static/favicon.svg" }],
    };

    expect(linkHref(resolveHeadAssets(head))).toBe("/static/favicon.svg");
  });

  it("resolves ./ values against a subpath base", () => {
    const head: HeadConfig = {
      base: base("/notes/"),
      link: [{ rel: "icon", href: "./static/favicon.svg" }],
    };

    expect(linkHref(resolveHeadAssets(head))).toBe("/notes/static/favicon.svg");
  });

  it("resolves ../ segments with URL semantics", () => {
    const head: HeadConfig = {
      base: base("/notes/"),
      link: [{ rel: "apple-touch-icon", href: "../sibling.svg" }],
    };

    // "/notes/" + "../sibling.svg" climbs one directory, like any relative URL.
    expect(linkHref(resolveHeadAssets(head))).toBe("/sibling.svg");
  });

  it("keeps query strings and fragments", () => {
    const head: HeadConfig = {
      base: base("/notes/"),
      link: [{ rel: "preload", href: "./x.svg?v=2#shape" }],
    };

    expect(linkHref(resolveHeadAssets(head))).toBe("/notes/x.svg?v=2#shape");
  });

  it("uses the last base entry and leaves non-root bases absolute", () => {
    const head: HeadConfig = {
      base: base("/", "https://cdn.example.com/app/"),
      link: [{ rel: "icon", href: "./icon.svg" }],
    };

    expect(linkHref(resolveHeadAssets(head))).toBe("https://cdn.example.com/app/icon.svg");
  });

  it("leaves values outside the ./ and ../ rules byte-identical", () => {
    const hrefs = [
      "/favicon.ico",
      "data:image/svg+xml;base64,PHN2Zy8+",
      "https://cdn.example.com/logo.svg",
      "//cdn.example.com/logo.svg",
      "#sprite",
      "",
      "favicon.svg",
      "~plain/file.svg",
    ];
    const head: HeadConfig = {
      base: base("/notes/"),
      link: hrefs.map(href => ({ rel: "icon", href })),
      css: hrefs,
      js: hrefs,
      script: hrefs.map(src => ({ src })),
    };

    const resolved = resolveHeadAssets(head);

    expect(resolved.link?.map(entry => entry.href)).toEqual(hrefs);
    expect(resolved.css).toEqual(hrefs);
    expect(resolved.js).toEqual(hrefs);
    expect(resolved.script?.map(entry => entry.src)).toEqual(hrefs);
  });

  it("rewrites link, css, js and script sources without touching base or meta", () => {
    const head: HeadConfig = {
      base: base("/notes/"),
      meta: [{ name: "description", content: "./not-an-asset" }],
      title: "./not-an-asset",
      link: [{ rel: "icon", href: "./icon.svg" }],
      css: "./site.css",
      js: ["./app.js", "/absolute.js"],
      script: [{ type: "module", src: "../shared/entry.js" }],
    };

    const resolved = resolveHeadAssets(head);

    expect(linkHref(resolved)).toBe("/notes/icon.svg");
    expect(resolved.css).toBe("/notes/site.css");
    expect(resolved.js).toEqual(["/notes/app.js", "/absolute.js"]);
    expect(scriptSrc(resolved)).toBe("/shared/entry.js");
    expect(resolved.base).toBe(head.base);
    expect(resolved.meta).toBe(head.meta);
    expect(resolved.title).toBe("./not-an-asset");
  });

  it("reuses untouched references and never mutates the input", () => {
    const head: HeadConfig = Object.freeze({
      base: Object.freeze(base("/")),
      link: Object.freeze([{ rel: "icon", href: "/favicon.ico" }]),
      css: "/site.css",
      description: "static",
    }) as HeadConfig;
    const snapshot = JSON.stringify(head);

    const resolved = resolveHeadAssets(head);

    expect(resolved).not.toBe(head);
    expect(resolved.link).toBe(head.link);
    expect(resolved.link?.[0]).toBe(head.link?.[0]);
    expect(resolved.css).toBe(head.css);
    expect(resolved.base).toBe(head.base);
    expect(JSON.stringify(head)).toBe(snapshot);

    const rewritten = resolveHeadAssets({
      base: base("/"),
      link: [{ rel: "icon", href: "./favicon.ico" }],
    });
    expect(rewritten.link?.[0]).not.toBe(head.link?.[0]);
  });
});

describe("head asset resolution during server rendering", () => {
  it("emits root-base asset hrefs resolved against /", async () => {
    const app = new Yvee({ history: false });
    app.register(AboutPage);
    app.head({
      link: [
        { rel: "icon", type: "image/svg+xml", href: "./static/favicon.svg" },
        { rel: "apple-touch-icon", href: "../outside.svg" },
      ],
    });

    const html = await app.renderHTML("/about");

    expect(html).toContain('<base href="/" data-yv="root">');
    expect(html).toContain('href="/static/favicon.svg"');
    expect(html).toContain('href="/outside.svg"');
    expect(html).not.toContain('href="./static/favicon.svg"');
  });

  it("emits subpath-base asset hrefs resolved against the app base", async () => {
    const app = new Yvee({ base: "/notes", history: false });
    app.register(AboutPage);
    app.head({
      link: [{ rel: "icon", href: "./static/favicon.svg" }],
      css: ["./static/site.css"],
    });

    const html = await app.renderHTML("/notes/about");

    expect(html).toContain('<base href="/notes/" data-yv="root">');
    expect(html).toContain('href="/notes/static/favicon.svg"');
    expect(html).toContain('rel="stylesheet" href="/notes/static/site.css"');
  });

  it("keeps absolute, data: and remote asset values byte-identical", async () => {
    const app = new Yvee({ base: "/notes", history: false });
    app.register(AboutPage);
    app.head({
      link: [
        { rel: "icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://cdn.example.com" },
        { rel: "preload", href: "//cdn.example.com/font.woff2" },
      ],
    });

    const html = await app.renderHTML("/notes/about");

    expect(html).toContain('href="/favicon.ico"');
    expect(html).toContain('href="https://cdn.example.com"');
    expect(html).toContain('href="//cdn.example.com/font.woff2"');
  });

  it("passes data: hrefs through byte-identically in SSR", async () => {
    const app = new Yvee({ history: false });
    app.register(AboutPage);
    const href = "data:image/svg+xml;base64,PHN2Zy8+";
    app.head({ link: [{ rel: "icon", href }] });

    const html = await app.renderHTML("/about");

    expect(html).toContain(`href="${href}"`);
  });

  it("still rejects executable hrefs during SSR", async () => {
    const app = new Yvee({ history: false });
    app.register(AboutPage);
    app.head({ link: [{ rel: "icon", href: "javascript:alert(1)" }] });

    await expect(app.renderHTML("/about")).rejects.toThrow("URL scheme");
  });

  it("keeps the stricter src data: rules during SSR", async () => {
    const imageApp = new Yvee({ history: false });
    imageApp.register(AboutPage);
    imageApp.head({ js: ["data:image/png;base64,YQ=="] });
    expect(await imageApp.renderHTML("/about")).toContain('src="data:image/png;base64,YQ=="');

    const dataApp = new Yvee({ history: false });
    dataApp.register(AboutPage);
    dataApp.head({ js: ["data:text/javascript,alert(1)"] });
    await expect(dataApp.renderHTML("/about")).rejects.toThrow("URL scheme");
  });
});

import { Page, route, toURL } from "../../src/yvee";
import { loadPage } from "../../src/yvee/client/load-page";
import { NotFoundPage } from "../yvee-bun/routes/not-found";
import { describe, expect, it } from "bun:test";
import { createDemoApp } from "../yvee-bun/create-app";
import {
  createRequestData,
  handlePayloadPost,
  serializePayload,
  type PostPayloadResponse,
} from "../yvee-bun/data";
import { MetadataRoute } from "../yvee-bun/routes/metadata";
import DemoApp from "../yvee-bun/index";

describe("Yvee Bun SSR handoff demo", () => {
  it("exports the shared app entry as a server-callable HTML renderer", async () => {
    const data = createRequestData("/metadata");
    const html = await DemoApp({ url: "http://localhost/metadata", data });
    const result = await DemoApp.withStatus({
      url: "http://localhost/missing-page",
      data,
    });

    expect(html).toContain(`<body id="root">`);
    expect(html).toContain(data.ssr.requestId);
    expect(html).toContain('type="application/json" id="ssr"');
    expect(html).toContain('<script type="module" src="/client/index.js"');
    expect(result.status).toBe(404);
    expect(result.html).toContain('data-error="404"');
  });

  it("uses the decorated 404 page for missing URLs and explicit server errors", async () => {
    const app = createDemoApp();
    const render = app.server();
    for (const request of [{ url: "/missing-page" }, { url: "/features", error: 404 }]) {
      const { html, status } = await render.withStatus(request);
      expect(status).toBe(404);
      expect(html).toContain('data-error="404"');
      expect(html).toContain("<h1>Page not found</h1>");
      expect(html).toContain(`<code>${request.url}</code>`);
    }
    expect((await render.withStatus({ url: "/" })).status).toBe(200);
  });

  it("uses the 404 controller when a client page fetch reports a missing resource", async () => {
    @route("/items/:id")
    class ItemPage extends Page {
      override async fetch(): Promise<never> { throw new Response(null, { status: 404 }); }
    }
    const app = createDemoApp().register(ItemPage);
    const result = await loadPage({
      app, routes: app.routes, globalGuards: [], errors: new Map([[404, NotFoundPage]]),
      url: toURL("/items/missing"), data: {}, signal: new AbortController().signal,
    });
    expect(result).toMatchObject({ kind: "ready", status: 404, body: [{ tag: "section" }] });
  });

  it("renders request data and route metadata into server HTML", async () => {
    const data = createRequestData("/metadata");
    const app = createDemoApp();
    const html = await app.server({ id: "ssr-test", data })({
      url: "http://localhost/metadata",
      data,
    });

    expect(html).toContain("Data passed into SSR");
    expect(html).toContain(data.ssr.requestId);
    expect(html).toContain("Sample visitor");
    expect(html).toContain('property=\"og:title\"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('name="twitter:card"');
    expect(JSON.parse(serializePayload(data))).toEqual(data);
  });

  it("renders the generated artwork route with its image metadata", async () => {
    const app = createDemoApp();
    const html = await app.server({ id: "studio-test" })({
      url: "http://localhost/studio",
    });

    expect(html).toContain('class="studio-hero"');
    expect(html).toContain("greenhouse-hero.png");
    expect(html).toContain('property="og:image"');
  });

  it("accepts the browser's JSON POST and echoes the SSR request id", async () => {
    const response = await handlePayloadPost(new Request(
      "http://localhost/api/ssr-payload",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          requestId: "ssr-request-123",
          visitor: { name: "Sample visitor" },
          path: "/metadata",
        }),
      },
    ));
    const payload = await response.json() as PostPayloadResponse;

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      method: "POST",
      accepted: true,
      receivedRequestId: "ssr-request-123",
      receivedVisitor: "Sample visitor",
    });
  });

  it("posts the SSR payload when the metadata page loads in a browser", async () => {
    const page = new MetadataRoute();
    const data = createRequestData("/metadata");
    Object.assign(page.data, data);

    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    const previousFetch = globalThis.fetch;
    let sentInit: RequestInit | undefined;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    });
    globalThis.fetch = (async (_input, init) => {
      sentInit = init;
      return Response.json({
        method: "POST",
        accepted: true,
        receivedRequestId: data.ssr.requestId,
        receivedVisitor: data.ssr.visitor.name,
        serverProcessedAt: "2026-11-19T00:00:00.000Z",
      } satisfies PostPayloadResponse);
    }) as typeof fetch;

    try {
      const returned = await page.fetch({
        url: {
          path: "/metadata",
          search: "",
          hash: "",
          params: new URLSearchParams(),
        },
        params: {},
        data: page.data,
        signal: new AbortController().signal,
        resources: page.resources,
      });

      expect(sentInit?.method).toBe("POST");
      expect(JSON.parse(String(sentInit?.body))).toMatchObject({
        requestId: data.ssr.requestId,
        visitor: data.ssr.visitor,
        path: "/metadata",
      });
      expect(returned.clientPost?.receivedRequestId).toBe(data.ssr.requestId);
    } finally {
      globalThis.fetch = previousFetch;
      if (previousWindow) {
        Object.defineProperty(globalThis, "window", previousWindow);
      } else {
        delete (globalThis as { window?: unknown }).window;
      }
    }
  });
});

import { Page, route, type PageFetchContext } from "../../../src/yvee";
import type { DemoRequestData, PostPayloadResponse } from "../data";

export class MetadataRoute extends Page<DemoRequestData> {
  override head() {
    return (
      <>
        <title>SSR Data &amp; Metadata · Yvee Bun example</title>
        <meta
          name="description"
          content="Inspect rich route metadata, server-rendered request data, and a browser POST refresh."
        />
        <meta name="author" content="Yvee Bun example" />
        <meta name="keywords" content="Yvee, Bun, SSR, SPA, route data, metadata" />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#183e3a" />
        <meta name="color-scheme" content="light" />
        <meta name="application-name" content="Yvee Field Notes" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Yvee Field Notes" />
        <meta property="og:title" content="SSR Data &amp; Metadata" />
        <meta
          property="og:description"
          content="A server-rendered payload followed by a browser POST request."
        />
        <meta property="og:url" content="/metadata" />
        <meta property="og:image" content="/assets/greenhouse-hero.png" />
        <meta property="og:image:alt" content="The Yvee Field Studio greenhouse" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SSR Data &amp; Metadata" />
        <meta
          name="twitter:description"
          content="See what arrived through SSR and what the browser posts back."
        />
        <meta name="twitter:image" content="/assets/greenhouse-hero.png" />
        <link rel="canonical" href="/metadata" />
        <link rel="preload" as="image" href="/assets/greenhouse-hero.png" />
        <link rel="stylesheet" href="/styles/metadata.css" />
      </>
    );
  }

  override async fetch(context: PageFetchContext<DemoRequestData>) {
    // The server supplies the first snapshot to SSR. On the browser, request a
    // fresh echo from Bun using the exact SSR request id and visitor payload.
    if (typeof window === "undefined") return {};

    const response = await fetch("/api/ssr-payload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requestId: context.data.ssr?.requestId,
        visitor: context.data.ssr?.visitor,
        path: context.url.path,
      }),
      signal: context.signal,
    });
    if (!response.ok)
      throw new Error(`POST /api/ssr-payload failed (${response.status})`);

    const clientPost = (await response.json()) as PostPayloadResponse;
    return { clientPost };
  }

  override body() {
    return import("../views/metadata");
  }
}

route("/metadata")(MetadataRoute);

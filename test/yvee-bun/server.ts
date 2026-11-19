import { chatRoom } from "./chat/server";
import { chatPath } from "./chat/room";
import { clientDirectory, clientName } from "./client-config";
import { createRequestData, handlePayloadPost } from "./data";
import type AppEntry from "./index";

import Appy from "./client";

const port = Number(Bun.env.YVEE_BUN_PORT ?? 3847);

// Build from the current source on startup so SSR and hydration use the same runtime.
const clientBuild = await Bun.build({
  entrypoints: [`${import.meta.dir}/index.tsx`],
  outdir: `${import.meta.dir}/client`,
  target: "browser",
  format: "esm",
  splitting: true,
  naming: { entry: `${clientName}.js`, chunk: "[name]-[hash].js" },
});
if (!clientBuild.success)
  throw new AggregateError(clientBuild.logs, "Demo client build failed.");
const { default: App } = (await import(
  new URL(`./client/${clientName}.js`, import.meta.url).href
)) as { default: typeof AppEntry };
const clientAssets = new Map(
  clientBuild.outputs.map((asset) => [
    `${clientDirectory ? `/${clientDirectory}` : ""}/${asset.path.split("/").at(-1)}`,
    asset,
  ]),
);

const staticFiles = new Map([
  [
    "/styles/shared.css",
    {
      file: `${import.meta.dir}/styles/shared.css`,
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/styles/home.css",
    {
      file: `${import.meta.dir}/styles/home.css`,
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/styles/features.css",
    {
      file: `${import.meta.dir}/styles/features.css`,
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/styles/studio.css",
    {
      file: `${import.meta.dir}/styles/studio.css`,
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/styles/metadata.css",
    {
      file: `${import.meta.dir}/styles/metadata.css`,
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/assets/greenhouse-hero.png",
    {
      file: `${import.meta.dir}/public/assets/greenhouse-hero.png`,
      type: "image/png",
    },
  ],
]);

const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  websocket: chatRoom,
  async fetch(request, server) {
    const url = new URL(request.url);

    if (url.pathname === chatPath) {
      const origin = request.headers.get("origin");
      if (origin && origin !== url.origin)
        return new Response("Forbidden", { status: 403 });
      const sender = "Guest " + crypto.randomUUID().slice(0, 6);
      if (server.upgrade(request, { data: { sender } })) return;
      return new Response("WebSocket upgrade required", { status: 426 });
    }

    if (url.pathname === "/api/ssr-payload") {
      return handlePayloadPost(request);
    }

    const clientPrefix = clientDirectory ? `/${clientDirectory}/` : "/";
    const clientFilename = url.pathname.startsWith(clientPrefix)
      ? url.pathname.slice(clientPrefix.length)
      : "";
    const bundleChunk = /^[a-zA-Z0-9_-]+\.js$/.test(clientFilename)
      ? {
          file: `${import.meta.dir}/public/${clientDirectory ? `${clientDirectory}/` : ""}${clientFilename}`,
          type: "text/javascript; charset=utf-8",
        }
      : undefined;
    const compiled = clientAssets.get(url.pathname);
    if (compiled)
      return new Response(compiled, {
        headers: {
          "content-type": "text/javascript; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    const asset = staticFiles.get(url.pathname) ?? bundleChunk;

    if (asset) {
      const file = Bun.file(asset.file);
      if (!(await file.exists()))
        return new Response("Run the client build first.", { status: 404 });
      return new Response(file, { headers: { "content-type": asset.type } });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const data = createRequestData(`${url.pathname}${url.search}`);

    const { html, status } = await Appy.withStatus({
      url: request.url,
      data,
      signal: request.signal,
    });

    return new Response(html, {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
});

console.info(`Yvee Bun example: http://localhost:${server.port}`);

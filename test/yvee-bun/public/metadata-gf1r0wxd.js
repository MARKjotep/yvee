import {
  dom
} from "./index-zw79xwpr.js";

// test/yvee-bun/views/metadata.tsx
function MetadataView({ page }) {
  const ssr = page.data.ssr;
  const clientPost = page.data.clientPost;
  return /* @__PURE__ */ dom("article", {
    class: "route-card metadata-card"
  }, /* @__PURE__ */ dom("header", {
    class: "metadata-intro"
  }, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "SSR → browser POST → route data"), /* @__PURE__ */ dom("h1", null, "One request, two runtimes."), /* @__PURE__ */ dom("p", null, "This document was rendered with request data on Bun. During client route loading, the page sends that same payload back to Bun with POST and displays the response below.")), /* @__PURE__ */ dom("section", {
    class: "payload-panel",
    "aria-labelledby": "ssr-payload-title"
  }, /* @__PURE__ */ dom("div", {
    class: "panel-heading"
  }, /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "Server snapshot"), /* @__PURE__ */ dom("h2", {
    id: "ssr-payload-title"
  }, "Data passed into SSR")), /* @__PURE__ */ dom("span", {
    class: "status-pill status-pill--server"
  }, "Rendered on Bun")), /* @__PURE__ */ dom("dl", {
    class: "payload-grid"
  }, /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Request id"), /* @__PURE__ */ dom("dd", null, ssr?.requestId ?? "No SSR payload")), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Requested path"), /* @__PURE__ */ dom("dd", null, ssr?.path ?? page.path)), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Visitor"), /* @__PURE__ */ dom("dd", null, ssr?.visitor?.name ?? "Unknown")), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Plan"), /* @__PURE__ */ dom("dd", null, ssr?.visitor?.plan ?? "—")), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Rendered at"), /* @__PURE__ */ dom("dd", null, ssr?.renderedAt ?? "—")), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Feature flags"), /* @__PURE__ */ dom("dd", null, ssr?.featureFlags?.join(", ") ?? "—")))), /* @__PURE__ */ dom("section", {
    class: "payload-panel payload-panel--client",
    "aria-labelledby": "post-response-title"
  }, /* @__PURE__ */ dom("div", {
    class: "panel-heading"
  }, /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "Browser request"), /* @__PURE__ */ dom("h2", {
    id: "post-response-title"
  }, "POST response")), /* @__PURE__ */ dom("span", {
    class: `status-pill ${clientPost ? "status-pill--ok" : "status-pill--waiting"}`
  }, clientPost ? "POST received" : "Waiting for client")), clientPost ? /* @__PURE__ */ dom("dl", {
    class: "payload-grid"
  }, /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "HTTP method"), /* @__PURE__ */ dom("dd", null, clientPost.method)), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Accepted"), /* @__PURE__ */ dom("dd", null, clientPost.accepted ? "Yes" : "No")), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Echoed request id"), /* @__PURE__ */ dom("dd", null, clientPost.receivedRequestId)), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Visitor received"), /* @__PURE__ */ dom("dd", null, clientPost.receivedVisitor)), /* @__PURE__ */ dom("div", null, /* @__PURE__ */ dom("dt", null, "Processed at"), /* @__PURE__ */ dom("dd", null, clientPost.serverProcessedAt))) : /* @__PURE__ */ dom("p", {
    class: "waiting-copy"
  }, "The server-rendered snapshot is already visible. Hydration starts the browser fetch, which POSTs that snapshot to ", /* @__PURE__ */ dom("code", null, "/api/ssr-payload"), ".")), /* @__PURE__ */ dom("section", {
    class: "metadata-checklist",
    "aria-labelledby": "metadata-list-title"
  }, /* @__PURE__ */ dom("p", {
    class: "eyebrow"
  }, "Head inspection"), /* @__PURE__ */ dom("h2", {
    id: "metadata-list-title"
  }, "Metadata on this route"), /* @__PURE__ */ dom("p", null, "Open DevTools and inspect the document head: description, author, keywords, robots, theme color, Open Graph, Twitter card, canonical link, image preload, and JSON-LD all come from this route."), /* @__PURE__ */ dom("a", {
    class: "route-link",
    href: "/studio"
  }, "See the generated studio hero")));
}
export {
  MetadataView as default
};

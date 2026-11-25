import type { Page } from "../../../src/yvee";
import type { DemoRequestData } from "../data";

export default function MetadataView({ page }: { page: Page<DemoRequestData> }) {
  const ssr = page.data.ssr;
  const clientPost = page.data.clientPost;

  return (
    <article class="route-card metadata-card">
      <header class="metadata-intro">
        <p class="eyebrow">SSR → browser POST → route data</p>
        <h1>One request, two runtimes.</h1>
        <p>
          This document was rendered with request data on Bun. During client
          route loading, the page sends that same payload back to Bun with POST
          and displays the response below.
        </p>
      </header>

      <section class="payload-panel" aria-labelledby="ssr-payload-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Server snapshot</p>
            <h2 id="ssr-payload-title">Data passed into SSR</h2>
          </div>
          <span class="status-pill status-pill--server">Rendered on Bun</span>
        </div>
        <dl class="payload-grid">
          <div><dt>Request id</dt><dd>{ssr?.requestId ?? "No SSR payload"}</dd></div>
          <div><dt>Requested path</dt><dd>{ssr?.path ?? page.path}</dd></div>
          <div><dt>Visitor</dt><dd>{ssr?.visitor?.name ?? "Unknown"}</dd></div>
          <div><dt>Plan</dt><dd>{ssr?.visitor?.plan ?? "—"}</dd></div>
          <div><dt>Rendered at</dt><dd>{ssr?.renderedAt ?? "—"}</dd></div>
          <div><dt>Feature flags</dt><dd>{ssr?.featureFlags?.join(", ") ?? "—"}</dd></div>
        </dl>
      </section>

      <section class="payload-panel payload-panel--client" aria-labelledby="post-response-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Browser request</p>
            <h2 id="post-response-title">POST response</h2>
          </div>
          <span class={`status-pill ${clientPost ? "status-pill--ok" : "status-pill--waiting"}`}>
            {clientPost ? "POST received" : "Waiting for client"}
          </span>
        </div>
        {clientPost ? (
          <dl class="payload-grid">
            <div><dt>HTTP method</dt><dd>{clientPost.method}</dd></div>
            <div><dt>Accepted</dt><dd>{clientPost.accepted ? "Yes" : "No"}</dd></div>
            <div><dt>Echoed request id</dt><dd>{clientPost.receivedRequestId}</dd></div>
            <div><dt>Visitor received</dt><dd>{clientPost.receivedVisitor}</dd></div>
            <div><dt>Processed at</dt><dd>{clientPost.serverProcessedAt}</dd></div>
          </dl>
        ) : (
          <p class="waiting-copy">
            The server-rendered snapshot is already visible. Hydration starts the
            browser fetch, which POSTs that snapshot to <code>/api/ssr-payload</code>.
          </p>
        )}
      </section>

      <section class="metadata-checklist" aria-labelledby="metadata-list-title">
        <p class="eyebrow">Head inspection</p>
        <h2 id="metadata-list-title">Metadata on this route</h2>
        <p>
          Open DevTools and inspect the document head: description, author,
          keywords, robots, theme color, Open Graph, Twitter card, canonical
          link, image preload, and JSON-LD all come from this route.
        </p>
        <a class="route-link" href="/studio">See the generated studio hero</a>
      </section>
    </article>
  );
}

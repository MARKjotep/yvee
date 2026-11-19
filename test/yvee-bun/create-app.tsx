import { chatPopup, ChatSocket } from "./chat/popup";
import { NotFoundPage } from "./routes/not-found";
import { Yvee } from "../../src/yvee";
import { dom } from "../../src/dom/render/node.dom";
import { client } from "./client-config";
import { FeaturesRoute } from "./routes/features";
import { AsyncDOMRoute } from "./routes/async-dom";
import { HomeRoute } from "./routes/home";
import { MetadataRoute } from "./routes/metadata";
import { StudioRoute } from "./routes/studio";

export function createDemoApp() {
  const app = new Yvee({
    history: true,
    id: "root",
    client,
  });

  app.head({ css: "/styles/shared.css" });

  app.register(
    HomeRoute,
    FeaturesRoute,
    StudioRoute,
    MetadataRoute,
    AsyncDOMRoute,
    NotFoundPage,
    ChatSocket,
  );

  app.Main((content) => (
    <main class="app-shell">
      <nav class="site-nav" aria-label="Main navigation">
        <a class="site-brand" href="/">
          Yvee / Bun
        </a>
        <div class="site-nav__links">
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/studio">Studio</a>
          <a href="/metadata">SSR data</a>
          <a href="/async-dom">Async DOM</a>
          <a href="/missing-page">404 demo</a>
        </div>
      </nav>
      {chatPopup(app.socket)}
      {content}
    </main>
  ));

  return app;
}

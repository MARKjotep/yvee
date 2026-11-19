import { dom } from "../../../src/dom/render/node.dom";

export default function HomeView() {
  return (
    <section class="route-card home-card">
      <p class="eyebrow">Bun server · Yvee client</p>
      <h1>Home route</h1>
      <p>
        This page view lives in its own TSX module. Its route imports this view
        and its stylesheet URL.
      </p>
      <a class="route-link" href="/features">Open the features route</a>
    </section>
  );
}

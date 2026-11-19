import { dom } from "../../../src/dom/render/node.dom";

async function AsyncResult() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return <p class="async-result">The async custom DOM component resolved.</p>;
}

export default function AsyncDOMView() {
  return (
    <section class="route-card">
      <p class="eyebrow">Async custom DOM component</p>
      <h1>Async DOM route</h1>
      <p>
        This child is an async function that returns a DOM node. Yvee waits for
        it during both server rendering and client navigation.
      </p>
      <div class="async-result-panel" aria-live="polite">
        <AsyncResult></AsyncResult>
      </div>
    </section>
  );
}

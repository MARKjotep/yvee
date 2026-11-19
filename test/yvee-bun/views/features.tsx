import type { FeaturesRoute } from "../routes/features";
import { dom, frag } from "../../../src/dom/render/node.dom";

export const head = ({ page }: { page: FeaturesRoute }) => (
  <>
    <title>{page.title}</title>
    <meta name="description" content={page.description} />
    <link rel="stylesheet" href="/styles/features.css" />
  </>
);

export default function FeaturesView({ page }: { page: FeaturesRoute }) {
  const { ctr, title, description } = page;
  return (
    <section class="route-card features-card">
      <p class="eyebrow">Route-specific stylesheet</p>
      <h1>Features route</h1>
      <p>
        The page imported this view and its stylesheet URL. Yvee should remove
        the home link and attach this route's CSS link.
      </p>
      <a class="route-link" href="/">
        Return home
      </a>
      <button
        on={{
          click() {
            ctr.value++;
            title.value = `Features · ${ctr.value} interactions`;
            description.value = `The head description updated with ${ctr.value} interaction${ctr.value === 1 ? "" : "s"}.`;
          },
        }}
      >
        {ctr}k
      </button>
    </section>
  );
}

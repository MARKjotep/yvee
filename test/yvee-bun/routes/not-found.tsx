import { dom, frag } from "@/dom/render/node.dom";
import { Page, error } from "@/yvee";

@error(404)
export class NotFoundPage extends Page {
  override head() {
    return (
      <>
        <title>Page not found · Yvee</title>
      </>
    );
  }

  override body() {
    return (
      <section class="route-card home-card">
        <p class="eyebrow">Error {this.status}</p>
        <h1>Page not found</h1>
        <p>
          We couldn’t find a page at <code>{this.path}</code>.
        </p>
        <a href="/">Return home</a>
      </section>
    );
  }
}

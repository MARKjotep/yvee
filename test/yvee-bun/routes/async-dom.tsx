import { Page, route } from "../../../src/yvee";
import { dom, frag } from "../../../src/dom/render/node.dom";

export class AsyncDOMRoute extends Page {
  override head() {
    return (
      <>
        <title>Async DOM · Yvee Bun example</title>
        <meta
          name="description"
          content="An asynchronous custom DOM component rendered with Yvee."
        />
      </>
    );
  }

  override body() {
    return import("../views/async-dom");
  }
}

route("/async-dom")(AsyncDOMRoute);

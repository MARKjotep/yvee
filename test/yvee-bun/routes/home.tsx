import { Page, route } from "../../../src/yvee";
import { dom, frag } from "../../../src/dom/render/node.dom";

export class HomeRoute extends Page {
  override head() {
    return (
      <>
        <title>Home · Yvee Bun example</title>
        <meta name="description" content="Yvee server rendering and client navigation with Bun." />
        <link rel="stylesheet" href="/styles/home.css" />
      </>
    );
  }

  override body() {
    return import("../views/home");
  }
}

route("/")(HomeRoute);

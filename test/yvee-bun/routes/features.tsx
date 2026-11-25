import { State } from "../../../src/core/core.core";
import { Page, route } from "../../../src/yvee";

export class FeaturesRoute extends Page {
  title = State("Features · Yvee Bun example");
  description = State("A second route with reactive browser head state.");
  ctr = State(0);
  override head() {
    return (
      <>
        <meta name="generator" content="Yvee Bun example" />
      </>
    );
  }

  override body() {
    return import("../views/features");
  }
}

route("/features")(FeaturesRoute);

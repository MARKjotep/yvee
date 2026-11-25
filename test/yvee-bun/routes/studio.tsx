import { Page, route } from "../../../src/yvee";

@route("/studio")
export class StudioRoute extends Page {
  override head() {
    return (
      <>
        <title>Field Studio · Yvee Bun example</title>
        <meta
          name="description"
          content="A visual route with a generated greenhouse hero and layered sections."
        />
        <link rel="stylesheet" href="/styles/studio.css" />
        <link rel="preload" as="image" href="/assets/greenhouse-hero.png" />
      </>
    );
  }

  override body() {
    return import("../views/studio");
  }
}

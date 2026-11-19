import { describe, expect, it } from "bun:test";
import { Page, route } from "../../src/yvee";
import { RouteBook, routeMetadata } from "../../src/yvee/routing/routes";

@route("/")
class HomePage extends Page {}
@route("/about")
class AboutPage extends Page {}
@route("/contact")
class ContactPage extends Page {}
@route("/features")
class FeaturesPage extends Page {}

const routes = [HomePage, AboutPage, ContactPage, FeaturesPage];

describe("Yvee route setup", () => {
  it("registers the pages used by the browser example", () => {
    const book = new RouteBook();
    for (const controller of routes) {
      for (const metadata of routeMetadata(controller)) {
        book.add(metadata.path, controller, metadata.transport);
      }
    }

    expect(book.all().map(({ path }) => path)).toEqual([
      "/", "/about", "/contact", "/features",
    ]);
  });
});


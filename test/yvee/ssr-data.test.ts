import { afterEach, describe, expect, it } from "bun:test";
import { Page, route, Yvee } from "../../src/yvee";
import {
  finishHydrationPass,
  startHydrationPass,
  type HydrationPass,
} from "../../src/yvee/pages/page";

type Payload = { user: string };

const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const previousLocation = Object.getOwnPropertyDescriptor(globalThis, "location");

@route("/ssr-data")
class SsrDataPage extends Page<Payload> {
  static seen: Array<Payload | undefined> = [];

  override body() {
    SsrDataPage.seen.push(this.ssrData<Payload>());
    return `data:${this.data.user}`;
  }
}

@route("/hydrate-data")
class HydrateDataPage extends Page<Payload> {
  static instance: HydrateDataPage | undefined;
  static seen: Array<Payload | undefined> = [];

  constructor() {
    super();
    HydrateDataPage.instance = this;
  }

  override body() {
    HydrateDataPage.seen.push(this.ssrData<Payload>());
    HydrateDataPage.seen.push(this.ssrData<Payload>());
    return `data:${this.data.user}`;
  }
}

function installDocument(payload?: Payload) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      title: "",
      body: { id: "", dataset: {} as Record<string, string | undefined> },
      addEventListener: () => {},
      removeEventListener: () => {},
      getElementById: (id: string) =>
        id === "ssr" && payload
          ? { textContent: JSON.stringify(payload) }
          : null,
    },
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      protocol: "http:",
      href: "http://localhost/hydrate-data",
      origin: "http://localhost",
    },
  });
}

function restoreGlobals() {
  if (previousDocument) {
    Object.defineProperty(globalThis, "document", previousDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (previousLocation) {
    Object.defineProperty(globalThis, "location", previousLocation);
  } else {
    Reflect.deleteProperty(globalThis, "location");
  }
}

afterEach(restoreGlobals);

describe("page.ssrData during SSR", () => {
  it("returns the seeded data on every render", async () => {
    SsrDataPage.seen = [];
    const app = new Yvee({ history: false });
    app.register(SsrDataPage);
    const renderer = app.render();

    const first = await renderer({ url: "/ssr-data", data: { user: "ada" } });
    const second = await renderer({ url: "/ssr-data", data: { user: "ada" } });

    expect(first).toContain("ada");
    expect(second).toContain("ada");
    expect(SsrDataPage.seen).toEqual([{ user: "ada" }, { user: "ada" }]);
    expect(typeof document).toBe("undefined");
  });
});

describe("page.ssrData during browser hydration", () => {
  let pass: HydrationPass | undefined;

  afterEach(() => {
    if (pass) finishHydrationPass(pass);
    pass = undefined;
  });

  it("returns the payload once and leaves page.data unchanged", () => {
    installDocument();
    pass = startHydrationPass();

    const page = new HydrateDataPage();
    page.data = { user: "ada" };

    expect(page.ssrData<Payload>()).toEqual({ user: "ada" });
    expect(page.ssrData<Payload>()).toBeUndefined();
    expect(page.data).toEqual({ user: "ada" });
  });

  it("returns undefined for a page constructed outside the hydration window", () => {
    installDocument();
    const early = new HydrateDataPage();
    early.data = { user: "ada" };

    pass = startHydrationPass();
    expect(early.ssrData<Payload>()).toBeUndefined();
  });

  it("returns undefined once the hydration window closes", () => {
    installDocument();
    pass = startHydrationPass();
    const page = new HydrateDataPage();
    page.data = { user: "ada" };

    finishHydrationPass(pass);
    pass = undefined;

    expect(page.ssrData<Payload>()).toBeUndefined();
  });

  it("returns undefined on a page after client-side navigation", () => {
    installDocument();
    pass = startHydrationPass();
    const hydrated = new HydrateDataPage();
    hydrated.data = { user: "ada" };
    expect(hydrated.ssrData<Payload>()).toEqual({ user: "ada" });

    finishHydrationPass(pass);
    pass = undefined;

    // A navigation constructs a fresh page with no SSR payload for this URL.
    const navigated = new HydrateDataPage();
    navigated.data = { user: "grace" };
    expect(navigated.ssrData<Payload>()).toBeUndefined();
    expect(navigated.data).toEqual({ user: "grace" });
  });

  it("opens the hydration window for the initial app.render() in a browser", async () => {
    installDocument({ user: "ada" });
    HydrateDataPage.seen = [];
    HydrateDataPage.instance = undefined;

    const app = new Yvee({ id: "app", history: false });
    app.onError = () => {};
    app.register(HydrateDataPage);

    const renderer = app.render();
    // The mount has no real DOM to finish in, but the initial page and its
    // body have already run when the mount settles (successfully or not).
    await renderer.catch(() => {});
    await Promise.resolve();

    expect(HydrateDataPage.seen).toEqual([{ user: "ada" }, undefined]);
    const hydratedPage = HydrateDataPage.instance as HydrateDataPage | undefined;
    expect(hydratedPage?.data).toEqual({ user: "ada" });
    expect(hydratedPage?.ssrData<Payload>()).toBeUndefined();
  });
});

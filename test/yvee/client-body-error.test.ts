import { afterEach, describe, expect, it } from "bun:test";
import { State } from "../../src/core/core.core";
import type { PageLoad } from "../../src/yvee/client/load-page";
import { YveeClient } from "../../src/yvee/client/runtime";
import { toURL, type YveeURL } from "../../src/yvee/routing/path";

type Load = (url: YveeURL, signal: AbortSignal, error?: number) => Promise<PageLoad>;
type Body = { dataset: Record<string, string | undefined> };

const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

function installBody(error?: string): Body {
  const body: Body = { dataset: {} };
  if (error !== undefined) body.dataset.error = error;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { body },
  });
  return body;
}

function createClient(load: Load) {
  return new YveeClient({
    id: "app",
    base: "/",
    useHistory: false,
    url: State(toURL("/")),
    root: State<unknown[]>([]),
    load,
    getHead: () => ({}),
    getLayout: () => undefined,
    onLoading: () => {},
    onUnmount: () => {},
  });
}

function resolveInitialPage(client: YveeClient, path = "/") {
  return (client as unknown as {
    resolveInitialPage(url: YveeURL): Promise<PageLoad>;
  }).resolveInitialPage(toURL(path));
}

function ready(status: number, path = "/"): PageLoad {
  return { kind: "ready", status, body: [], head: {}, url: toURL(path) };
}

afterEach(() => {
  if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

describe("initial mount body error marker", () => {
  it("keeps the SSR marker for a hydrated error page", async () => {
    const body = installBody("403");
    let hint: number | undefined;
    const client = createClient((_url, _signal, error) => {
      hint = error;
      return Promise.resolve(ready(403));
    });

    const result = await resolveInitialPage(client);

    expect(result.kind).toBe("ready");
    expect(hint).toBe(403);
    expect(body.dataset.error).toBe("403");
  });

  it("reconciles the marker to the resolved error status", async () => {
    const body = installBody("403");
    const client = createClient(() => Promise.resolve(ready(404)));

    await resolveInitialPage(client);

    expect(body.dataset.error).toBe("404");
  });

  it("removes the marker for a hydrated success page", async () => {
    const body = installBody("403");
    const client = createClient(() => Promise.resolve(ready(200)));

    await resolveInitialPage(client);

    expect(Object.hasOwn(body.dataset, "error")).toBe(false);
  });

  it("leaves a normal 200 page without a marker", async () => {
    const body = installBody();
    const client = createClient(() => Promise.resolve(ready(200)));

    const result = await resolveInitialPage(client);

    expect(result.kind).toBe("ready");
    expect(Object.hasOwn(body.dataset, "error")).toBe(false);
  });

  it("keeps the SSR marker when the initial load stops", async () => {
    const body = installBody("403");
    const client = createClient(() => Promise.resolve({ kind: "stop" }));

    const result = await resolveInitialPage(client);

    expect(result.kind).toBe("stop");
    expect(body.dataset.error).toBe("403");
  });

  it("does not invent a marker when a stopped load had none", async () => {
    const body = installBody();
    const client = createClient(() => Promise.resolve({ kind: "stop" }));

    await resolveInitialPage(client);

    expect(Object.hasOwn(body.dataset, "error")).toBe(false);
  });

  it("restores the SSR marker when the initial load throws", async () => {
    const body = installBody("403");
    const client = createClient(() => Promise.reject(new Error("load failed")));

    await expect(resolveInitialPage(client)).rejects.toThrow("load failed");
    expect(body.dataset.error).toBe("403");
  });

  it("removes the marker after a redirect resolves a success page", async () => {
    const body = installBody("404");
    const client = createClient((url) =>
      Promise.resolve(
        url.path === "/"
          ? { kind: "redirect" as const, to: "/home" }
          : ready(200, "/home"),
      ));

    await resolveInitialPage(client);

    expect(Object.hasOwn(body.dataset, "error")).toBe(false);
  });
});

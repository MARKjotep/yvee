import { afterEach, describe, expect, it } from "bun:test";
import { requestJSON } from "../../src/yvee/platform/request";

const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

function installDocument(options: { cookie?: string; meta?: string } = {}) {
  const { cookie = "", meta } = options;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      cookie,
      querySelector(selector: string) {
        return selector === 'meta[name="csrf-token"]' && meta !== undefined
          ? { getAttribute: (name: string) => (name === "content" ? meta : null) }
          : null;
      },
    },
  });
}

function json(value: unknown, status = 200, statusText = ""): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText,
    headers: { "content-type": "application/json" },
  });
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

interface Recorded {
  input: RequestInfo | URL;
  init?: RequestInit | undefined;
}

function recorder(handler: (record: Recorded) => Response) {
  const calls: Recorded[] = [];
  const transport = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const record = { input, init };
    calls.push(record);
    return handler(record);
  }) as typeof globalThis.fetch;
  return { calls, transport };
}

afterEach(() => {
  if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

describe("requestJSON csrf", () => {
  it("attaches the cookie token to the header and JSON body", async () => {
    installDocument({ cookie: "theme=dark; csrf_token=abc%20123" });
    const { calls, transport } = recorder(() => json({ ok: true }));

    const result = await requestJSON("/api", {
      method: "POST",
      body: JSON.stringify({ title: "Draft" }),
      validate: isObject,
      csrf: true,
      fetch: transport,
    });

    expect(result).toEqual({ ok: true });
    const init = calls[0]?.init;
    const headers = new Headers(init?.headers);
    expect(headers.get("x-csrf-token")).toBe("abc 123");
    expect(headers.get("content-type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual({ title: "Draft", csrfToken: "abc 123" });
  });

  it("reads the cookie when the document stub has no meta lookup", async () => {
    Object.defineProperty(globalThis, "document", { configurable: true, value: { cookie: "csrf_token=stub" } });
    const { calls, transport } = recorder(() => json({ ok: true }));

    await requestJSON("/api", { method: "POST", body: "{}", validate: isObject, csrf: true, fetch: transport });

    expect(new Headers(calls[0]?.init?.headers).get("x-csrf-token")).toBe("stub");
  });

  it("prefers the cookie over the meta tag", async () => {
    installDocument({ cookie: "csrf_token=cookie", meta: "meta" });
    const { calls, transport } = recorder(() => json({ ok: true }));

    await requestJSON("/api", { method: "POST", body: "{}", validate: isObject, csrf: true, fetch: transport });

    expect(new Headers(calls[0]?.init?.headers).get("x-csrf-token")).toBe("cookie");
  });

  it("reads the meta tag when the cookie is absent", async () => {
    installDocument({ meta: "meta-token" });
    const { calls, transport } = recorder(() => json({ ok: true }));

    await requestJSON("/api", { method: "POST", body: "{}", validate: isObject, csrf: true, fetch: transport });

    expect(new Headers(calls[0]?.init?.headers).get("x-csrf-token")).toBe("meta-token");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ csrfToken: "meta-token" });
  });

  it("honors custom header and field names", async () => {
    installDocument({ cookie: "csrf_token=abc" });
    const { calls, transport } = recorder(() => json({ ok: true }));

    await requestJSON("/api", {
      method: "POST",
      body: JSON.stringify({ title: "x" }),
      validate: isObject,
      csrf: { header: "x-xsrf-token", field: "_token" },
      fetch: transport,
    });

    const headers = new Headers(calls[0]?.init?.headers);
    expect(headers.get("x-xsrf-token")).toBe("abc");
    expect(headers.get("x-csrf-token")).toBeNull();
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ title: "x", _token: "abc" });
  });

  it("keeps an existing body field", async () => {
    installDocument({ cookie: "csrf_token=cookie" });
    const { calls, transport } = recorder(() => json({ ok: true }));

    await requestJSON("/api", {
      method: "POST",
      body: JSON.stringify({ csrfToken: "caller", title: "x" }),
      validate: isObject,
      csrf: true,
      fetch: transport,
    });

    expect(new Headers(calls[0]?.init?.headers).get("x-csrf-token")).toBe("cookie");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ csrfToken: "caller", title: "x" });
  });

  it("mints once from the endpoint and caches the token", async () => {
    installDocument();
    const { calls, transport } = recorder(({ input }) =>
      String(input) === "/mint-once" ? json({ csrfToken: "minted" }) : json({ ok: true }));

    await requestJSON("/first", { method: "POST", body: "{}", validate: isObject, csrf: { endpoint: "/mint-once" }, fetch: transport });
    await requestJSON("/second", { method: "POST", body: "{}", validate: isObject, csrf: { endpoint: "/mint-once" }, fetch: transport });

    const mints = calls.filter((call) => String(call.input) === "/mint-once");
    expect(mints).toHaveLength(1);
    expect(mints[0]?.init?.method).toBe("GET");
    expect(new Headers(calls[1]?.init?.headers).get("x-csrf-token")).toBe("minted");
    expect(new Headers(calls[2]?.init?.headers).get("x-csrf-token")).toBe("minted");
  });

  it("accepts `token` from the mint response and defaults the endpoint to /csrf", async () => {
    installDocument();
    const { calls, transport } = recorder(({ input }) =>
      String(input) === "/csrf" ? json({ token: "default-minted" }) : json({ ok: true }));

    await requestJSON("/api", { method: "POST", body: "{}", validate: isObject, csrf: true, fetch: transport });

    expect(calls[0]?.input).toBe("/csrf");
    expect(new Headers(calls[1]?.init?.headers).get("x-csrf-token")).toBe("default-minted");
  });

  it("rejects before sending when no token source is available", async () => {
    installDocument();
    const { calls, transport } = recorder(() => json({ ok: true }));

    await expect(requestJSON("/api", {
      method: "POST",
      body: "{}",
      validate: isObject,
      csrf: { endpoint: false },
      fetch: transport,
    })).rejects.toThrow(TypeError);
    expect(calls).toHaveLength(0);
  });

  it("rejects before sending on the server when minting is disabled", async () => {
    Reflect.deleteProperty(globalThis, "document");
    const { calls, transport } = recorder(() => json({ ok: true }));

    await expect(requestJSON("/api", {
      method: "POST",
      body: "{}",
      validate: isObject,
      csrf: { endpoint: false },
      fetch: transport,
    })).rejects.toThrow(/CSRF token/);
    expect(calls).toHaveLength(0);
  });

  it("mints on the server from an explicit endpoint", async () => {
    Reflect.deleteProperty(globalThis, "document");
    const { calls, transport } = recorder(({ input }) =>
      String(input) === "https://example.test/csrf" ? json({ csrfToken: "server" }) : json({ ok: true }));

    await requestJSON("/api", {
      method: "POST",
      body: "{}",
      validate: isObject,
      csrf: { endpoint: "https://example.test/csrf" },
      fetch: transport,
    });

    expect(new Headers(calls[1]?.init?.headers).get("x-csrf-token")).toBe("server");
  });

  it("leaves non-CSRF requests untouched", async () => {
    installDocument({ cookie: "csrf_token=abc" });
    const { calls, transport } = recorder(() => json({ ok: true }));

    await requestJSON("/api", { method: "POST", body: JSON.stringify({ a: 1 }), validate: isObject, fetch: transport });

    const headers = new Headers(calls[0]?.init?.headers);
    expect(headers.get("x-csrf-token")).toBeNull();
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ a: 1 }));
  });
});

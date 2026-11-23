import { describe, expect, it } from "bun:test";
import { requestForm } from "../../src/yvee/platform/request";

function json(value: unknown, status = 200, statusText = ""): Response {
  return new Response(JSON.stringify(value), {
    status,
    statusText,
    headers: { "content-type": "application/json" },
  });
}

describe("requestForm", () => {
  it("returns the parsed JSON body on success", async () => {
    let body: BodyInit | null | undefined;
    const fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      body = init?.body;
      return json({ id: 7 }, 201, "Created");
    }) as unknown as typeof globalThis.fetch;

    const result = await requestForm<{ id: number }>("/items", { data: { title: "New" }, fetch });

    expect(result).toEqual({ ok: true, status: 201, data: { id: 7 } });
    expect(JSON.parse(String(body))).toEqual({ title: "New" });
  });

  it("reports an HTTP error body message", async () => {
    const fetch = (async () => json({ error: "Title is required" }, 400, "Bad Request")) as unknown as typeof globalThis.fetch;

    const result = await requestForm("/items", { data: {}, fetch });

    expect(result).toEqual({ ok: false, status: 400, error: "Title is required" });
  });

  it("reports network failures with status 0", async () => {
    const fetch = (async () => { throw new TypeError("connection refused"); }) as unknown as typeof globalThis.fetch;

    const result = await requestForm("/items", { data: {}, fetch });

    expect(result).toEqual({ ok: false, status: 0, error: "connection refused" });
  });

  it("passes a FormData body through unchanged", async () => {
    const form = new FormData();
    form.set("title", "New");
    let seen: BodyInit | null | undefined;
    let contentType: string | null = "unset";
    const fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      seen = init?.body;
      contentType = new Headers(init?.headers).get("content-type");
      return json({ ok: true });
    }) as unknown as typeof globalThis.fetch;

    const result = await requestForm("/items", { body: form, fetch });

    expect(result.ok).toBe(true);
    expect(seen).toBe(form);
    expect(contentType).toBeNull();
  });

  it("does not throw when the payload fails validation", async () => {
    const fetch = (async () => json({ id: "nope" })) as unknown as typeof globalThis.fetch;

    const result = await requestForm<{ id: number }>("/items", {
      data: {},
      fetch,
      validate: (value): value is { id: number } =>
        typeof value === "object" && value !== null && typeof (value as { id?: unknown }).id === "number",
    });

    expect(result).toEqual({ ok: false, status: 200, error: "Response JSON failed validation." });
  });

  it("does not throw when the payload cannot be serialized", async () => {
    const data: Record<string, unknown> = {};
    data.self = data;
    const result = await requestForm("/items", { data });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(typeof result.error).toBe("string");
  });

  it("treats a 204 response as a success without data", async () => {
    const fetch = (async () => new Response(null, { status: 204 })) as unknown as typeof globalThis.fetch;

    const result = await requestForm("/items/1", { method: "DELETE", fetch });

    expect(result).toEqual({ ok: true, status: 204, data: undefined });
  });

  it("forwards CSRF options", async () => {
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", { configurable: true, value: { cookie: "csrf_token=form-token" } });
    const seen: { header: string | null } = { header: null };
    const fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      seen.header = new Headers(init?.headers).get("x-csrf-token");
      return json({ ok: true });
    }) as unknown as typeof globalThis.fetch;
    try {
      await requestForm("/items", { data: {}, csrf: true, fetch });
      expect(seen.header).toBe("form-token");
    } finally {
      if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
      else Reflect.deleteProperty(globalThis, "document");
    }
  });
});

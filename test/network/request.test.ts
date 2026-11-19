import { expect, it } from "bun:test";
import { requestJSON, HTTPError } from "../../src";

const validate = (value: unknown): value is { count: number } =>
  typeof value === "object" && value !== null && "count" in value && typeof value.count === "number";
const transport = (handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => handler as typeof fetch;

it("forwards request options and validates parsed JSON", async () => {
  const abort = new AbortController();
  const result = await requestJSON("https://example.test", {
    validate, signal: abort.signal, headers: { accept: "application/json" },
    fetch: transport(async (_input, init) => {
      expect(init?.signal).toBe(abort.signal);
      expect(init?.headers).toEqual({ accept: "application/json" });
      return Response.json({ count: 2 });
    }),
  });
  expect(result.count).toBe(2);
});

it("distinguishes HTTP, parsing and validation errors without retrying bad data", async () => {
  let calls = 0;
  for (const [response, error] of [[new Response("missing", { status: 404 }), HTTPError], [new Response("{bad"), SyntaxError], [Response.json({ count: "wrong" }), TypeError]] as const) {
    const promise = requestJSON("/api", { validate, retry: { attempts: 2, delayMs: 0 }, fetch: transport(async () => { calls++; return response; }) });
    await expect(promise).rejects.toBeInstanceOf(error);
  }
  expect(calls).toBe(3);
});

it("bounds safe-method retries and rejects retrying a POST before sending it", async () => {
  let calls = 0;
  const fetch = transport(async () => ++calls < 3 ? new Response(null, { status: 503 }) : Response.json({ count: 3 }));
  expect(await requestJSON("/api", { validate, fetch, retry: { attempts: 2, delayMs: 0 } })).toEqual({ count: 3 });
  expect(calls).toBe(3);
  await expect(requestJSON("/api", { validate, fetch, method: "POST", retry: { attempts: 1 } })).rejects.toThrow("bodyless");
  expect(calls).toBe(3);
  await expect(requestJSON("/api", { validate, fetch: transport(async () => { throw new TypeError("offline"); }), retry: { attempts: 1, delayMs: 0 } })).rejects.toThrow("offline");
});

it("honors inherited request signals and aborts retry backoff", async () => {
  const controller = new AbortController();
  let calls = 0;
  const request = new Request("https://example.test", { signal: controller.signal });
  const pending = requestJSON(request, {
    validate, retry: { attempts: 2, delayMs: 1000 },
    fetch: transport(async () => { calls++; setTimeout(() => controller.abort(), 0); return new Response(null, { status: 503 }); }),
  });
  await expect(pending).rejects.toBeInstanceOf(DOMException);
  expect(calls).toBe(1);
});

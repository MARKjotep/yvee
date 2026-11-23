import { describe, expect, it } from "bun:test";
import { HTTPError, requestJSON } from "../../src/yvee/platform/request";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function respond(value: BodyInit, status: number, statusText: string): typeof globalThis.fetch {
  return (async () => new Response(value, { status, statusText })) as unknown as typeof globalThis.fetch;
}

describe("HTTPError.body", () => {
  it("parses a JSON error body and uses its message", async () => {
    const transport = respond(JSON.stringify({ error: "Bad credentials" }), 401, "Unauthorized");

    const error = await requestJSON("/login", {
      method: "POST",
      body: "{}",
      validate: isObject,
      fetch: transport,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(HTTPError);
    const httpError = error as HTTPError;
    expect(httpError.body).toEqual({ error: "Bad credentials" });
    expect(httpError.message).toBe("Bad credentials");
    expect(await httpError.response.json()).toEqual({ error: "Bad credentials" });
  });

  it("accepts a message field", async () => {
    const transport = respond(JSON.stringify({ message: "Try again" }), 409, "Conflict");

    const error = (await requestJSON("/save", { validate: isObject, fetch: transport }).catch((caught: unknown) => caught)) as HTTPError;

    expect(error.body).toEqual({ message: "Try again" });
    expect(error.message).toBe("Try again");
  });

  it("leaves body undefined and falls back for a non-JSON body", async () => {
    const transport = respond("nope", 400, "Bad Request");

    const error = (await requestJSON("/save", { validate: isObject, fetch: transport }).catch((caught: unknown) => caught)) as HTTPError;

    expect(error).toBeInstanceOf(HTTPError);
    expect(error.body).toBeUndefined();
    expect(error.message).toBe("HTTP 400 Bad Request");
    expect(await error.response.text()).toBe("nope");
  });

  it("keeps the response readable after the error is caught", async () => {
    const payload = { error: "Gone", code: "expired" };
    const transport = respond(JSON.stringify(payload), 410, "Gone");

    const error = (await requestJSON("/item", { validate: isObject, fetch: transport }).catch((caught: unknown) => caught)) as HTTPError;

    expect(error.body).toEqual(payload);
    expect(await error.response.json()).toEqual(payload);
  });

  it("prefers an explicit constructor message", () => {
    const response = new Response("{}", { status: 500, statusText: "Server Error" });
    const error = new HTTPError(response, "Custom failure", { error: "server" });
    expect(error.message).toBe("Custom failure");
    expect(error.body).toEqual({ error: "server" });
    expect(new HTTPError(response, "Only message").message).toBe("Only message");
  });
});

import { readCookie } from "./cookie";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function bodyMessage(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  if (typeof body.error === "string" && body.error) return body.error;
  if (typeof body.message === "string" && body.message) return body.message;
  return undefined;
}

/**
 * Non-success HTTP response. `body` holds the parsed JSON error body when one
 * was readable. The message is the explicit `message` argument, then a string
 * `error` or `message` field on `body`, then `HTTP <status> <statusText>`.
 */
export class HTTPError extends Error {
  /** Parsed JSON body of the response, or `undefined` when it was not JSON. */
  readonly body?: unknown;

  constructor(readonly response: Response, message?: string, body?: unknown) {
    super(message ?? bodyMessage(body) ?? `HTTP ${response.status} ${response.statusText}`);
    this.name = "HTTPError";
    if (body !== undefined) this.body = body;
  }

  /**
   * Builds an `HTTPError` after cloning the response and parsing its JSON body.
   * The clone is taken first, so `response` stays readable for other callers.
   * Parse failures leave `body` undefined.
   */
  static async fromResponse(response: Response, message?: string): Promise<HTTPError> {
    let body: unknown;
    try {
      body = await response.clone().json();
    } catch {
      body = undefined;
    }
    return new HTTPError(response, message, body);
  }
}

export interface RequestRetry {
  /** Additional attempts, from 0 to 5. Only GET, HEAD and OPTIONS may retry. */
  attempts: number;
  delayMs?: number;
}

export interface CsrfOptions {
  /** Header carrying the token. Defaults to `x-csrf-token`. */
  header?: string;
  /** JSON body field carrying the token. Defaults to `csrfToken`. */
  field?: string;
  /** Token minting endpoint. Defaults to `/csrf`; `false` disables minting. */
  endpoint?: string | false;
}

interface CsrfPlan {
  header: string;
  field: string;
  endpoint: string | false;
}

export interface JSONRequestOptions<T> extends RequestInit {
  validate: (value: unknown) => value is T;
  retry?: RequestRetry;
  fetch?: typeof globalThis.fetch;
  /**
   * Attaches a CSRF token to the request header and, for a JSON body, a body
   * field. `true` uses the `x-csrf-token` header, the `csrfToken` field, the
   * `csrf_token` cookie, a `meta[name="csrf-token"]` tag, then a cached or
   * freshly minted token from `GET /csrf`. Existing body fields are never
   * overwritten.
   */
  csrf?: boolean | CsrfOptions;
}

/** Minted tokens are cached for the lifetime of the module (one document). */
const mintedTokens = new Map<string, Promise<string>>();

function csrfPlan(csrf: boolean | CsrfOptions | undefined): CsrfPlan | undefined {
  if (!csrf) return undefined;
  const options = csrf === true ? {} : csrf;
  return {
    header: options.header ?? "x-csrf-token",
    field: options.field ?? "csrfToken",
    endpoint: options.endpoint ?? "/csrf",
  };
}

function metaCsrfToken(): string | undefined {
  if (typeof document === "undefined" || typeof document.querySelector !== "function") return undefined;
  const content = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  return content || undefined;
}

async function mintCsrfToken(endpoint: string, transport: typeof globalThis.fetch, signal?: AbortSignal | null): Promise<string> {
  const cached = mintedTokens.get(endpoint);
  if (cached) return cached;
  const init: RequestInit = { method: "GET", headers: { accept: "application/json" } };
  if (signal) init.signal = signal;
  const pending = (async () => {
    const response = await transport(endpoint, init);
    if (!response.ok) throw await HTTPError.fromResponse(response);
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new TypeError(`CSRF token endpoint ${endpoint} did not return JSON.`);
    }
    const token = isRecord(body)
      ? typeof body.csrfToken === "string"
        ? body.csrfToken
        : typeof body.token === "string"
          ? body.token
          : undefined
      : undefined;
    if (!token) throw new TypeError(`CSRF token endpoint ${endpoint} returned no token.`);
    return token;
  })().catch((error) => {
    mintedTokens.delete(endpoint);
    throw error;
  });
  mintedTokens.set(endpoint, pending);
  return pending;
}

async function resolveCsrfToken(plan: CsrfPlan, transport: typeof globalThis.fetch, signal?: AbortSignal | null): Promise<string> {
  const readable = readCookie("csrf_token") ?? metaCsrfToken();
  if (readable) return readable;
  if (plan.endpoint === false) {
    throw new TypeError("No CSRF token is available; enable minting or provide a csrf_token cookie or meta tag.");
  }
  return mintCsrfToken(plan.endpoint, transport, signal);
}

async function withCsrf(init: RequestInit, plan: CsrfPlan, transport: typeof globalThis.fetch, signal?: AbortSignal | null): Promise<RequestInit> {
  const token = await resolveCsrfToken(plan, transport, signal);
  const headers = new Headers(init.headers);
  headers.set(plan.header, token);
  let body = init.body;
  const contentType = headers.get("content-type");
  if (typeof body === "string" && (contentType === null || contentType.includes("json"))) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = undefined;
    }
    if (isRecord(parsed) && !Object.hasOwn(parsed, plan.field)) {
      parsed[plan.field] = token;
      body = JSON.stringify(parsed);
      if (contentType === null) headers.set("content-type", "application/json");
    }
  }
  return { ...init, headers, ...(body === undefined ? {} : { body }) };
}

function delay(ms: number, signal?: AbortSignal | null) {
  signal?.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(signal?.reason); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

/** HTTP/status failures are distinct from JSON parsing and caller validation failures. */
export async function requestJSON<T>(input: RequestInfo | URL, options: JSONRequestOptions<T>): Promise<T> {
  const { validate, retry, fetch: transport = globalThis.fetch, csrf, ...rest } = options;
  let init: RequestInit = rest;
  const signal = init.signal === undefined ? (input instanceof Request ? input.signal : undefined) : init.signal;
  const method = (init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const attempts = retry?.attempts ?? 0;
  const delayMs = retry?.delayMs ?? 100;
  if (!Number.isInteger(attempts) || attempts < 0 || attempts > 5 || !Number.isFinite(delayMs) || delayMs < 0) {
    throw new TypeError("Retries require 0–5 additional attempts and a finite nonnegative delay.");
  }
  if (attempts && (!["GET", "HEAD", "OPTIONS"].includes(method) || init.body != null || (input instanceof Request && input.body !== null))) {
    throw new TypeError("Only bodyless GET, HEAD and OPTIONS requests may retry.");
  }
  const plan = csrfPlan(csrf);
  if (plan) init = await withCsrf(init, plan, transport, signal);
  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted();
    let response: Response;
    try {
      response = await transport(input, init);
    } catch (error) {
      signal?.throwIfAborted();
      if (attempt >= attempts || !(error instanceof TypeError)) throw error;
      await delay(delayMs, signal);
      continue;
    }
    signal?.throwIfAborted();
    if (!response.ok) {
      const error = await HTTPError.fromResponse(response);
      if (attempt >= attempts || ![408, 429, 500, 502, 503, 504].includes(response.status)) throw error;
      await response.body?.cancel();
      await delay(delayMs, signal);
      continue;
    }
    const value: unknown = await response.json();
    signal?.throwIfAborted();
    if (!validate(value)) throw new TypeError("Response JSON failed validation.");
    return value;
  }
}

export interface FormRequestOptions<T> extends Omit<RequestInit, "body"> {
  /** JSON payload, serialized as the request body. Ignored when `body` is set. */
  data?: unknown;
  /** Raw body such as `FormData`; takes precedence over `data`. */
  body?: BodyInit | null;
  /** Optional validator for the parsed JSON success payload. */
  validate?: (value: unknown) => value is T;
  /** CSRF options forwarded to `requestJSON`. */
  csrf?: boolean | CsrfOptions;
  fetch?: typeof globalThis.fetch;
}

export interface FormResult<T> {
  ok: boolean;
  /** HTTP status, or `0` when no response was received. */
  status: number;
  data?: T | undefined;
  /** Server error text when available, otherwise the failure message. */
  error?: string | undefined;
}

/**
 * Submits a JSON or `FormData` body without throwing.
 * HTTP and network failures resolve to `{ ok: false, status, error }`; a
 * missing response reports status `0`. A 204/205 success has no `data`.
 */
export async function requestForm<T = unknown>(url: string | URL, options: FormRequestOptions<T> = {}): Promise<FormResult<T>> {
  const { data, body, validate, csrf, fetch: transport, method = "POST", headers: givenHeaders, ...init } = options;
  let response: Response | undefined;
  const capture = (async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const result = await (transport ?? globalThis.fetch)(input, requestInit);
    response = result;
    return result;
  }) as typeof globalThis.fetch;
  try {
    const headers = new Headers(givenHeaders);
    let payload: BodyInit | null = body ?? null;
    if (payload === null && data !== undefined) {
      payload = JSON.stringify(data);
      if (!headers.has("content-type")) headers.set("content-type", "application/json");
    }
    const request: JSONRequestOptions<T> = {
      ...init,
      method,
      headers,
      body: payload,
      fetch: capture,
      validate: validate ?? ((candidate: unknown): candidate is T => true),
    };
    if (csrf !== undefined) request.csrf = csrf;
    const value = await requestJSON<T>(url, request);
    return { ok: true, status: response?.status ?? 0, data: value };
  } catch (error) {
    if (error instanceof HTTPError) {
      return { ok: false, status: error.response.status, error: error.message };
    }
    const status = response?.status ?? 0;
    if (response?.ok && (status === 204 || status === 205)) {
      return { ok: true, status, data: undefined };
    }
    return { ok: false, status, error: error instanceof Error ? error.message : String(error) };
  }
}

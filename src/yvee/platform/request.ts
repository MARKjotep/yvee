export class HTTPError extends Error {
  constructor(readonly response: Response) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.name = "HTTPError";
  }
}

export interface RequestRetry {
  /** Additional attempts, from 0 to 5. Only GET, HEAD and OPTIONS may retry. */
  attempts: number;
  delayMs?: number;
}

export interface JSONRequestOptions<T> extends RequestInit {
  validate: (value: unknown) => value is T;
  retry?: RequestRetry;
  fetch?: typeof globalThis.fetch;
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
  const { validate, retry, fetch: transport = globalThis.fetch, ...init } = options;
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
      const error = new HTTPError(response);
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

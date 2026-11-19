export declare class HTTPError extends Error {
    readonly response: Response;
    constructor(response: Response);
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
/** HTTP/status failures are distinct from JSON parsing and caller validation failures. */
export declare function requestJSON<T>(input: RequestInfo | URL, options: JSONRequestOptions<T>): Promise<T>;

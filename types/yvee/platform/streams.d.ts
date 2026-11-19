export interface StreamHandlers {
    open?: (event: Event) => void;
    error?: (event: Event) => void;
    message?: (event: MessageEvent) => void;
    [name: string]: ((event: MessageEvent) => void) | ((event: Event) => void) | undefined;
}
export interface StreamOptions extends EventSourceInit {
    signal?: AbortSignal;
}
/** Dedicated EventSource; native SSE reconnection continues until close/abort. */
export declare function eventStreams(url: string, handlers?: StreamHandlers, options?: StreamOptions): EventSource;

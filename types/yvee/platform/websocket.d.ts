import type { RouteBook } from '../routing/routes';
interface SocketRouteSource {
    routes: RouteBook;
}
export type MessageFailure = 'parse' | 'validation' | 'handler';
export interface JsonMessageOptions<T> {
    validate?: (value: unknown) => value is T;
    onError?: (error: unknown, phase: MessageFailure, event: MessageEvent) => void;
}
export interface SocketLoadOptions {
    signal?: AbortSignal;
    /** No retries by default. Attempts are a total budget per load, including after successful opens. */
    retry?: {
        attempts: number;
        delay?: number;
        maxDelay?: number;
    };
}
export declare class SocketController {
    connection?: WebSocket;
    path: string;
    params: Record<string, string>;
    open(_event: Event): void;
    message(_event: MessageEvent): void | Promise<void>;
    close(_event: CloseEvent): void;
    error(_event: Event): void;
    messageError(error: unknown, phase: MessageFailure, _event: MessageEvent): void;
    sendJson(value: unknown): void;
    onMessage<T = unknown>(handler: (value: T, event: MessageEvent) => void | Promise<void>, options?: JsonMessageOptions<T>): this;
}
export declare class SocketHub {
    private readonly app;
    private readonly connections;
    constructor(app: SocketRouteSource);
    load(path: string, options?: SocketLoadOptions): SocketController;
    unload(path: string): void;
    closeAll(): void;
}
export {};

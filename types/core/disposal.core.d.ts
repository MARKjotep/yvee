export type Cleanup = () => void;
export type Disposable = {
    dispose(): void;
} | {
    close(): void;
};
/** Synchronous resource ownership. Disposal is idempotent and attempts every cleanup. */
export declare class DisposalScope {
    private readonly controller;
    private readonly cleanups;
    get signal(): AbortSignal;
    get disposed(): boolean;
    defer(cleanup: Cleanup): Cleanup;
    own<T extends Disposable>(resource: T): T;
    listen(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Cleanup;
    timeout(callback: () => void, ms: number): Cleanup;
    dispose(): void;
}

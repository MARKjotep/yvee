type EventHandler = (event: MessageEvent) => void;
export type EventMap = Record<string, EventHandler>;
export declare class EventStream {
    readonly url: string;
    readonly stream: EventSource;
    private readonly handlers;
    private closed;
    constructor(url: string, withCredentials?: boolean);
    on(events: EventMap): this;
    off(eventName?: string, handler?: EventHandler): this;
    close(): void;
}
export declare function eventStream(url: string, withCredentials?: boolean): EventStream;
export {};

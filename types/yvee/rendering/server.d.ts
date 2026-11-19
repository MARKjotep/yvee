import type { Layout } from "../client/mount";
import { type HeadConfig } from "./head";
import type { Guard } from "../guards";
import type { Page } from "../pages/page";
import type { YveeURL } from "../routing/path";
import type { Constructor, RouteBook } from "../routing/routes";
export interface ServerRequest<TData> {
    /** URL used to select the page for this render. */
    url: string | URL | YveeURL;
    /** Request data exposed to the page and its fetch method. */
    data?: TData;
    /** Error status to render through the registered error page. */
    error?: number;
    /** Unique per response; pass the same value to the client mount. */
    nonce?: string;
    /** Abort signal for request-bound page loading and data creation. */
    signal?: AbortSignal;
}
/** HTML and the HTTP status produced by a server render. */
export interface ServerStatusResult {
    html: string;
    status: number;
}
export interface ServerDataContext<TData> extends ServerRequest<TData> {
    signal: AbortSignal;
    /** Register resources acquired by dataFactory; runs on success, failure or abort. */
    onDispose(cleanup: () => void | Promise<void>): void;
}
export interface ServerOptions<TData extends Record<string, unknown>> {
    id?: string;
    class?: string | string[];
    data?: TData;
    /** Return fresh request-owned mutable data/services. Plain data inputs are frozen snapshots. */
    dataFactory?: (context: ServerDataContext<TData>) => TData | Promise<TData>;
}
export interface ServerRenderer<TData extends Record<string, unknown>> {
    /** Render a request and return its HTML document. */
    (request: ServerRequest<TData>): Promise<string>;
    withStatus(request: ServerRequest<TData>): Promise<ServerStatusResult>;
}
export interface ServerRenderContext<TData extends Record<string, unknown>> {
    id: string;
    defaults: HeadConfig;
    routes: RouteBook;
    errors: Map<number, Constructor<Page>>;
    guards: Guard<any, any, any>[];
    data: TData;
    layout?: Layout;
    app: unknown;
}
export declare function createServerRenderer<TData extends Record<string, unknown>>(context: ServerRenderContext<TData>, options?: ServerOptions<TData>): ServerRenderer<TData>;

import { DisposalScope } from "@/core/disposal.core";
import { type IStateful } from "@/core/core.core";
import type { Guard } from "./guards";
import { HeadDefaults, type HeadResult } from "./rendering/head";
import { type Layout } from "./client/mount";
import { type Page } from "./pages/page";
import { type YveeURL } from "./routing/path";
import { RouteBook, type Constructor, type Transport } from "./routing/routes";
import { type ServerOptions, type ServerRenderer } from "./rendering/server";
import { SocketHub } from "./platform/websocket";
export interface YveeOptions {
    base?: string;
    history?: boolean;
    id?: string;
    /** Browser entry directory or JavaScript file URL. Defaults to `/client`, which resolves to `/client/index.js`. */
    client?: string;
    index?: string;
}
export interface MountOptions<T> {
    id?: string;
    data?: T;
    class?: string | string[];
    hydrate?: boolean;
    nonce?: string;
}
/**
 * The value returned by `render()` can be called on a server to create HTML.
 * In a browser it also behaves like the mount promise for backwards-compatible
 * client startup (`app.render().then(...)`).
 */
export type RenderResult<T extends Record<string, unknown>> = ServerRenderer<T> & Promise<() => void>;
export type { Layout };
export declare class Yvee<T extends Record<string, unknown> = Record<string, unknown>> extends HeadDefaults {
    readonly id: string;
    readonly routes: RouteBook;
    readonly url: IStateful<YveeURL>;
    readonly loading: IStateful<boolean>;
    readonly socket: SocketHub;
    readonly history: {
        navigate: (path: string | YveeURL, state?: Record<string, unknown>) => void;
        replace: (path: string | YveeURL, state?: Record<string, unknown>) => void;
        back: () => void;
        forward: () => void;
    };
    data: T;
    resources: DisposalScope;
    private readonly root;
    private readonly pageErrors;
    private readonly globalGuards;
    private readonly client;
    private layout;
    onError?: (error: unknown, url: YveeURL) => void;
    constructor(options?: YveeOptions);
    Main(layout?: Layout): this;
    use(...guards: Guard<Yvee<T>, Page<T>, T>[]): this;
    head(value: HeadResult): this;
    route(path: string): <C extends Constructor<Page>>(controller: C) => C;
    error(code: number, controller: Constructor<Page>): this;
    register(...controllers: Constructor[]): this;
    listRoutes(transport?: Transport): import(".").RouteEntry<unknown>[];
    render(options?: MountOptions<T>): RenderResult<T>;
    dispose(): void;
    server(options?: ServerOptions<T>): ServerRenderer<T>;
    private load;
}

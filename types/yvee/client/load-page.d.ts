import { type Guard } from "../guards";
import { type HeadConfig } from "../rendering/head";
import { type Page } from "../pages/page";
import type { YveeURL } from "../routing/path";
import { RouteBook, type Constructor } from "../routing/routes";
export type PageLoad = {
    kind: "ready";
    status: number;
    body: unknown[];
    head: HeadConfig;
    url: YveeURL;
    failure?: unknown;
    dispose?: () => void;
} | {
    kind: "stop";
} | {
    kind: "redirect";
    to: string;
    replace?: boolean;
};
interface LoadPageOptions<TData extends Record<string, unknown>, TApp> {
    app: TApp;
    routes: RouteBook;
    globalGuards: Guard<TApp, Page<TData>, TData>[];
    errors: Map<number, Constructor<Page>>;
    error?: number;
    url: YveeURL;
    data: TData;
    signal: AbortSignal;
}
export declare function loadPage<TData extends Record<string, unknown>, TApp>({ app, routes, globalGuards, errors, error, url, data, signal, }: LoadPageOptions<TData, TApp>): Promise<PageLoad>;
export {};

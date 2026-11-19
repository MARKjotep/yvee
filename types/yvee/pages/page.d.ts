import { DisposalScope } from "@/core/disposal.core";
import type { YveeURL } from "../routing/path";
import type { HeadResult } from "../rendering/head";
export declare class Page<TData extends Record<string, unknown> = Record<string, unknown>> {
    readonly resources: DisposalScope;
    url: YveeURL;
    path: string;
    params: Record<string, string>;
    data: TData;
    error?: unknown;
    status: number;
    fetch?(context: PageFetchContext<TData>): Partial<TData> | Promise<Partial<TData>>;
    head?(): HeadResult | Promise<HeadResult>;
    body?(): unknown | Promise<unknown>;
}
export interface PageFetchContext<TData extends Record<string, unknown>> {
    url: YveeURL;
    params: Readonly<Record<string, string>>;
    data: TData;
    signal: AbortSignal;
    resources: DisposalScope;
}
export declare class MissingPage extends Page {
    body(): JSX.Element;
}
export declare class FailurePage extends Page {
    status: number;
    body(): JSX.Element;
}

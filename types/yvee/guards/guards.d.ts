import type { YveeURL } from "../routing/path";
import type { Constructor } from "../routing/routes";
import type { IStateful } from "@/core/core.core";
export interface GuardApp<TData extends Record<string, unknown>> {
    data: TData;
    url: IStateful<YveeURL>;
}
export type GuardResult = void | {
    kind: "allow";
} | {
    kind: "stop";
} | {
    kind: "redirect";
    to: string;
    replace?: boolean;
};
export interface GuardContext<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> {
    app: TApp;
    page: TPage;
    url: YveeURL;
    params: Readonly<Record<string, string>>;
    data: TData;
    signal: AbortSignal;
}
export type Guard<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> = (context: GuardContext<TApp, TPage, TData>) => GuardResult | Promise<GuardResult>;
export type GuardFactory<Args extends unknown[] = [], TContext = GuardContext> = (...args: Args) => (context: TContext) => GuardResult | Promise<GuardResult>;
export declare const createGuard: <Args extends unknown[], TContext = GuardContext>(factory: GuardFactory<Args, TContext>) => GuardFactory<Args, TContext>;
export declare const use: (...guards: Guard<any, any, any>[]) => <T extends Constructor>(controller: T) => T;
export declare const guardsFor: (controller: Function) => readonly Guard<any, any, any>[];
export declare function checkGuards<TApp, TPage, TData extends Record<string, unknown>>(guards: readonly Guard<TApp, TPage, TData>[], context: GuardContext<TApp, TPage, TData>): Promise<{
    kind: "stop";
} | {
    kind: "redirect";
    to: string;
    replace?: boolean;
} | {
    kind: "allow";
}>;

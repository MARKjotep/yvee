import type { IStateful } from "@/core/core.core";
import { type HeadCleanup, type HeadConfig } from "../../rendering/head";
/** Owns staged head resources and the last committed body/head for rollback. */
export declare class RouteView {
    private readonly options;
    active: HeadCleanup | undefined;
    nonce: string | undefined;
    private readonly pending;
    private committedHead;
    private committedBody;
    constructor(options: {
        id: string;
        root: IStateful<unknown[]>;
        isCurrent(revision: number): boolean;
    });
    remember(body: unknown[], head: HeadConfig): void;
    reset(): void;
    setBody(body: unknown[], revision: number): Promise<void>;
    activate(nextHead: HeadCleanup, revision: number): Promise<void>;
    releasePending(head: HeadCleanup): void;
    releaseActive(): void;
    discardPending(): void;
    stage(config: HeadConfig, revision: number): HeadCleanup;
}

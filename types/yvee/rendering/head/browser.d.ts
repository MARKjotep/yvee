import { type HeadConfig } from "./config";
export type HeadCleanup = (() => void) & {
    ready: Promise<void>;
    activate(): Promise<void>;
    cancel(): void;
};
export declare function applyHead(config: HeadConfig, owner: string, options?: {
    keepExisting?: boolean;
    deferTitle?: boolean;
    idSeed?: string;
    nonce?: string;
}): HeadCleanup;
export declare function removeHeadElements(owner: string): void;

import { type YveeURL } from "../../routing/path";
import type { ScrollPosition } from "./types";
interface HistoryOptions {
    id: string;
    enabled: boolean;
    currentURL(): YveeURL | undefined;
}
/** Owns browser entry identity and the bounded scroll-position cache. */
export declare class RouteHistory {
    private readonly options;
    private displayedEntry;
    private nextEntryId;
    private readonly scrollPositions;
    constructor(options: HistoryOptions);
    pop(url: YveeURL, state: unknown): ScrollPosition | undefined;
    initialize(url: YveeURL): void;
    getScroll(key: string): ScrollPosition | undefined;
    beginTransition(): void;
    reset(): void;
    restoreAddress(url: YveeURL): void;
    write(url: YveeURL, state?: Record<string, unknown>, replace?: boolean, savedScroll?: {
        x: number;
        y: number;
    }): void;
    private newEntryKey;
    private entryKey;
    trackDisplayedEntry(): void;
    private captureDisplayedScroll;
    saveCurrentScroll(): void;
    private rememberScroll;
    replaceAddressIfNeeded(url: YveeURL): void;
}
export {};

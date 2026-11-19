export declare function scheduleState(dispatch: () => void): void;
/** Synchronous, nestable batching. Values change immediately; subscribers see the final values. */
export declare function batch<T>(callback: () => T): T;

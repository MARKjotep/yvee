/** Copy/freeze data containers without freezing the caller's graph or cloning services. */
export declare function snapshotData<T>(value: T, seen?: WeakMap<object, object>): T;

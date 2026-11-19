/** Holds a mutable value and emits an `updated` event when it changes. */
export declare class RefState<T> extends EventTarget {
    private current;
    constructor(current: T);
    get value(): T;
    get clone(): T;
    set value(value: T);
}
export declare class Ref<T extends Element = HTMLElement> {
    readonly state: RefState<T | undefined>;
    get element(): T | undefined;
    set element(element: T | undefined);
    get $(): T | undefined;
}
export declare const useRef: <T extends Element = HTMLElement>() => Ref<T>;

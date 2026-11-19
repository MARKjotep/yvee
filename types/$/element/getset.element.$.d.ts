import { Elem } from "./element.$";
import type { Elements } from "../query.$";
import { anim } from "./anim.element.$";
import { type CSSStyle, type V } from "../support.$";
export declare class Eget<T extends Elements = HTMLElement> {
    e: T;
    protected _query?: string | undefined;
    constructor(e: T, _query?: string | undefined);
    get a(): anim;
    get all(): T[];
    get attr(): {
        has: (attr: string) => boolean;
        get: (attr: string) => string | null;
        del: (attr: string) => Eget<T>;
        set: (attrs: Record<string, unknown>) => Eget<T>;
    };
    get children(): Elem<T>[];
    get click(): this;
    get delete(): this;
    get disabled(): boolean;
    get focus(): this;
    get href(): string;
    get id(): string;
    get inner(): string;
    get offsetParent(): Elem | undefined;
    get parent(): Elem | undefined;
    get hash(): string;
    get path(): string;
    get rect(): DOMRect;
    get remove_element(): this;
    get style(): {
        set: (style: CSSStyle | Record<string, V | null | undefined>, delayOrFN?: number | ((e?: any) => void)) => Elem<T>;
        get: (prop: keyof CSSStyleDeclaration | string) => string;
        del: (...props: (keyof CSSStyleDeclaration | string)[]) => Elem<T>;
    };
    get submit(): boolean;
    get tag(): string;
    get value(): any;
    get unload(): () => void;
    private updateContent;
    set append(val: any);
    set appendfirst(val: any);
    set inner(val: any);
    set disabled(vl: boolean);
    set id(did: string);
    set value(vl: any);
}

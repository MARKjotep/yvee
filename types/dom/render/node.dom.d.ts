import type { DOMAttr, DOMContext, DOMComponent } from "./contracts.dom";
export declare class DOM {
    tag: string;
    attr: DOMAttr;
    ctx: DOMContext[];
    constructor(tag: string, attr: DOMAttr, ctx: DOMContext[]);
}
export declare function dom(tag: string | DOMComponent, attr?: DOMAttr | null, ...ctx: DOMContext[]): Promise<DOM>;
export declare const frag: (_attr: DOMAttr, ...ctx: DOMContext[]) => Promise<DOM>;

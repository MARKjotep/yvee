import { DOM } from "./node.dom";
import { CATT } from "./cat.dom";
import { Idm } from "./idm.dom";
import type { DOMContext } from "./contracts.dom";
type NestedDOMRenderer = (node: DOM, parentId: Idm) => Promise<{
    ctx: string;
    oz: CATT["OZ"];
}>;
export declare const setNestedDOMRenderer: (renderer: NestedDOMRenderer) => void;
export declare const processCTXStateful: (value: unknown, xid?: string, nonce?: string) => Promise<{
    ctx: string;
    catt: CATT;
}>;
export declare const processCTX: (v: DOMContext, len: number, catt: CATT, inner?: string[]) => Promise<void>;
export declare class CTX {
    tag: string;
    ctx: DOMContext[];
    closing: string;
    constructor(tag: string | undefined, ctx: DOMContext[]);
    private process;
    get(catt: CATT): Promise<string>;
}
export {};

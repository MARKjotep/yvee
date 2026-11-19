import { CATT } from "./cat.dom";
export declare function escapeHTML(input: unknown): string;
export declare const processCTXStateful: (value: unknown, xid?: string) => Promise<{
    ctx: string;
    catt: CATT;
}>;
export declare const processCTX: (v: ctx, len: number, catt: CATT, inner?: string[]) => Promise<void>;
export declare class CTX {
    tag: string;
    ctx: ctx[];
    closing: string;
    constructor(tag: string | undefined, ctx: ctx[]);
    private process;
    get(catt: CATT): Promise<string>;
}

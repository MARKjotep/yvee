import { CATT } from "@/dom/render/cat.dom";
import type { EAttr } from "./types.dom";
export * from "./types.dom";
export * from "./events.dom";
export * from "./style.dom";
export { attr_value } from "./value.dom";
export declare class ATTR {
    attr: EAttr;
    constructor(attr?: EAttr);
    get(catt: CATT, attr?: EAttr, pre?: string): void;
    unload<T>(x: string): T | undefined;
}

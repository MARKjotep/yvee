import { DOM } from "@/dom/render/node.dom";
export type HeadConfig = {
    base?: Record<string, string | boolean>[];
    title?: string;
    style?: string;
    description?: string;
    meta?: Record<string, string | boolean>[];
    link?: Record<string, string | boolean>[];
    script?: (Record<string, string | boolean> & {
        body?: string;
    })[];
    css?: string | string[];
    js?: string | string[];
    /** DOM-rendered head elements, useful for reactive text and attributes. */
    elements?: DOM[];
};
export type HeadResult = HeadConfig | DOM | string | void;
export declare function asArray<T>(value: T | T[] | undefined): T[];
export declare function combineHead(defaults: HeadConfig, page: HeadConfig): HeadConfig;
export declare function normalizeHeadValue(value: HeadResult): HeadConfig;
export declare class HeadDefaults {
    readonly values: HeadConfig;
    head(value: HeadResult): void;
}

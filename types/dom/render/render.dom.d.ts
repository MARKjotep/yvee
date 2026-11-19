import { OZ } from "./oz.dom";
import { Idm } from "./idm.dom";
import type { maybePromise } from "@/utils";
import { DOM } from "./node.dom";
export * from "../attr/attr.dom";
export interface RenderedDOM {
    ctx: string;
    oz: OZ;
    id: string | undefined;
}
export type renderedDom = RenderedDOM;
export declare function renderDom(node: maybePromise<DOM>, pid?: Idm | string): Promise<RenderedDOM>;

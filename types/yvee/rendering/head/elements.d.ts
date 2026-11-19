import { type RenderedDOM } from "@/dom/dom.dom";
import { DOM } from "@/dom/render/node.dom";
export declare function renderHeadElements(elements: readonly DOM[], owner: string, idSeed: string, nonce?: string): Promise<RenderedDOM>;

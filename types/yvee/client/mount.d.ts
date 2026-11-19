import type { DOMContext } from "@/dom/render/contracts.dom";
import type { IStateful } from "@/core/core.core";
import type { maybePromise } from "@/utils";
export type Layout = (content: IStateful<unknown[]>) => maybePromise<DOMContext>;
interface MountOptions {
    element: HTMLElement;
    id: string;
    className?: string | string[];
    root: IStateful<unknown[]>;
    layout?: Layout;
    hydrate?: boolean;
    nonce?: string;
    isCurrent?: () => boolean;
}
export declare function mountRoot({ element, id, className, root, layout, hydrate, nonce, isCurrent }: MountOptions): Promise<void>;
export {};

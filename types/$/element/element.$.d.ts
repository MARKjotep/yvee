import type { Elements } from "../query.$";
import type { kf, KFType } from "./anim.element.$";
import { Eget } from "./getset.element.$";
type fn<E, T> = (e?: E) => T;
type ElementEventName = keyof GlobalEventHandlersEventMap | "state" | "states" | "ready" | "beforeunload" | "popstate" | "DOMContentLoaded" | "winscroll" | "winload" | "winfocus" | "winblur" | "winkeydown" | "winkeypress" | "winkeyup";
export declare class Elem<T extends Elements = HTMLElement> extends Eget<T> {
    add(...className: string[]): () => void;
    remove(...className: string[]): this;
    toggle(className: string | fn<any, string>, force?: boolean): boolean;
    /**
     * Boolean toggle
     * @param className
     * @param force
     * @returns
     */
    toggled(bool: boolean, className: string): this;
    clear(): this;
    hasNode(e: Node): boolean;
    has(...classes: string[]): boolean;
    insert(position: InsertPosition): {
        /** Trusted application-authored HTML only. Use text or rendered content for data. */
        HTML: (...text: string[]) => Elem<T>;
        element: (...elem: Element[]) => Elem<T>;
        text: (...text: string[]) => Elem<T>;
    };
    is(tp: {
        dom?: string;
        class?: string | string[];
    }): boolean;
    on(event: ElementEventName, handler: (e?: any) => void, useCapture?: boolean): this;
    remove_on(event: keyof DocumentEventMap, handler: EventListenerOrEventListenerObject, useCapture?: boolean): this;
    timed(fn: (ee?: Elem<T>) => void, timeout?: number): this;
    animate(keyframes: KFType, options?: kf, onComplete?: fn<any, void>): this;
    animate(keyframes: KFType, onComplete?: fn<any, void>): this;
    query(query: string): T | null;
    queryAll(query: string): T[];
    newChild<P>(element: keyof HTMLElementTagNameMap, props?: Record<string, P>): Elem<HTMLElement | HTMLObjectElement | HTMLMapElement | HTMLDataElement | HTMLScriptElement | HTMLStyleElement | HTMLHtmlElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFormElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLSelectElement | HTMLSlotElement | HTMLSourceElement | HTMLSpanElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement>;
    newChildNS<P>(element: keyof SVGElementTagNameMap, props?: Record<string, P>): Elem<SVGSymbolElement | SVGFilterElement | SVGScriptElement | SVGStyleElement | SVGAElement | SVGTitleElement | SVGAnimateElement | SVGAnimateMotionElement | SVGAnimateTransformElement | SVGCircleElement | SVGClipPathElement | SVGDefsElement | SVGDescElement | SVGEllipseElement | SVGFEBlendElement | SVGFEColorMatrixElement | SVGFEComponentTransferElement | SVGFECompositeElement | SVGFEConvolveMatrixElement | SVGFEDiffuseLightingElement | SVGFEDisplacementMapElement | SVGFEDistantLightElement | SVGFEDropShadowElement | SVGFEFloodElement | SVGFEFuncAElement | SVGFEFuncBElement | SVGFEFuncGElement | SVGFEFuncRElement | SVGFEGaussianBlurElement | SVGFEImageElement | SVGFEMergeElement | SVGFEMergeNodeElement | SVGFEMorphologyElement | SVGFEOffsetElement | SVGFEPointLightElement | SVGFESpecularLightingElement | SVGFESpotLightElement | SVGFETileElement | SVGFETurbulenceElement | SVGForeignObjectElement | SVGGElement | SVGImageElement | SVGLineElement | SVGLinearGradientElement | SVGMarkerElement | SVGMaskElement | SVGMetadataElement | SVGMPathElement | SVGPathElement | SVGPatternElement | SVGPolygonElement | SVGPolylineElement | SVGRadialGradientElement | SVGRectElement | SVGSetElement | SVGStopElement | SVGSVGElement | SVGSwitchElement | SVGTextElement | SVGTextPathElement | SVGTSpanElement | SVGUseElement | SVGViewElement>;
    get<K extends keyof T>(property: K): T[K];
    get(property: string): unknown;
}
export {};

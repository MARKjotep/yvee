import type { Ref } from "@/core/ref.core";
import type { CSSStyle } from "./style.dom";
import type { DVal } from "./value-types.attr.dom";
import type { DOMEvents } from "./events.dom";
export interface EAttr<T = DVal> {
    [key: string]: any;
    [key: `data-${string}`]: T | any;
    accesskey?: T;
    autocapitalize?: T;
    class?: T | T[];
    on?: DOMEvents<any>;
    ref?: Ref<any>;
    contenteditable?: T;
    dir?: T;
    draggable?: T;
    hidden?: T;
    id?: T;
    itemprop?: T;
    lang?: T;
    role?: T;
    slot?: T;
    spellcheck?: T;
    style?: CSSStyle | string;
    tabindex?: T;
    title?: T;
    translate?: T;
}

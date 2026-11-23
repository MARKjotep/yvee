import type { Ref } from "@/core/ref.core";
import type { CSSStyle } from "./style.dom";
import type { DVal } from "./value-types.attr.dom";
import type { DOMEvents } from "./events.dom";

/**
 * Attributes accepted by every Yvee element. Optional attributes are declared
 * as `?: T | undefined` so a conditionally-present value
 * (`disabled={props.disabled}`) type-checks under `exactOptionalPropertyTypes`;
 * an explicitly `undefined` attribute is dropped during render.
 */
export interface EAttr<T = DVal> {
  [key: string]: any;
  [key: `data-${string}`]: T | any;
  accesskey?: T | undefined;
  autocapitalize?: T | undefined;
  class?: T | T[] | undefined;
  on?: DOMEvents<any> | undefined;
  ref?: Ref<any> | undefined;
  contenteditable?: T | undefined;
  dir?: T | undefined;
  draggable?: T | undefined;
  hidden?: T | undefined;
  id?: T | undefined;
  itemprop?: T | undefined;
  lang?: T | undefined;
  role?: T | undefined;
  slot?: T | undefined;
  spellcheck?: T | undefined;
  style?: CSSStyle | string | undefined;
  tabindex?: T | undefined;
  title?: T | undefined;
  translate?: T | undefined;
}

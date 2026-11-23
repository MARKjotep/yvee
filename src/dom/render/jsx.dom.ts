import type { DOM } from "./node.dom";
import type { ElementAttributes, SVGAttributes } from "../attr/types.dom";
import type { maybePromise } from "@/utils";
import type { Elements } from "@/$/query.$";
import type { c_events } from "../attr/events.dom";

declare global {
  type events<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?:
      | ((this: T, e: GlobalEventHandlersEventMap[P]) => void)
      | undefined;
  } & c_events<T>;

  /**
   * Yvee JSX namespace.
   *
   * Function components receive their attributes as the first argument and JSX
   * children as **rest arguments**: declare them as
   * `(props: P, ...children: DOMContext[])` and render `{children}`.
   * Children are never placed on `props`, and `props.children` is always
   * `undefined`.
   */
  namespace JSX {
    type Element = maybePromise<DOM>;
    interface IntrinsicElements extends ElementAttributes, SVGAttributes {}
  }
}

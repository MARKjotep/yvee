import type { DOM } from "./node.dom";
import type { ElementAttributes, SVGAttributes } from "../attr/types.dom";
import type { maybePromise } from "@/utils";
import type { Elements } from "@/$/query.$";
import type { c_events } from "../attr/events.dom";

declare global {
  type events<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?: (
      this: T,
      e: GlobalEventHandlersEventMap[P],
    ) => void;
  } & c_events<T>;

  namespace JSX {
    type Element = maybePromise<DOM>;
    interface IntrinsicElements extends ElementAttributes, SVGAttributes {}
  }
}

import type { EAttr } from "../attr/base.attr.dom";
import type { DOM } from "./node.dom";
import type { DVal } from "../attr/value-types.attr.dom";
import type { IStateful } from "@/core/state/stateful.core";
import type { maybePromise } from "@/utils";
import type { V } from "@/utils";

export type DOMAttr = EAttr;
export type DOMValue<T = V | V[]> = DVal<T>;
export type DOMRenderable =
  | string
  | number
  | boolean
  | null
  | undefined
  | DOM
  | DOMRenderable[]
  | IStateful<unknown>
  | object
  | (() => maybePromise<DOMRenderable>);
export type DOMContext = maybePromise<DOMRenderable>;
export type DOMComponentProps<T extends object = {}> = DOMAttr & T;
export type DOMComponent<T extends object = {}> = (
  attributes: DOMComponentProps<T>,
  ...children: DOMContext[]
) => maybePromise<DOM>;
export type DOMNode = DOM;
export type { DVal };

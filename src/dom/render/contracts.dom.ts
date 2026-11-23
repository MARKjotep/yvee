import type { EAttr } from "../attr/base.attr.dom";
import type { DOM } from "./node.dom";
import type { DVal } from "../attr/value-types.attr.dom";
import type { IStateful } from "@/core/state/stateful.core";
import type { maybePromise } from "@/utils";
import type { V } from "@/utils";

/**
 * Attribute/event shape accepted by renderer nodes and JSX intrinsics.
 *
 * Optional attributes accept an explicitly `undefined` value
 * (`disabled?: T | undefined`) and are omitted from the rendered markup.
 */
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
/**
 * Attributes passed to a Yvee function component: {@link DOMAttr} plus the
 * component's own props.
 *
 * JSX children are **not** part of this object. `dom` forwards them as rest
 * arguments, so `props.children` is always `undefined`; declare components as
 * `(props: P, ...children: DOMContext[])` and render `{children}`.
 */
export type DOMComponentProps<T extends object = {}> = DOMAttr & T;
/**
 * Type of a Yvee function component.
 *
 * The first parameter carries attributes/props; JSX children arrive as the
 * remaining rest parameters (they are never placed on the props object).
 *
 * ```tsx
 * function Card(props: { title: string }, ...children: DOMContext[]) {
 *   return <section><h2>{props.title}</h2>{children}</section>;
 * }
 * ```
 */
export type DOMComponent<T extends object = {}> = (
  attributes: DOMComponentProps<T>,
  ...children: DOMContext[]
) => maybePromise<DOM>;
export type DOMNode = DOM;
export type { DVal };

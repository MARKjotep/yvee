import { dom, frag } from "../dom/render/node.dom";
import type { DOM } from "../dom/render/node.dom";
import type { DOMAttr, DOMContext } from "../dom/render/contracts.dom";
import type { ElementAttributes, SVGAttributes } from "../dom/attr/types.dom";
import type { maybePromise } from "@/utils";

/**
 * Automatic JSX runtime for Yvee (`"jsx": "react-jsx"`,
 * `"jsxImportSource": "yvee"`).
 *
 * Bun and TypeScript import `jsx`/`jsxs` from `yvee/jsx-runtime` (or `jsxDEV`
 * from `yvee/jsx-dev-runtime` in development). JSX children arrive on the
 * props object here and are forwarded to {@link dom} as rest arguments, so
 * component authors keep the usual `(props, ...children)` contract. Nothing
 * needs to be imported in `.tsx` files; classic `dom`/`frag` usage keeps
 * working unchanged.
 */

type JsxType = Parameters<typeof dom>[0];
type JsxProps = Record<string, unknown> & {
  children?: DOMContext | DOMContext[] | undefined;
};

/**
 * Build a DOM node from automatic-runtime JSX props.
 *
 * `children` is removed from the props object and passed to {@link dom} as
 * rest arguments; an explicit runtime `key` is merged back into the attributes
 * so keyed collections behave exactly like classic JSX.
 */
function create(type: JsxType, props: JsxProps | null, key?: unknown): Promise<DOM> {
  const { children, ...rest } = props ?? {};
  const attr = (key != null ? { ...rest, key } : rest) as DOMAttr;
  const ctx: DOMContext[] = Array.isArray(children)
    ? children
    : children === undefined
      ? []
      : [children];

  return dom(type, attr, ...ctx);
}

/**
 * Compile target for a JSX element with zero or one child.
 *
 * Bun and TypeScript call this from automatic-runtime output; it renders the
 * element through {@link dom} and returns the same promise.
 */
export function jsx(type: JsxType, props: JsxProps | null, key?: unknown): Promise<DOM> {
  return create(type, props, key);
}

/**
 * Compile target for a JSX element with multiple static children.
 *
 * Behaves like {@link jsx}: array `children` are forwarded as rest arguments.
 */
export function jsxs(type: JsxType, props: JsxProps | null, key?: unknown): Promise<DOM> {
  return create(type, props, key);
}

/**
 * Development-runtime compile target.
 *
 * Identical to {@link jsx}; the source/self debugging arguments are accepted
 * for compatibility and ignored.
 */
export function jsxDEV(
  type: JsxType,
  props: JsxProps | null,
  key?: unknown,
  _isStatic?: boolean,
  _source?: unknown,
  _self?: unknown,
): Promise<DOM> {
  return create(type, props, key);
}

/**
 * JSX fragment component (`<>…</>`).
 *
 * Null or omitted attributes are accepted because the automatic runtime does
 * not pass a props object for fragments.
 */
export function Fragment(attr?: DOMAttr | null, ...ctx: DOMContext[]): Promise<DOM> {
  return frag(attr ?? {}, ...ctx);
}

/**
 * JSX types resolved by TypeScript from the `jsxImportSource` module when the
 * automatic runtime is enabled.
 *
 * Mirrors the global `JSX` namespace declared by the renderer.
 */
export namespace JSX {
  export type Element = maybePromise<DOM>;
  export interface IntrinsicElements extends ElementAttributes, SVGAttributes {}
  /**
   * Allows JSX children on components whose props type does not declare
   * `children`.
   *
   * The automatic runtime type-checker merges children into the attribute
   * object; Yvee forwards them to components as rest arguments, never on
   * `props`, so this only satisfies the attribute merge.
   */
  export interface IntrinsicAttributes {
    children?: unknown;
  }
}

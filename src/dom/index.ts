import { CATT } from "./cat";
import { Stateful } from "@@/stateful";
import type { Elements } from "@$";

import { CTX } from "./ctx";
import { OZ } from "./oz";
import { Idm } from "@coff-r/x/html";
import { isFunction, type maybePromise, type V } from "@coff-r/x";
import {
  ATTR,
  type c_events,
  type EAttr,
  type ElementAttributes,
  type SVGAttributes,
} from "./attr";

export type { aAttr, buttonAttr } from "./attr";

/*
-------------------------

-------------------------
*/

export async function MainDom(_dom: DOM, id: string) {
  return await renderDom(_dom, new Idm(id));
}

export interface renderedDom {
  ctx: string;
  oz: OZ;
  id: string | undefined;
}

export async function renderDom(
  Dom: DOM,
  pid: Idm | string = new Idm(),
): Promise<renderedDom> {
  const { tag, attr, ctx } = await Promise.resolve(Dom);

  const _pid = pid instanceof Idm ? pid : new Idm(pid);
  const id = _pid.nextId;
  const catt = new CATT(id, _pid);
  const _attr = new ATTR(attr);
  const _ctx = new CTX(tag, ctx);

  _attr.get(catt);

  return {
    ctx: await _ctx.get(catt),
    oz: catt.OZ.set(catt),
    id: catt.id,
  };
}

export class DOM {
  constructor(
    public tag: string,
    public attr: attr,
    public ctx: ctx[],
  ) {}
}

export async function dom(
  tag: string | ((attr: attr, ...ctx: ctx[]) => maybePromise<DOM>),
  attr: attr | null = {},
  ...ctx: ctx[]
) {
  if (isFunction(tag)) {
    return await tag(attr ?? {}, ...ctx);
  }
  return new DOM(tag, attr ?? {}, ctx);
}

export const frag = async (attr: attr, ...ctx: DOM[]): Promise<DOM> =>
  new DOM("", {}, ctx);

declare global {
  type events<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?: (
      this: T,
      e: GlobalEventHandlersEventMap[P],
    ) => void;
  } & c_events<T>;
  type DVal<T = V | V[]> = T | Stateful<T> | undefined;
  type dom = DOM;
  type ctx<T = DVal | dom> = maybePromise<T | Stateful<T> | ctx[]>;
  type obj<T> = Record<string, T>;
  type DomFN<T = {}> = (a: attr & T, ...D: ctx[]) => maybePromise<dom>;
  type attr = EAttr;

  namespace JSX {
    type Element = maybePromise<dom>;

    interface IntrinsicElements extends ElementAttributes, SVGAttributes {}
  }
}

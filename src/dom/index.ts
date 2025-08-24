import { idm, isFN, log, maybePromise, V } from "../@";
import { CATT } from "./cat";
import { Stateful } from "../stateful";
import { Elements } from "./$";
import {
  ATTR,
  c_events,
  EAttr,
  ElementAttributes,
  SVGAttributes,
} from "./attr";
import { CTX } from "./ctx";
import { OZ } from "./oz";

export * from "./$";
export * from "./oz";
export * from "./cat";

export type { aAttr, buttonAttr } from "./attr";

/*
-------------------------

-------------------------
*/

export async function MainDom(_dom: Dom, id: string) {
  return await renderDom(_dom, new idm(id));
}

export interface renderedDom {
  ctx: string;
  oz: OZ;
  id?: string;
}

export async function renderDom(
  Dom: dom,
  pid: idm | string = new idm(),
): Promise<renderedDom> {
  const { tag, attr, ctx } = Dom;

  const _pid = pid instanceof idm ? pid : new idm(pid);
  const id = _pid.mid;
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

export class Dom {
  constructor(
    public tag: string,
    public attr: attr,
    public ctx: ctx[],
  ) {}
}

export async function dom(
  tag: string | ((attr: attr, ...ctx: ctx[]) => maybePromise<Dom>),
  attr: attr | null = {},
  ...ctx: ctx[]
) {
  if (isFN(tag)) {
    return await tag(attr ?? {}, ...ctx);
  }
  return new Dom(tag, attr ?? {}, ctx);
}

export const frag = async (attr: attr, ...ctx: Dom[]): Promise<Dom> =>
  new Dom("", {}, ctx);

declare global {
  type events<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?: (
      this: T,
      e: GlobalEventHandlersEventMap[P],
    ) => void;
  } & c_events<T>;
  type DVal<T = V | V[]> = T | Stateful<T> | undefined;
  type dom = Dom;
  type ctx<T = DVal | dom> = T | Stateful<T> | ctx[];
  type obj<T> = Record<string, T>;
  type DomFN<T = {}> = (a: attr & T, ...D: ctx[]) => maybePromise<dom>;
  type attr = EAttr;

  namespace JSX {
    type Element = maybePromise<dom>;

    interface IntrinsicElements extends ElementAttributes, SVGAttributes {}
  }
}

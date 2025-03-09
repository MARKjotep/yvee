import { $$, idm, isFN, readOnly, V } from "../@";
import { ATTR } from "./attr";
import { CATT } from "../oz";
import { CTX } from "./context";
import { Stateful } from "../stateful";
import { Elements } from "../storage";
import { hookFN } from "../stateful/hook";
import { _useElement } from "../$";

export { attr_value } from "./attr";
/*
-------------------------
TYPES
-------------------------
*/
type X2 = V | V[];

export type X3 = X2 | Stateful<X2>;

export type CSSinT = {
  [P in keyof CSSStyleDeclaration]?: X3;
} & {
  [key: string]: X3;
};

export interface c_events {
  watch?: (
    this: Elements,
    e: Elements,
  ) => [(...args: any[]) => void, Stateful<any> | Stateful<any>[], boolean?];
  ready?: (this: Elements, e: Elements) => void;
  resize?: (this: Elements, e: UIEvent) => void;
  beforeunload?: (this: Elements, e: BeforeUnloadEvent) => void;
  popstate?: (this: Elements, e: PopStateEvent) => void;
  winscroll?: (this: Elements, e: Event) => void;
  winload?: (this: Elements, e: Event) => void;
  winfocus?: (this: Elements, e: Event) => void;
  winblur?: (this: Elements, e: Event) => void;
}

type XU4 = V | undefined | XU4[];

export interface baseAttr {
  style?: CSSinT;
  on?: events;
  id?: string;
  class?: XU4 | Stateful<X2>;
  ref?: _useElement;
}

export class Dom {
  declare private attr: ATTR;
  declare private ctx: CTX;
  constructor(
    public tag: string,
    attr: attr = {},
    ...ctx: ctx[]
  ) {
    readOnly(this, {
      attr: new ATTR(attr),
      ctx: new CTX(tag, ctx),
    });
  }
  __(pid = new idm()) {
    const id = pid.mid;
    const catt = new CATT(id, pid);
    this.attr.get(catt);

    return {
      ctx: this.ctx.get(catt),
      oz: catt.OZ.set(catt),
      id: catt.id,
    };
  }
}

export function dom(
  tag: string | ((attr: attr, ...ctx: ctx[]) => Dom),
  attr: attr | null = {},
  ...ctx: ctx[]
) {
  // Process the ctx here to lessen the time -- convert them all to flat array?
  //
  if (isFN(tag)) {
    return tag(attr ?? {}, ...ctx);
  }
  // if ctx is array, flatten or use rest operator
  return new Dom(tag, attr ?? {}, ctx);
}

export const frag = (attr: attr, ...dom: Dom[]): Dom[] => dom;

/*
  -------------------------
  
  -------------------------
  */
//

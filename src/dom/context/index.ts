import { dom, Dom } from "..";
import { idm, isArr, isAsync, isFN, isObj, isPromise, ngify, V } from "../../@";
import { CATT, Wizard } from "../../oz";
import { Stateful } from "../../stateful";
import { Elements, getElementById } from "../../storage";

const TAGS = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];
const hasTag = (tag: string) => TAGS.includes(tag);

function escapeHTML(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const ctx_value = (cc: any, catt: CATT): string => {
  if (isArr(cc)) {
    return cc.map((c) => ctx_value(c, catt)).join("");
  } else if (cc instanceof Dom) {
    const ND = cc.__(catt.IDM);
    const { ctx, oz } = ND;
    catt.OZ.push(oz);
    return ctx;
  } else if (isObj(cc)) {
    return ngify(cc);
  } else if (isFN(cc)) {
    return ctx_value((cc as any)(), catt);
  } else if (cc !== undefined && cc !== null) {
    return escapeHTML(cc);
  }
  return "";
};

export const processCTXStateful = (value: any, xid?: string) => {
  const ndm = new idm(xid);
  const catt = new CATT(ndm.id, ndm);
  const ctx = ctx_value(value, catt);
  return { ctx, catt };
};

function Callback(this: Elements, arg: ctx) {
  const elementId = this.id;
  if (elementId) {
    const { ctx, catt } = processCTXStateful(arg, elementId);
    if (this.innerHTML !== ctx) {
      this.innerHTML = ctx;

      Wizard.RPS(catt.OZ);
    }
  }
}

export const processCTX = (
  v: ctx,
  len: number,
  catt: CATT,
  inner: string[] = [],
) => {
  if (isArr(v)) {
    v.forEach((vv) => {
      processCTX(vv, v.length, catt, inner);
    });
  } else if (v instanceof Stateful) {
    if (len > 1) {
      processCTX(dom("div", {}, v), len, catt, inner);
    } else {
      const VL = v.value;
      const entry = VL instanceof Dom ? "dom" : "ctx";
      const { ctx, catt: _ct } = processCTXStateful(VL, catt.xid + "-0");
      catt.xid = _ct.xid;

      inner.push(ctx);
      catt.OZ.push(_ct.OZ);
      //
      catt.states.push(v.call(Callback, entry));
    }
  } else {
    inner.push(ctx_value(v, catt));
  }
};

//
export class CTX {
  closing: string;
  constructor(
    public tag: string,
    public ctx: ctx[],
  ) {
    const selfClosing = hasTag(tag);
    this.closing = selfClosing ? "" : `</${tag}>`;
  }

  private process(catt: CATT, ctx: any[] = this.ctx, inner: string[] = []) {
    ctx.forEach((ct) => {
      processCTX(ct, ctx.length, catt, inner);
    });
    return inner.join("");
  }
  get(catt: CATT) {
    const ctx = this.process(catt);

    if (catt.events.size || catt.states.length) {
      catt.id = catt.xid;
    }
    //
    return `<${this.tag}${catt.attr}>${ctx}${this.closing}`;
  }
}

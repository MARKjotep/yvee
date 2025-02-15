import { ctx, dom, Dom } from "..";
import { $$, idm, isArr, isFN, isObj, ngify, V } from "../../@";
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
    return String(cc);
  }
  return "";
};

const processCTXStateful = (xid: string, value: any) => {
  const ndm = new idm(xid);
  const catt = new CATT(ndm.id, ndm);
  const ctx = ctx_value(value, catt);
  return { ctx, catt };
};

function Callback(this: Elements, arg: ctx) {
  const elementId = this.id;
  if (elementId) {
    const { ctx, catt } = processCTXStateful(elementId, arg);
    if (this.innerHTML !== ctx) {
      this.innerHTML = ctx;

      Wizard.RPS(catt.OZ);
    }
  }
}

const processCTX2 = (v: ctx, len: number, catt: CATT, inner: string[] = []) => {
  if (isArr(v)) {
    v.forEach((vv) => {
      processCTX2(vv, v.length, catt, inner);
    });
  } else if (v instanceof Stateful) {
    if (len > 1) {
      processCTX2(dom("div", {}, v), len, catt, inner);
    } else {
      const VL = v.value;
      const entry = VL instanceof Dom ? "dom" : "ctx";
      const { ctx, catt: _ct } = processCTXStateful(catt.xid + "-0", VL);
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
      processCTX2(ct, ctx.length, catt, inner);
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

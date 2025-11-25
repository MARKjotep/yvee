import {
  idm,
  isArr,
  isAsync,
  isFN,
  isObj,
  isPromise,
  log,
  ngify,
  V,
} from "../../@";
import { Wizard } from "../oz";
import { Stateful } from "../../stateful";
import { dom, DOM, Elements, renderDom } from "..";
import { CATT } from "../cat";

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

const ctx_value = async (cc: any, catt: CATT): Promise<string> => {
  cc = await Promise.resolve(cc);
  if (isArr(cc)) {
    const results: string[] = [];
    for (const c of cc) {
      results.push(await ctx_value(c, catt));
    }
    return results.join("");
  } else if (cc instanceof DOM) {
    const { ctx, oz } = await renderDom(cc, catt.IDM);
    catt.OZ.push(oz);
    return ctx;
  } else if (isObj(cc)) {
    if (cc instanceof Set) {
      return [...cc].join(" ");
    }
    return ngify(cc);
  } else if (isFN(cc)) {
    return await ctx_value((cc as any)(), catt);
  } else if (cc !== undefined && cc !== null) {
    return escapeHTML(cc);
  }
  return "";
};

export const processCTXStateful = async (value: any, xid?: string) => {
  const ndm = new idm(xid);
  const catt = new CATT(ndm.id, ndm);
  const ctx = await ctx_value(value, catt);
  return { ctx, catt };
};

async function Callback(this: Elements, arg: ctx) {
  const elementId = this.id;
  if (elementId) {
    const { ctx, catt } = await processCTXStateful(arg, elementId);
    if (this.innerHTML !== ctx) {
      this.innerHTML = ctx;

      Wizard.RPS(catt.OZ);
    }
  }
}

export const processCTX = async (
  v: ctx,
  len: number,
  catt: CATT,
  inner: string[] = [],
) => {
  if (isArr(v)) {
    for (const vv of v) {
      await processCTX(vv, v.length, catt, inner);
    }
  } else if (v instanceof Stateful) {
    if (len > 1) {
      await processCTX(await dom("div", {}, v), len, catt, inner);
    } else {
      const VL = v.value;
      const entry = VL instanceof DOM ? "dom" : "ctx";
      const { ctx, catt: _ct } = await processCTXStateful(VL, catt.xid + "-0");
      catt.xid = _ct.xid;

      inner.push(ctx);
      catt.OZ.push(_ct.OZ);
      //
      catt.states.push(v.call(Callback, entry));
    }
  } else {
    inner.push(await ctx_value(v, catt));
  }
};

//
export class CTX {
  closing: string;
  constructor(
    public tag: string = "",
    public ctx: ctx[],
  ) {
    const selfClosing = hasTag(tag);
    this.closing = selfClosing ? "" : `</${tag}>`;
  }

  private async process(
    catt: CATT,
    ctx: any[] = this.ctx,
    inner: string[] = [],
  ) {
    for (const ct of ctx) {
      await processCTX(await Promise.resolve(ct), ctx.length, catt, inner);
    }
    return inner.join("");
  }
  async get(catt: CATT) {
    const ctx = await this.process(catt);

    if (!this.tag) return ctx;

    if (catt.events.size || catt.states.length) {
      catt.id = catt.xid;
    }
    //
    return `<${this.tag}${catt.attr}>${ctx}${this.closing}`;
  }
}

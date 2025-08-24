import { Yvee } from "..";
import {
  _htmlHead,
  head,
  headAttr,
  headType,
  htmlHead,
  isArr,
  isFN,
  isModule,
  isNotWindow,
  log,
  oAss,
  V,
} from "../../@";
import { maybePromise } from "../../@";
import { aAttr, dom } from "../../dom";
import { LINK } from "./link";
import { META } from "./meta";
import { SCRPT } from "./script";

export interface docObj {
  args?: obj<any>;
  data?: obj<any>;
}

export class doc<T extends docObj = obj<obj<any>>> extends head {
  path: string = "";
  data: T["data"] = {};
  args: T["args"] = {};
  importArgs: any[] | (() => any[]) = [];
  fetch?(): maybePromise<obj<any>>;
  head?(): maybePromise<void>;
  body?(): maybePromise<any>;
  static A = (a: aAttr, ...ctx: ctx[]) => {
    return dom("a", a || {}, ...ctx);
  };
}

export async function docLoader(
  this: Yvee,
  _doc: doc,
  isServer: boolean = false,
): Promise<[any[], headType]> {
  if (!isServer && _doc.fetch) {
    oAss(_doc.data, await _doc.fetch());
  }

  return [
    await getBody(await _doc.body?.(), _doc.importArgs),
    getHeads.call(this, _doc),
  ];
}

export async function getBody(
  v?: any,
  args: any[] | (() => any[]) = [],
): Promise<any[]> {
  let val: any = v || "";
  if (isModule(v)) {
    const vd = v.default;
    const _args = isFN(args) ? args() : args;
    val = isFN(vd) ? await vd.apply({}, _args) : vd;
  }
  return isArr(val) ? val : [val];
}

function getHeads(this: Yvee, _doc: doc) {
  const mh = new htmlHead({
    push: { rt: this.id },
  });

  mh.htmlHead = structuredClone(this.htmlHead);

  mh.head(_doc as headAttr);

  return mh.htmlHead;
}

export async function headLoader(head: headType, id: string) {
  //

  document.title = head.get("title") || "";

  Unload(await LINK(head.get("link"), id));
  Unload(await SCRPT(head.get("script")));
  const unl = await META(head.get("meta"));
  Unload(unl);
}

export const Unload = (un: (() => void)[]) => {
  un.forEach((un) => un());
};

export function pushHistory(path?: string, title?: string) {
  const { pathname, hash } = window.location;
  const cURL = pathname + hash;

  if (path && cURL !== path) {
    history.pushState({}, title ?? "", path);
  }
}

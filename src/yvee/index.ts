import { serverRender, Dom, renderConfig } from "..";
import { $, _$ } from "../$";
import {
  head,
  idm,
  _htmlHead,
  headAttr,
  oLen,
  obj,
  makeID,
  isWindow,
  oAss,
  Mapper,
  headType,
  isNotWindow,
  log,
  isArr,
  isFN,
  htmlHead,
  matchPath,
  V,
  getAttr,
} from "../@";
import { processCTX } from "../dom/context";
import { CATT, Wizard } from "../oz";
import { State } from "../stateful";
import { HTML } from "./html";
import { getErrorCode, Pager, routeHeads } from "./pager";

export { doc } from "./body";
export { websocket } from "./wss";
export { pushHistory } from "./head";
export { Pager } from "./pager";

export interface routerCfg {
  classes?: string | string[];
  id?: string;
  base?: string;
}

export interface yveeCfg extends routerCfg {
  pushState?: boolean;
}

export const YveePath = State("");

export class Yvee extends Pager {
  protected isYvee = true;
  protected unload: boolean = true;
  constructor(
    protected config: yveeCfg = {},
    events: events = {},
  ) {
    super(config, events);
    //
    this.path = YveePath;

    this.load = async (path?: string, data: obj<string> = {}) => {
      if (isWindow) {
        path = getMetaYvee() || this._base(path ?? "/");
      }

      if (this.hook) this.hook();

      if (path) {
        this.path.value = path;
        this.lastPath.value = path;
        try {
          await this.render(path, 404, data);
          this.hooker();
        } catch (e) {
          log.e = ["render error", { error: "Yvee loader" }];
        }
      }
      return this;
    };
  }
}

export const Routes = (fn: (Yvee: Yvee) => void) => {
  return (Yvee: Yvee) => {
    fn(Yvee);
  };
};

function getMetaYvee() {
  if (isWindow) {
    return $(`meta[name="yvee"]`)?.attr.get("content") ?? "/";
  }
  return "";
}

const addMeta = (
  _hds: headAttr,
  path: string,
  status?: number,
  addYvee: boolean = false,
) => {
  const mt = [];

  // Add viewport
  mt.push({ charset: "utf-8" });
  mt.push({
    name: "viewport",
    content: "width=device-width, initial-scale=1.0",
  });

  if (status) {
    switch (status) {
      case 404:
        mt.push({ name: "error", content: status.toString() });
        break;
      default:
        break;
    }
  }
  if (addYvee) {
    mt.push({ name: "yvee", content: path });
  }

  if (_hds.meta) {
    if (isArr(_hds.meta)) {
      _hds.meta.unshift(...mt);
    } else {
      _hds.meta.push(mt);
    }
  } else {
    _hds.meta = mt;
  }
};

const getCTX = async (
  id: string,
  DOM: ND<any>,
  data = {},
  inner: string[] = [],
) => {
  const DM = await DOM(data);
  const IR = isArr(DM) ? DM : [DM];
  const CTT = new CATT(id, new idm(id));
  IR.forEach((fr) => {
    processCTX(fr, IR.length, CTT, inner);
  });
  CTT.OZ.set(CTT);
  return CTT.OZ;
};

interface headAttrPlus {
  route?: string;
  base?: string;
  index?: string;
  id?: string;
  bodyattr?: obj<V>;
  data?:
    | Record<string, any>
    | (() => Promise<Record<string, any>> | Record<string, any>);
}

type headFN<T = {}> = (
  a: Record<string, any> & T,
) => Promise<headAttr> | headAttr;

type ND<T = Record<string, any>> = (a: renderConfig & T) => Dom | Promise<Dom>;

export async function Render<T = Record<string, any>>(
  DOM: ND<T>,
  head?: headAttr | headFN<T>,
  cfg?: headAttrPlus,
): Promise<({ path, data, status }: serverRender) => Promise<string>>;
export async function Render<T = Record<string, any>>(
  DOM: ND<T>,
  App: Yvee,
): Promise<({ path, data, status }: serverRender) => Promise<string>>;

export async function Render<T = Record<string, any>>(
  DOM: ND<T>,
  YHead?: Yvee | headAttr | headFN<T>,
  cfg: headAttrPlus = {},
) {
  //
  const { bodyattr = {}, id, route, base = "", index, data } = cfg;
  if (isWindow) {
    let _data: Record<string, string> = {};
    const bodyElement = document.body.id;
    if (YHead) {
      if (YHead instanceof Yvee) {
        await YHead.load();
      } else {
        if (data) {
          if (isFN(data)) {
            _data = await data();
          } else {
            _data = data;
          }
        }
        let wlen = window.location.pathname;
        oAss(_data, {
          path: wlen,
          status: getErrorCode(),
        });

        if (route) {
          //
          if (route.length > 1 && route.slice(-1) !== "/") {
            wlen = wlen.replace(/^\/|\/$/g, "");
          }

          oAss(_data, matchPath(wlen, route));
        }
      }
    }
    const OZ = await getCTX(bodyElement, DOM, _data);
    Wizard.push(OZ);
    requestAnimationFrame(() => {
      Wizard.stage;
    });
  }

  return async ({ path, data = {}, status = 200 }: serverRender) => {
    //
    let _ID = makeID(4);
    let _HD: headType = new Mapper();
    let _hds: headAttr = {};

    if (id) _ID = id;
    if (bodyattr.id) _ID = bodyattr.id.toString();

    let _lang = "en";

    if (YHead instanceof Yvee) {
      const { base, path: pt, id, lang } = YHead;

      _hds.base = [
        {
          href: base === "/" ? base : `${base}/`,
          target: "_blank",
        },
      ];

      if (_hds.script) {
        _hds.script.push({
          type: "module",
          src: "./index.js",
        });
      } else {
        _hds.script = [
          {
            type: "module",
            src: "./index.js",
          },
        ];
      }

      pt.value = path;
      addMeta(_hds, path, status, true);
      const { heads } = await YHead.render(path, status, data, _hds, false);

      routeHeads.values().forEach((rr) => {
        oAss(heads.init("link", {}), rr.get("link") ?? {});
      });

      _ID = id;
      _HD = heads;
      _lang = lang;
    } else {
      let pt = path === "/" ? path : `${path}/`;
      if (index) {
        pt = `${index}/`;
      }
      if (base) {
        pt = `${base}${pt}`;
      }

      _hds.base = [
        {
          href: pt,
          target: "_self",
        },
      ];

      if (_hds.script) {
        _hds.script.push({
          type: "module",
          src: "./index.js",
        });
      } else {
        _hds.script = [
          {
            type: "module",
            src: "./index.js",
          },
        ];
      }

      if (route) {
        oAss(data, matchPath(path, route));
      }
      oAss(data, { status, path, base });

      oAss(_hds, isFN(YHead) ? await YHead(data as any) : YHead);

      addMeta(_hds, path, status);

      const rh = new htmlHead();
      rh.head(_hds);
      _HD = rh.htmlHead;
    }

    const INNR: string[] = [];
    await getCTX(_ID, DOM, data, INNR);

    return new HTML(_lang, _HD).body(INNR.join(""), _ID, getAttr(bodyattr));
  };
}

import { $, _$ } from "../$";
import {
  head,
  idm,
  _htmlHead,
  headAttr,
  oLen,
  obj,
  isPlainObject,
  makeID,
  isWindow,
  oAss,
  Mapper,
  headType,
  isNotWindow,
  log,
  isArr,
} from "../@";
import { dom, frag, Dom, CSSinT } from "../dom";
import { CTX, processCTX } from "../dom/context";
import { CATT, Wizard } from "../oz";
import { State, Stateful, stateHook } from "../stateful";
import { minClient } from "../storage";
import { defaultError, doc } from "./body";
import { processHead, pushHistory } from "./head";
import { HTML } from "./html";
import { socket } from "./wss";

export { doc } from "./body";
export { websocket } from "./wss";
export { pushHistory } from "./head";

function HREF(
  a: attr & {
    href: string;
    topRef?: Stateful<_$>;
    top?: number | (() => number);
  },
  D: ctx[],
  path: Stateful<string>,
  last: Stateful<string>,
) {
  const { on, top: _tp, topRef, ..._a } = a;
  const _e: events = {
    ...((on as events) ?? {}),
    click(e) {
      e.preventDefault();
      const _E = $(this);
      const PT = _E.path;

      last.value = path.value;
      path.value = PT;

      //
      const HS = _E.hash;
      if (HS) {
        const _HS = $(HS);
        let top = window.scrollY;
        if (_HS) {
          top += _HS.rect.top;
        }
        if (topRef) {
          top -= topRef?.value?.e.offsetHeight || 0;
        }
        if (_tp) {
          if (typeof _tp === "number") {
            top -= _tp;
          } else {
            top -= _tp();
          }
        }
        window.scrollTo({
          top,
          behavior: "smooth",
        });

        pushHistory(PT + HS);
      } else if (last.value === path.value) {
        window.scrollTo({
          top: _E.rect.top || 0,
          behavior: "smooth",
        });
        pushHistory(window.location.pathname);
      }
    },
  };
  return dom("a", { ..._a, on: { ..._e } }, ...D);
}

function MAIN(r: Pager, a: attr, isYvee: boolean) {
  const { classes } = r["config"];
  const { on: __, ...aa } = a;
  //
  const _e: events = {
    ...((a.on as events) ?? {}),
    ...(isYvee && {
      popstate(e) {
        const targ = e.target as Window;
        const tloc = targ.location.pathname;
        r.path.value = tloc;
      },
    }),
    ...{
      element(e: any) {
        r.mainElement = this as HTMLElement;
      },
    },
  };

  return dom(
    "div",
    { ...aa, ...(classes && { class: classes }), on: _e },
    r["root"] as any,
  );
}

export interface routerCfg {
  classes?: string | string[];
  id?: string;
  base?: string;
}

export interface yveeCfg extends routerCfg {
  pushState?: boolean;
}

let routeHeads = new Mapper<string, headType>();

export class Pager extends minClient {
  protected unload: boolean = false;
  protected hook?: () => void;
  protected root = State<ctx[]>([]);
  protected socket: socket;
  id: string = makeID(4);
  path = State("");
  lastPath = State("");
  loading = State(false);
  mainElement?: HTMLElement;
  A: (
    a: attr & {
      href: string;
      topRef?: Stateful<_$>;
      top?: number | (() => number);
    },
    ...D: ctx[]
  ) => Dom;
  Main: (a: attr) => Dom;
  load: (path?: string, data?: obj<string>) => Promise<this>;
  matchPath: (str: string) => boolean;
  protected isYvee = false;
  constructor(
    protected config: routerCfg = {},
    events: events = {},
  ) {
    super(config.base ?? "");
    this.socket = new socket(this);
    //
    if (config.id) {
      this.id = config.id;
    }
    this.A = (a: attr & { href: string }, ...D: ctx[]) => {
      if (this.base) {
        if (!a.href.startsWith(this.base)) {
          a.href = this._base(a.href);
        }
      }
      return HREF(a, D, this.path, this.lastPath);
    };
    this.Main = (a: attr) => {
      if (oLen(events)) {
        if (!a.on) {
          a.on = events;
        } else {
          oAss(a.on, events);
        }
      }
      return MAIN(this, a, this.isYvee);
    };
    this.load = async (path?: string, data: obj<string> = {}) => {
      if (this.hook) this.hook();
      if (path) {
        this.path.value = path;
        this.lastPath.value = path;
        try {
          await this.render(path, 404, data);
          this.hooker();
        } catch (e) {
          log.e = ["render error", { error: "Pager loader" }];
        }
      }
      return this;
    };

    this.matchPath = (str: string): boolean => {
      const BK = this._base(str);
      const PT = this.path.value;
      const BS = this.base;

      if (PT === BK) {
        return true;
      } else {
        const PTR = PT.replace(BS, "");
        const BKR = BK.replace(BS, "");
        if (BKR) {
          if (PTR.startsWith(BKR)) {
            return true;
          }
        } else {
          if (!PT) {
            return true;
          }
        }
      }
      return false;
    };
  }
  protected hooker() {
    const RTscrolls: obj<number> = {};
    const YRAscrolls: obj<number> = {};
    let lastURL = this.path.value;
    if (this.hook) this.hook();

    this.hook = stateHook(
      async (nav) => {
        //
        YRAscrolls[lastURL] = window.scrollY;
        RTscrolls[lastURL] = this.mainElement?.scrollTop ?? 0;

        if ((await this.render(nav, 404)).done) {
          const scrl = YRAscrolls[nav] ?? 0;
          if (scrl) {
            window.scrollTo({ top: scrl, behavior: "instant" });
          }
          const RTscrl = RTscrolls[nav] ?? 0;
          if (RTscrl) {
            this.mainElement?.scrollTo({
              top: RTscrl,
              behavior: "instant",
            });
          }

          lastURL = nav;
        }
      },
      [this.path],
      { id: "router" },
    );
  }

  protected async class(
    this: Pager,
    _path: string,
    _error: number,
    isError: boolean = false,
  ) {
    const [clientP, args] = await this.getPath(_path);
    if (clientP && !isError) {
      const { cls, id } = clientP;
      return new cls(_path, args, id);
    } else {
      return await loadERROR.call(this, _path, 404);
    }
  }

  protected async fetch(CL?: doc<{}>) {
    if (CL) {
      try {
        if (CL.fetch) {
          const dt = await CL.fetch();
          if (isPlainObject(dt) && oLen(dt)) {
            CL.data = dt;
          }
        }
      } catch (e) {
        log.e = ["class fetch", { error: "fetch" }];
      }
    }
  }

  protected async processHead(CL?: doc<{}>, head: headAttr = {}) {
    const headAttrs = CL
      ? await this.processClassHead(CL, head)
      : await this.processDefaultHead(head);

    return headAttrs;
  }

  private async processClassHead(CL: doc<{}>, head: headAttr) {
    if (CL.head) {
      await CL.head();
    }
    return CL.getHeadAttr(head, this.htmlHead);
  }

  private async processDefaultHead(head: headAttr) {
    const rh = new _htmlHead();
    if (oLen(head)) rh.head = head;
    rh.head.map(this.htmlHead);
    return rh.head;
  }

  async render(
    _path: string,
    _error: number = 404,
    data: obj<string> = {},
    head: headAttr = {},
    isClient = true,
    isError = false,
  ) {
    const CL = await this.class(_path, _error ?? getErrorCode(), isError);
    CL.data = data;

    await this.fetch(CL);

    const heads = await this.processHead(CL, head);
    //
    if (isNotWindow) {
      routeHeads.set(this.id, heads);
    }

    if (!CL) {
      return {
        lang: this.lang,
        heads,
        done: false,
      };
    }

    let DOM = [];

    this.loading.value = true;

    if (this.unload) {
      DOM = await CL.loader();
    }

    let unloader: (() => void)[] = [];

    if (isClient) {
      unloader = await processHead.call(
        this,
        heads,
        CL?.lang || this.lang,
        this.unload,
      );
    }

    if (!this.unload) {
      DOM = await CL.loader();
      unloader.forEach((un) => un());
    }

    if (this.unload) {
      unloader.forEach((un) => un());
    }

    //
    if (DOM.length) {
      this.root.value = DOM;
    } else {
      await this.render(_path, _error, data, head, isClient, true);
    }

    this.loading.value = false;

    return { heads, lang: CL.lang ?? this.lang, done: true };
  }
}

async function loadERROR(this: Pager, _path: string, _error: number) {
  const [clientP, args] = await this.loadError(_error ?? 0);
  if (clientP) {
    const { cls, id } = clientP;
    return new cls(_path, args, id, _error);
  } else {
    const ndoc = new defaultError(_path, args, makeID(5));
    ndoc.title = `error ${_error}`;
    return ndoc;
  }
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

    this.head({
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ],
    });

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

function getErrorCode() {
  if (isWindow) {
    return parseInt($(`meta[name="error-code"]`)?.attr.get("content") ?? "404");
  }
  return 404;
}

function getMetaYvee() {
  if (isWindow) {
    return $(`meta[name="yvee"]`)?.attr.get("content") ?? "/";
  }
  return "";
}

const addMeta = (_hds: headAttr, path: string, status?: number) => {
  const mt = [];
  if (status) {
    switch (status) {
      case 404:
        mt.push({ name: "error-code", content: status.toString() });
        break;
      default:
        break;
    }
  }
  mt.push({ name: "yvee", content: path });

  _hds.meta = mt;
};

// type RouteType = (path: string) => <Q extends typeof doc<{}>>(f: Q) => Q;
export const Routes = (fn: (Yvee: Yvee) => void) => {
  return (Yvee: Yvee) => {
    fn(Yvee);
  };
};

const getCTX = (id: string, DOM: () => Dom, inner: string[] = []) => {
  const DM = DOM();
  const IR = isArr(DM) ? DM : [DM];
  const CTT = new CATT(id, new idm(id));
  IR.forEach((fr) => {
    processCTX(fr, IR.length, CTT, inner);
  });
  CTT.OZ.set(CTT);
  return CTT.OZ;
};

export async function Render(App: Yvee, DOM: () => Dom) {
  if (isWindow) {
    await App.load();
    const bodyElement = document.body.id;
    const OZ = getCTX(bodyElement, DOM);
    Wizard.push(OZ);
    requestAnimationFrame(() => {
      Wizard.stage;
    });
  }

  return async ({
    path,
    data = {},
    status = 200,
    attr = "",
  }: {
    path: string;
    data?: Record<string, string>;
    status?: number;
    attr?: string;
  }) => {
    //

    const { base } = App;

    const _hds: headAttr = {
      base: [
        {
          href: base === "/" ? base : `${base}/`,
          target: "_blank",
        },
      ],
      script: [
        {
          type: "module",
          src: `index.js`,
        },
      ],
    };

    addMeta(_hds, path, status);

    App.path.value = path;

    const { lang, heads } = await App.render(path, status, data, _hds, false);

    routeHeads.values().forEach((rr) => {
      oAss(heads.init("link", {}), rr.get("link") ?? {});
    });

    const INNR: string[] = [];
    getCTX(App.id, DOM, INNR);

    return new HTML(lang, heads).body(INNR.join(""), App.id, attr);
  };
}

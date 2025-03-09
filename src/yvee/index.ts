import { $ } from "../$";
import {
  $$,
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
  addBASE,
} from "../@";
import { dom, frag, Dom, CSSinT } from "../dom";
import { Wizard } from "../oz";
import { State, Stateful, stateHook } from "../stateful";
import { getElementById, minClient } from "../storage";
import { defaultError, doc } from "./body";
import { processHead, pushHistory } from "./head";
import { HTML } from "./html";
import { socket } from "./wss";

export { doc } from "./body";
export { websocket } from "./wss";

function HREF(
  a: attr & { href: string },
  D: ctx[],
  path: Stateful<string>,
  last: Stateful<string>,
) {
  const _e: events = {
    ...((a.on as events) ?? {}),
    click(e) {
      e.preventDefault();
      last.value = path.value;
      path.value = $(this).path;
    },
  };
  delete a.on;
  return dom("a", { ...a, on: { ..._e } }, ...D);
}

function MAIN(r: Router, a: attr, isYRA: boolean) {
  const { classes } = r["config"];
  const { on: __, ...aa } = a;
  //
  const _e: events = {
    ...((a.on as events) ?? {}),
    ...(true && {
      popstate(e) {
        const targ = e.target as Window;
        const tloc = targ.location.pathname;
        if (tloc.includes(r.base)) {
          r.path.value = targ.location.pathname;
        }
      },
      element(e: any) {
        r.mainElement = this as HTMLElement;
      },
    }),
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
  pushState?: boolean;
}

export interface yveeCfg extends routerCfg {}

export class Router extends minClient {
  protected unload: boolean = false;
  protected hook?: () => void;
  protected root = State<ctx[]>([]);
  protected socket: socket;
  id: string = makeID(4);
  path = State("");
  lastPath = State("");
  loading = State(false);
  mainElement?: HTMLElement;
  A: (a: attr & { href: string }, ...D: ctx[]) => Dom;
  Main: (a: attr) => Dom;
  load: (path?: string, data?: obj<string>) => Promise<this>;

  matchPath: (str: string) => boolean;
  constructor(
    protected config: routerCfg = {},
    protected isYRA = false,
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
      return MAIN(this, a, isYRA);
    };
    this.load = async (path?: string, data: obj<string> = {}) => {
      if (this.hook) this.hook();
      if (path) {
        this.path.value = path;
        this.lastPath.value = path;
        await this.render(this.path.value, 404, data);
        this.hooker();
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
    this: Router,
    _path: string,
    _error: number,
    isError: boolean = false,
  ) {
    const [clientP, args] = await this.getPath(_path);
    if (clientP && !isError) {
      const { cls, id } = clientP;

      return new cls(_path, args, id);
    } else {
      return await loadERROR.call(this, _path, _error);
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
        $$.p = e;
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

  protected async render(
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

    if (!CL) {
      return {
        lang: this.lang,
        heads,
        done: false,
      };
    }
    let CTX = [];

    this.loading.value = true;
    if (this.unload) {
      CTX = await CL.loader();
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
      unloader.forEach((un) => un());
      CTX = await CL.loader();
    }

    if (this.unload) {
      unloader.forEach((un) => un());
    }

    //

    //

    if (CTX.length) {
      this.root.value = CTX;
    } else {
      await this.render(_path, _error, data, head, isClient, true);
    }
    this.loading.value = false;

    return { heads, lang: CL.lang ?? this.lang, done: true };
  }
}

async function loadERROR(this: Router, _path: string, _error: number) {
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

export class Yvee extends Router {
  protected unload: boolean = true;
  constructor(
    protected ImportMeta: ImportMeta,
    protected config: yveeCfg = {},
    events: events = {},
  ) {
    super(config, true, events);
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
      }
      if (isWindow && path) {
        this.render(path, 404, data).then(() => {
          if (path && this.config.pushState) {
            pushHistory(path, document.title);
          }
          _WIZARD.call(this, this.Main({}));

          this.hooker();
        });
      }
      return this;
    };
  }

  async html({
    path,
    data = {},
    status = 200,
    attr = "",
  }: {
    path: string;
    data?: Record<string, string>;
    status?: number;
    attr?: string;
  }) {
    const { base, ImportMeta } = this;

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
          src: `${ImportMeta.file}`,
        },
      ],
    };

    addMeta(_hds, path, status);

    //

    this.path.value = path;

    const { lang, heads } = await this.render(path, status, data, _hds, false);

    const { ctx } = this.Main({}).__(new idm(this.id));

    return new HTML(lang, heads).body(ctx, this.id, attr);
  }
}

function _WIZARD(this: Router, loader: Dom) {
  const bodyElement = document.body.id;

  const { oz, id } = loader.__(new idm(bodyElement));

  this.id = id || this.id;
  //
  if (!oz) return;
  Wizard.push(oz);
  requestAnimationFrame(() => {
    Wizard.stage;
  });
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

type RouteType = (path: string) => <Q extends typeof doc<{}>>(f: Q) => Q;
export const Routes = (fn: (route: RouteType) => void) => {
  return (route: RouteType) => {
    fn(route);
  };
};

type ErrorType = (...codes: number[]) => <Q extends typeof doc<{}>>(f: Q) => Q;
export const Errors = (fn: (error: ErrorType) => void) => {
  return (error: ErrorType) => {
    fn(error);
  };
};

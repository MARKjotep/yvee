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
  isNotWindow,
  oAss,
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

function HREF(a: attr & { href: string }, D: ctx[], path: Stateful<string>) {
  const _e: events = {
    ...((a.on as events) ?? {}),
    click(e) {
      e.preventDefault();
      path.value = $(this).path;
    },
  };
  delete a.on;
  return dom("a", { ...a, on: { ..._e } }, ...D);
}

function MAIN(r: Router, a: attr & { load?: string }, isYRA: boolean) {
  const { classes } = r["config"];
  const { load: ld, on: __, ...aa } = a;
  //
  const _e: events = {
    ...((a.on as events) ?? {}),
    ...(!isYRA &&
      ld && {
        ready(e) {
          r.load(ld);
        },
      }),
    ...(isYRA && {
      popstate(e) {
        const targ = e.target as Window;
        r.path.value = targ.location.pathname;
      },
    }),
  };

  return dom(
    "div",
    { ...aa, ...(classes && { class: classes }), on: _e },
    r["root"] as any,
  );
}

export interface yveeCfg {
  pushState?: boolean;
  classes?: string | string[];
}

export class Router extends minClient {
  protected unload: boolean = false;
  protected hook?: () => void;
  protected root = State<ctx[]>([]);
  protected socket: socket;
  id: string = makeID(4);
  path = State("");
  A: (a: attr & { href: string }, ...D: ctx[]) => Dom;
  Main: (a: attr & { load?: string }) => Dom;
  load: (path?: string, data?: obj<string>) => Promise<this>;
  constructor(
    ImportMeta: ImportMeta,
    config: yveeCfg = {},
    private isYRA = false,
  ) {
    super(ImportMeta, config);
    this.socket = new socket(this);
    //
    this.A = (a: attr & { href: string }, ...D: ctx[]) => {
      return HREF(a, D, this.path);
    };
    this.Main = (a: attr) => {
      return MAIN(this, a, isYRA);
    };
    this.load = async (path?: string, data: obj<string> = {}) => {
      if (this.hook) this.hook();
      if (path) {
        this.path.value = path;
        await this.render(path, 404, data);
        this.hooker();
      }
      return this;
    };
  }
  protected hooker() {
    const scrolls: obj<number> = {};
    let lastURL = this.path.value;
    if (this.hook) this.hook();

    this.hook = stateHook(
      async (nav) => {
        //
        scrolls[lastURL] = window.scrollY;

        if ((await this.render(nav, 404)).done) {
          window.scrollTo({ top: scrolls[nav] ?? 0, behavior: "instant" });
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
      const { cls, path, id } = clientP;
      return new cls(path, args, id);
    } else {
      return loadERROR.call(this, _path, _error);
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
    if (isNotWindow) {
      this.path.value = _path;
    }
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

    const CTX = await CL.loader();

    if (isClient) {
      let unloader = await processHead.call(
        this,
        heads,
        CL?.lang || this.lang,
        this.unload,
      );
      if (isClient) unloader.forEach((un) => un());
    }

    //

    //

    if (CTX.length) {
      this.root.value = CTX;
    } else {
      await this.render(_path, _error, data, head, isClient, true);
    }

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
    ImportMeta: ImportMeta,
    { classes, pushState = true }: yveeCfg = {},
  ) {
    super(ImportMeta, { classes, pushState }, true);
    //
    this.path = YveePath;

    this.head({
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ],
    });

    this.load = async (
      path: string = location.pathname,
      data: obj<string> = {},
    ) => {
      if (this.hook) this.hook();
      if (path) {
        this.path.value = path;
      }
      if (isWindow) {
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
    const _hds: headAttr = {
      script: [
        {
          type: "module",
          src: this.ImportMeta.file,
        },
      ],
    };

    isError(_hds, status);
    //

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

const isError = (_hds: headAttr, status?: number) => {
  switch (status) {
    case 404:
      _hds.meta = [{ name: "error-code", content: status.toString() }];
      return;
    default:
      return;
  }
};

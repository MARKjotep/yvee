import { bind, isWindow, log, makeID, oAss } from "../@";
import type { headType, maybePromise } from "../@";
import { $, dom, MainDom, renderedDom, Wizard } from "../dom";
import type { aAttr, Dom } from "../dom";
import { State, Stateful, StateHook } from "../stateful";
import { doc, docLoader, headLoader } from "./doc";
import { PathHistory } from "./history";
import { HTML } from "./html";
import { Router } from "./router";

export { doc };
export { content } from "./content";
export { Tabs } from "./tabs";
export { PathHistory };
export { websocket, socket } from "./wss";

export interface renderConfig {
  class?: string | string[];
  id?: string;
  data?: any;
}

export interface serverRender {
  path: string;
  error?: number;
  data?: Record<string, any>;
}

interface _Yvee {
  base?: string;
  index?: string;
  history?: boolean;
  isDev?: boolean;
}

export class Yvee extends Router {
  declare yvee: Yvee;
  private isDev: boolean;
  history: PathHistory;
  constructor({ base, history, index, isDev = false }: _Yvee = {}) {
    super(base, index, history);
    const TH = this;
    this.isDev = isDev;
    this.history = new PathHistory(this.path, this.isDev);
    oAss(this, {
      get yvee() {
        return TH;
      },
    });
  }
  @bind Main(main?: (root: Stateful<any[]>) => maybePromise<dom>) {
    //
    this._main = main;
  }
  @bind async render(x: renderConfig = {}) {
    const { id, data, class: _class } = x;

    if (isWindow) {
      //
      let winloc = window.location.pathname;
      if (this.isDev) {
        winloc = winloc.replace(/\/+$/g, "");
      }
      this.path.value = winloc;
      //
      const bodyElement = document.body.id;
      this.id = bodyElement;

      const [_, RND] = await HeadAndCTX.call(this, this.path.value, _class);

      Wizard.push(RND.oz);

      requestAnimationFrame(() => {
        Wizard.stage;
        this.init(data);
      });

      return () => {};
    }
    /**
     *
     */
    return async ({ path, data = {}, error = 0 }: serverRender) => {
      if (id) {
        this.id = id;
      }
      this.path.value = path;

      const [_FHEAD, RND] = await HeadAndCTX.call(
        this,
        this.path.value,
        _class,
        error,
        data,
        true,
      );

      return new HTML(this.lang, _FHEAD).body(RND.ctx, this.id);
    };
  }
  private async init(data = {}) {
    let id = this.id;

    StateHook(
      async (path) => {
        //
        const [_BODY, _FHEAD] = await forClient.call(this, path, data);
        await headLoader(_FHEAD, id);
        this._root.value = _BODY;

        this.pushHistory && this.history.navigate(path);
      },
      [this.path],
      { id },
    );
  }
}

async function forClient(
  this: Yvee,
  path: string,
  data: obj<any> = {},
  isServer: boolean = false,
  error?: number,
): Promise<ReturnType<typeof docLoader>> {
  const CLS = this.storage.getRoute(path, error);
  oAss(CLS, { path, data });

  return await docLoader.call(this, CLS, isServer);
}

async function HeadAndCTX(
  this: Yvee,
  path: string,
  _class?: string | string[],
  _error?: number,
  data: obj<any> = {},
  isServer: boolean = false,
): Promise<[headType, renderedDom]> {
  //
  const [_BODY, _FHEAD] = await forClient.call(
    this,
    path,
    data,
    isServer,
    _error,
  );

  this._root.value = _BODY;

  const GM = await this.getMain(_class);

  const RND = await MainDom(await this.getMain(_class), this.id);
  return [_FHEAD, RND];
}

export const Routes = <T>(fn: (route: Yvee["route"]) => T) => {
  return (route: Yvee["route"]) => {
    return fn(route);
  };
};

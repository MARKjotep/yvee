import { bind, oAss, _htmlHead, makeID, isArr } from "../../@";
import { $, dom } from "../../dom";
import { State, Stateful, StateHook } from "../../stateful";
import { content } from "../content";
import { getBody } from "../doc";
import { miniStormy } from "../storage";
import type { buttonAttr } from "../../dom";
import { fillRoute } from "../router";

interface mtab {
  tab?: string | string[];
}

class minElements {
  id: string = makeID(5);
  path = State("");
  protected _root = State<any[]>([]);
  @bind Button(a: buttonAttr & mtab, ...ctx: ctx[]) {
    const _PATH = this.path;
    const { on, ..._a } = a;
    const _e: events = {
      ...(on || {}),
      click(e) {
        e.preventDefault();
        //
        const ss = $(this);

        const _TAB = ss.attr.get("tab");
        if (!_TAB) return;
        _PATH.value = _TAB;
      },
    };
    return dom("button", { on: _e, ..._a }, ...ctx);
  }
}

interface _Tabs {
  path?: Stateful<string>;
}

export class Tabs extends minElements {
  storage = new miniStormy();
  private hasLoaded: boolean = false;
  constructor({ path }: _Tabs = {}) {
    super();
    if (path) this.path = path;
  }
  @bind tab<Q extends typeof content<{}>>(path: string) {
    return (f: Q) => {
      f.Button = (a: buttonAttr & mtab, ...ctx: ctx[]) => {
        if (a.tab && isArr(a.tab)) {
          a.tab = fillRoute(path, a.tab);
        } else if (!a.tab) {
          a.tab = path;
        }
        return this.Button(a, ...ctx);
      };

      this.storage.setRoute(path, f);
      return f;
    };
  }
  @bind Main(a: attr & { tab?: string; data?: obj<any> }) {
    const { tab, data = {}, ..._a } = a;

    if (tab) this.load(tab, data);
    return dom("main", { ..._a }, this._root);
  }
  @bind async load(tab: string, data: obj<any> = {}) {
    //

    this.path.value = this.path.value || tab;
    await StateHook(
      async (tab) => {
        this._root.value = await forCtx.call(this, tab, data);
      },
      [this.path],
      { id: this.id, init: true },
    );
  }
}

async function forCtx(
  this: Tabs,
  path: string,
  data: obj<any> = {},
  error?: number,
): Promise<any[]> {
  const CLS = this.storage.getRoute(path, error);
  oAss(CLS, { path, data });

  return getBody(await CLS.body?.(), CLS.importArgs);
}

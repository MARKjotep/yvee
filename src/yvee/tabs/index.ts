import { bind, oAss, _htmlHead, makeID } from "../../@";
import { $, dom } from "../../dom";
import { State, StateHook } from "../../stateful";
import { content } from "../content";
import { getBody } from "../doc";
import { miniStormy } from "../storage";

interface mtab {
  tab: string;
}

class minElements {
  id: string = makeID(5);
  path = State("");
  _root = State<any[]>([]);
  @bind Main(a: attr) {
    return dom("main", {}, this._root);
  }
  @bind Button(a: attr & mtab, ...ctx: ctx[]) {
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

export class Tabs extends minElements {
  storage = new miniStormy();
  constructor() {
    super();
  }
  @bind tab<Q extends typeof content<{}>>(path: string) {
    return (f: Q) => {
      this.storage.setRoute(path, f);
      return f;
    };
  }
  @bind async load(tab: string, data: obj<string> = {}) {
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
  isServer: boolean = false,
  error?: number,
): Promise<any[]> {
  const CLS = this.storage.getRoute(path, error);
  oAss(CLS, { path, data });

  return getBody(await CLS.body?.());
}

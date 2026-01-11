import { dom } from "@dom";
import type { aAttr } from "../../dom";
import { State, Stateful } from "@@/stateful";
import { HtmlHead } from "@coff-r/x/html";
import { bind, makeID, type maybePromise } from "@coff-r/x";
import { $ } from "@$";

export class minElements extends HtmlHead {
  id: string;
  data: obj<any>;
  path: Stateful<string>;
  protected _root: Stateful<any[]>;
  constructor() {
    super({ mark: true });
    //
    this.id = makeID(6);
    this.path = State("/");
    this._root = State([]);
    this.data = {};
  }
  @bind A(a: aAttr, ...ctx: ctx[]) {
    const { on, ..._a } = a;
    const _path = this.path;
    const _e: events = {
      ...(on || {}),
      click(e) {
        e.preventDefault();
        const href = $(this).path;
        _path.value = href;
      },
    };
    return dom("a", { on: _e, ..._a }, ...ctx);
  }
  protected _main?: ((root: Stateful<any[]>) => maybePromise<dom>) | undefined;
  protected async getMain(_class?: string | string[]) {
    return await dom(
      "main",
      { ...(_class && { class: _class }) },
      (await this._main?.(this._root)) || this._root,
    );
  }
}

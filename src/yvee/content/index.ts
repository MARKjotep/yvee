import type { maybePromise } from "@coff-r/x";
import { dom } from "@dom";
import type { buttonAttr } from "@dom";

export interface contentObj {
  args?: obj<any>;
  data?: obj<any>;
}

export class content<T extends contentObj = obj<obj<string>>> {
  path: string = "";
  data: T["data"] = {};
  args: T["args"] = {};
  importArgs: any[] | (() => any[]) = [];
  body?(): maybePromise<any>;
  static Button = (
    a: buttonAttr & { tab?: string | string[] },
    ...ctx: ctx[]
  ) => {
    return dom("button", a || {}, ...ctx);
  };
}

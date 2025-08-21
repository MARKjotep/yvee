import { headAttr, htmlHead, log, type maybePromise } from "../../@";
import { getBody } from "../doc";
import { Tabs } from "../tabs";

export interface contentObj {
  args?: obj<any>;
  data?: obj<any>;
}

export class content<T extends contentObj = obj<obj<string>>> {
  path: string = "";
  data: T["data"] = {};
  args: T["args"] = {};
  body?(): maybePromise<any>;
}

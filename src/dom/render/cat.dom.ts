import { validateAttribute } from "./trust.dom";
import { escapeHTML } from "./escape.dom";
import { Mapper, reCamel } from "@/utils";
import { Idm } from "./idm.dom";
import { OZ } from "./oz.dom";

export class CATT {
  map: Mapper<string, string[]> = new Mapper();
  states: ((id: string) => Promise<() => void>)[] = [];
  events: Mapper<string, (...arg: any) => any> = new Mapper();
  OZ: OZ;
  private internalId?: string;
  constructor(
    public xid: string,
    public IDM = new Idm(),
    _OZ?: OZ,
  ) {
    this.OZ = _OZ ?? new OZ();
  }
  attr_push(key: string, val: any, pre?: string) {
    const ky = pre ?? key;
    validateAttribute(ky, undefined);
    if (
      pre === "style" &&
      !/^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/.test(key)
    ) {
      return;
    }
    if (!this.map.has(ky)) this.map.set(ky, []);
    const vv = pre ? `${reCamel(key)}:${val};` : val;
    this.map.get(ky)!.push(vv);
  }
  get attr(): string {
    let _attr_arr: string[] = [""];
    this.map.forEach((v, k) => {
      const vv = v.join("");
      _attr_arr.push(vv ? `${k}="${vv}"` : k);
    });
    return _attr_arr.join(" ");
  }
  set id(id: string) {
    if (!this.map.has("id")) {
      this.internalId = id;
      this.map.set("id", [escapeHTML(id)]);
    }
  }
  get id(): string | undefined {
    return this.internalId ?? this.map.get("id")?.join("");
  }
  setId(id: string) {
    this.internalId = id;
  }
}

import { OZ } from "..";
import { idm, Mapper, reCamel } from "../../@";

export class CATT {
  map: Mapper<string, string[]> = new Mapper();
  states: ((id: string) => () => void)[] = [];
  events: Mapper<string, (...arg: any) => any> = new Mapper();
  OZ: OZ;
  constructor(
    public xid: string,
    public IDM = new idm(),
    _OZ?: OZ,
  ) {
    this.OZ = _OZ ?? new OZ();
  }
  attr_push(key: string, val: any, pre?: string) {
    const ky = pre ?? key;
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
      this.map.set("id", [id]);
    }
  }
  get id(): string | undefined {
    return this.map.get("id")?.join("");
  }
}

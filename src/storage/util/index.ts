import { isNumber, obj, oItems } from "../../@";

class __I {
  constructor(public value: any) {}
  get str(): string | null {
    const stt = String(this.value).toString();
    return stt == "null" ? null : String(this.value).toString();
  }
  get int(): number | null {
    if (isNumber(this.value)) {
      return parseInt(this.value);
    } else {
      return null;
    }
  }
  get float(): number | null {
    if (isNumber(this.value)) {
      return parseFloat(this.value);
    } else {
      return null;
    }
  }
  get bool(): boolean | null {
    if (this.value === "true") {
      return true;
    } else if (this.value == "false") {
      return false;
    } else {
      return null;
    }
  }
  get json(): any | null {
    if (this.value) {
      return JSON.parse(this.value);
    }
    return null;
  }
}

export class storageInterface {
  key: string;
  func: (() => any) | null;
  storage: Storage;
  constructor(
    item: obj<() => any> | string,
    _type: "local" | "session" = "local",
  ) {
    if (typeof item == "object") {
      const [k, v] = oItems(item)[0];
      this.key = k;
      this.func = v;
    } else {
      this.key = item;
      this.func = null;
    }
    this.storage = _type == "local" ? localStorage : sessionStorage;
  }
  get as() {
    return new __I(this.storage.getItem(this.key));
  }
  get value(): string | null {
    return this.storage.getItem(this.key);
  }
  get save() {
    if (this.func) {
      this.set = this.func();
    }

    return;
  }
  set set(val: any) {
    if (typeof val == "object") {
      this.storage.setItem(this.key, JSON.stringify(val));
    } else {
      this.storage.setItem(this.key, String(val));
    }
  }
  get remove() {
    this.storage.removeItem(this.key);
    return;
  }
}

import { isNumber, isObj, log, ngify, obj, oItems } from "../../@";
import { Stateful, StateHook } from "../../stateful";

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

export type storeValTypes = keyof __I;

export class storageInterface<T> {
  key: string;
  state: Stateful<T> | null;
  storage: Storage;
  constructor(
    item: obj<Stateful<T>> | string,
    _type: "local" | "session" = "local",
    init?: storeValTypes,
  ) {
    this.storage = _type == "local" ? localStorage : sessionStorage;

    if (typeof item == "object") {
      const [k, v] = oItems(item)[0];
      this.key = k;
      this.state = v;
      if (init) {
        const vval = this.as[init];
        this.state.value = vval;
      }
      // watch the state changes
      StateHook(
        (st) => {
          this.set = st;
        },
        [this.state],
        { id: this.key },
      );
    } else {
      this.key = item;
      this.state = null;
    }
  }
  get as() {
    return new __I(this.storage.getItem(this.key));
  }
  get value(): string | null {
    return this.storage.getItem(this.key);
  }

  set set(val: any) {
    const _val = isObj(val) ? ngify(val) : String(val);
    this.storage.setItem(this.key, _val);
  }
  get remove() {
    this.storage.removeItem(this.key);
    return;
  }
}

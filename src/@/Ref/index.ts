import { Elem } from "@$/element";
import type { _$, Elements } from "@$";
import { Stateful } from "@@/stateful";

export class Ref<T extends Elements = HTMLElement> {
  state = new Stateful<_$<T>>(undefined);
  get element(): T | undefined {
    return this.state.value?.e as T;
  }
  set element(elem: T | undefined) {
    if (elem) {
      this.state.value = new Elem<T>(elem);
    } else {
      this.state.value = undefined;
    }
  }
  get $() {
    return this.state.value;
  }
}

export const useRef = <T extends Elements = HTMLElement>() => {
  return new Ref<T>();
};

/** Holds a mutable value and emits an `updated` event when it changes. */
export class RefState<T> extends EventTarget {
  constructor(private current: T) {
    super();
  }

  get value(): T {
    return this.current;
  }

  get clone(): T {
    if (typeof Element !== "undefined" && this.current instanceof Element) {
      return this.current;
    }
    return structuredClone(this.current);
  }

  set value(value: T) {
    if (Object.is(this.current, value)) return;
    this.current = value;
    this.dispatchEvent(new CustomEvent("updated", { detail: value }));
  }
}

export class Ref<T extends Element = HTMLElement> {
  readonly state = new RefState<T | undefined>(undefined);

  get element(): T | undefined {
    return this.state.value;
  }

  set element(element: T | undefined) {
    this.state.value = element;
  }

  get $(): T | undefined {
    return this.state.value;
  }
}

export const useRef = <T extends Element = HTMLElement>() => new Ref<T>();

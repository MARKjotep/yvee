import {
  areSetsEqual,
  compareObjects,
  isArr,
  isNotWindow,
  isNull,
  isObj,
  isPlainObject,
  isUndefined,
  keyInMap,
  Mapper,
  objectUdpated,
} from "../@";
import { Elements, getElementById } from "../storage";
import { stateHook, observer, hookFN, hookM, handleHooks } from "./hook";

export { stateHook, observer };
type statesM<T> = Mapper<string, (this: Elements, arg: T) => any>;

export type statefulValue<T extends any[]> = {
  [K in keyof T]: T[K] extends Stateful<infer U> ? U : T[K];
};

type stateMapped<T> = Mapper<string, statesM<T>>;

const handleStates = (states: stateMapped<any>, value: any) => {
  for (const [key, val] of states) {
    const D = getElementById(key);
    if (!D) {
      states.delete(key);
      continue;
    }

    val.forEach((v) => {
      v.call(D, value);
    });
  }
};

export class Stateful<T> extends EventTarget {
  private hooks: hookM<any> = new Mapper();
  private states: stateMapped<any> = new Mapper();
  private _value: T;
  private listening = false;
  private end?: () => void;

  constructor(
    value: T,
    private options?: AddEventListenerOptions,
  ) {
    super();
    this._value = value;
  }
  get value() {
    return this._value;
  }
  set value(newValue: T) {
    //

    if (isNull(newValue) || isUndefined(newValue)) return;

    if (isPlainObject(this._value) || isArr(this._value)) {
      const changes = compareObjects(this._value as object, newValue);
      if (!objectUdpated(changes)) return;
    } else if (this._value instanceof Set) {
      if (!areSetsEqual(this._value, newValue as Set<T>)) return;
    } else if (this._value === newValue) return;

    this._value = newValue;
    this.dispatchEvent(new CustomEvent("updated", { detail: this._value }));
  }
  get listen() {
    // Register the listener once
    const handler = (event: CustomEvent) => {
      handleHooks(this.hooks);
      handleStates(this.states, event.detail);

      if (!this.states.size && !this.hooks.size) this.end?.();
    };

    // if the length of map size is 0, then remove listener and from States
    if (!this.listening) {
      this.addEventListener("updated", handler as any, this.options);
      //

      this.listening = true;
    }

    return () => {
      this.listening &&
        this.removeEventListener("updated", handler as any, this.options);
      //
      this.end = undefined;
      this.listening = false;
    };
  }
  call<Q>(callback: (this: Elements, arg: T) => Q, entry: string) {
    //
    return (id: string) => {
      // Call this when ready to push -- add entry to only keep one updatable element --

      keyInMap<statesM<T>>(id, this.states).set(entry, callback);
      // MapArray(id, this.states)!.push(callback);
      if (!isNotWindow && !this.listening) {
        this.end = this.listen;
      }
      return () => {
        if (this.states.has(id)) this.states.get(id)?.delete(entry);
      };
    };
  }
  hook<T extends any[]>(callback: hookFN<T>) {
    return (id: string) => {
      //
      this.hooks.set(id, callback);
      if (!isNotWindow && !this.listening) {
        this.end = this.listen;
      }
      return () => {
        if (this.hooks.has(id)) this.hooks.delete(id);
      };
    };
  }
}

export function State<T>(value: T) {
  return new Stateful(value);
}

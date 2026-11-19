import { type Elements, getElementById, IDNotConnected } from "@/$/query.$";
import { Stateful } from "@/core/state/stateful.core";
import type { CATT } from "./cat.dom";
import {
  isArray,
  isFunction,
  keyInMap,
  keyInMapArray,
  Mapper,
  type maybePromise,
} from "@/utils";

type windowEvents = Mapper<
  string,
  (e?: HTMLElement, t?: EventTarget | null) => maybePromise<void>
>;
type documentEvents = windowEvents;
type watchType = [
  (...args: any[]) => void,
  Stateful<any>[],
  boolean?,
  boolean?,
];

const listener = (E: Elements, type: string, fn: (...arg: any) => void) => {
  E.addEventListener(type, fn);
  return () => {
    E.removeEventListener(type, fn);
  };
};

const _WLS: Record<string, (() => void) | undefined> = {};
const _DLS: Record<string, (() => void) | undefined> = {};

export class OZ {
  private readonly tokens = new Map<string, object>();
  private events: Mapper<string, Mapper<string, (...arg: any) => any>> =
    new Mapper();
  private states: Mapper<string, ((id: string) => Promise<() => void>)[]> =
    new Mapper();
  private windowEvents: Mapper<string, windowEvents> = new Mapper();
  private documentEvents: Mapper<string, documentEvents> = new Mapper();
  private resetST: Mapper<string, (() => void)[]> = new Mapper();
  private resetEV: Mapper<string, (() => void)[]> = new Mapper();
  get keys() {
    return [...new Set([...this.states.keys(), ...this.events.keys()])];
  }
  set(catt: CATT) {
    const { id, events, states } = catt;
    if (id) {
      if (events.size) this.events.set(id, events);
      if (states.length) this.states.set(id, states);
    }
    return this;
  }
  push(_OZ: this) {
    _OZ.events.forEach((event, id) => {
      event.forEach((fn, type) => {
        keyInMap<Mapper<string, (...arg: any) => any>>(id, this.events).set(
          type,
          fn,
        );
      });
    });
    _OZ.states.forEach((states, id) => {
      keyInMapArray<((id: string) => Promise<() => void>)[]>(
        id,
        this.states,
      ).push(...states);
    });

    return this;
  }
  async stage(isCurrent: () => boolean = () => true) {
    // stage states

    // state events;

    for (const [id, ev] of [...this.events.entries()]) {
      if (!isCurrent()) return this;
      this.events.delete(id);
      const E = getElementById(id);
      if (!E) {
        continue;
      }

      const token = {}; this.tokens.set(id, token);
      const owned = () => isCurrent() && this.tokens.get(id) === token && getElementById(id) === E;
      const retain = (cleanup: () => void) => { if (owned()) keyInMapArray<(() => void)[]>(id, this.resetEV).push(cleanup); else cleanup(); };
      const eread = ev.get("ready");
      if (eread) {
        const er = await eread.apply(E, [E]);
        if (isFunction(er)) {
          retain(er);
        }
      }

      if (!owned()) return this;
      let ctr = 0;
      for (const [type, event] of ev.entries()) {
        if (!owned()) return this;
        switch (type) {
          case "ready":
            break;
          case "element":
            {
              const cleanup = await event.apply(E, [E]);
              if (isFunction(cleanup)) {
                retain(cleanup);
              }
            }
            break;
          case "states":
          case "state":
            const it = (await event.apply(E, [E])) as watchType | watchType[];

            if (!owned()) return this;
            const fiit = isArray(it[0])
              ? (it as watchType[])
              : it[0]
                ? ([it] as watchType[])
                : [];

            if (!fiit.length) break;

            for (const fi of fiit) {
              const [cb, statefuls, ini, isloaded] = fi;
              if (!statefuls || statefuls.length === 0) continue;

              const sst = isArray(statefuls) ? statefuls : [statefuls];
              if (!sst.length) break;

              const smap = () => sst.map((st) => st.value);
              const handler = () => cb(...smap());

              if (ini) await handler();
              if (!owned()) return this;

              if (isloaded) {
                for (const st of sst) {
                  keyInMapArray<(() => void)[]>(id, this.resetST).push(
                    st.loaded(handler)(`${id}_loaded${ctr++}`),
                  );
                }
                continue;
              }

              for (const st of sst) {
                keyInMapArray<(() => void)[]>(id, this.resetST).push(
                  await st.call(handler, `${id}_state${ctr}`)(id),
                );
              }

              ctr++;
            }

            break;
          case "paste":
            if (type.startsWith("doc")) {
              const tp = type.replace(/^doc/, "");
              this.documentEvents.init(tp, new Mapper()).set(id, event);
            } else {
              this.documentEvents.init(type, new Mapper()).set(id, event);
            }
            break;
          case "resize":
          case "beforeunload":
          case "popstate":
            this.windowEvents.init(type, new Mapper()).set(id, event);
            break;
          default:
            if (type.startsWith("win")) {
              const tp = type.replace(/^win/, "");
              this.windowEvents.init(tp, new Mapper()).set(id, event);
            } else {
              keyInMapArray<(() => void)[]>(id, this.resetEV).push(
                listener(E, type, event),
              );
            }
        }
      }
    }

    this.processWindowEvents;
    this.processDocumentEvents;

    for (const [id, v] of [...this.states.entries()]) {
      if (!isCurrent()) return this;
      this.states.delete(id);
      if (!getElementById(id)) continue;

      const token = this.tokens.get(id) ?? {}; this.tokens.set(id, token);
      for (const f of v) {
        const stop = await f(id);
        if (!isCurrent() || this.tokens.get(id) !== token) { stop(); return this; }
        keyInMapArray<(() => void)[]>(id, this.resetST).push(stop);
      }
    }

    return this;
  }
  // call once
  get processWindowEvents() {
    //

    const WinListener = (evnt: string, wt: windowEvents) => {
      let ticking = false;

      const _scrll = (e: Event) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            wt.forEach((cb, id) => {
              const D = getElementById(id);
              if (D) {
                cb.call(D, e as any);
              } else {
                this.windowEvents.get(evnt)?.delete(id);
              }
            });

            ticking = false;
          });
          ticking = true;
        }
      };

      const _cb = (e: Event) => {
        wt.forEach((cb, id) => {
          const D = getElementById(id);
          if (D) {
            cb.call(D, e as any);
          } else {
            this.windowEvents.get(evnt)?.delete(id);
          }
        });
      };

      window.addEventListener(evnt, evnt === "scroll" ? _scrll : _cb);
      return () => {
        window.removeEventListener(evnt, evnt === "scroll" ? _scrll : _cb);
      };
    };
    this.windowEvents.forEach((st, evnt) => {
      if (st.size) {
        if (!_WLS[evnt]) {
          _WLS[evnt] = WinListener(evnt, st);
        }
      } else {
        if (_WLS[evnt]) {
          _WLS[evnt]();
          delete _WLS[evnt];
        }
      }
    });

    return this;
  }

  get processDocumentEvents() {
    //

    const DocListener = (evnt: string, wt: documentEvents) => {
      let ticking = false;

      const _scrll = (e: Event) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            wt.forEach((cb, id) => {
              const D = getElementById(id);
              if (D) {
                cb.call(D, e as any);
              } else {
                this.documentEvents.get(evnt)?.delete(id);
              }
            });

            ticking = false;
          });
          ticking = true;
        }
      };

      const _cb = (e: Event) => {
        wt.forEach((cb, id) => {
          const D = getElementById(id);
          if (D) {
            cb.call(D, e as any);
          } else {
            this.documentEvents.get(evnt)?.delete(id);
          }
        });
      };

      document.addEventListener(evnt, evnt === "scroll" ? _scrll : _cb);
      return () => {
        document.removeEventListener(evnt, evnt === "scroll" ? _scrll : _cb);
      };
    };
    this.documentEvents.forEach((st, evnt) => {
      if (st.size) {
        if (!_DLS[evnt]) {
          _DLS[evnt] = DocListener(evnt, st);
        }
      } else {
        if (_DLS[evnt]) {
          _DLS[evnt]();
          delete _DLS[evnt];
        }
      }
    });

    return this;
  }
  reset(id: string[]) {
    const errors: unknown[] = [];
    id.forEach((st) => {
      this.tokens.delete(st);
      this.events.delete(st); this.states.delete(st);
      this.windowEvents.forEach((wt, ky) => {
        if (wt.has(st)) {
          wt.delete(st);
        }
      });

      this.documentEvents.forEach((wt, ky) => {
        if (wt.has(st)) {
          wt.delete(st);
        }
      });
      //

      for (const cleanup of [...(this.resetEV.get(st) ?? []), ...(this.resetST.get(st) ?? [])]) {
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
      // delete after reset
      this.resetST.delete(st);
      this.resetEV.delete(st);
    });

    this.processWindowEvents;
    this.processDocumentEvents;

    if (errors.length) {
      throw new AggregateError(errors, "One or more OZ element cleanups failed.");
    }

    return this;
  }

  resetScope(prefix: string) {
    const ids = new Set<string>([
      ...this.tokens.keys(),
      ...this.events.keys(),
      ...this.states.keys(),
      ...this.resetEV.keys(),
      ...this.resetST.keys(),
    ]);
    for (const group of [...this.windowEvents.values(), ...this.documentEvents.values()]) {
      for (const id of group.keys()) ids.add(id);
    }

    const scopedIds = [...ids].filter((id) => id === prefix || id.startsWith(`${prefix}-`));
    this.reset(scopedIds);
    return this;
  }
  /*
    -------------------------
    reset - push - stage
    -------------------------
    */
  async RPS(oz?: this, isCurrent: () => boolean = () => true) {
    if (!isCurrent()) return this;
    const ids: string[] = IDNotConnected();
    this.reset(ids);

    if (oz) {
      const zk = oz.keys;
      if (zk.length) await this.reset(zk).push(oz).stage(isCurrent);
    }

    this.processWindowEvents;
    this.processDocumentEvents;

    return this;
  }

}

export const Wizard = new OZ();

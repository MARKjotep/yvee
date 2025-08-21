import { isArr, keyInMap, keyInMapArray, Mapper, obj, oItems } from "../../@";
import { Elements, getElementById, IDNotConnected } from "../$";
import { Stateful } from "../../stateful";
import { CATT } from "../cat";

type windowEvents = Mapper<
  string,
  (e?: HTMLElement, t?: EventTarget | null) => void
>;
type watchType = [(...args: any[]) => void, Stateful<any>[], boolean?];

const listener = (E: Elements, type: string, fn: (...arg: any) => void) => {
  E.addEventListener(type, fn);
  return () => {
    E.removeEventListener(type, fn);
  };
};

const _WLS: obj<undefined | (() => void)> = {};

/*
-------------------------
Fix the exclusive window states
-------------------------
*/
export class OZ {
  private events: Mapper<string, Mapper<string, (...arg: any) => any>> =
    new Mapper();
  private states: Mapper<string, ((id: string) => () => void)[]> = new Mapper();
  private windowEvents: Mapper<string, windowEvents> = new Mapper();
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
      keyInMapArray<((id: string) => () => void)[]>(id, this.states).push(
        ...states,
      );
    });

    return this;
  }
  get stage() {
    // stage states

    // state events;
    this.events.forEach((ev, id) => {
      this.events.delete(id);
      //
      const E = getElementById(id);
      if (!E) {
        this.events.delete(id);
        return;
      }

      ev.forEach((event, type) => {
        switch (type) {
          case "ready":
          case "element":
            event.apply(E, [E]);
            break;
          case "resize":
          case "beforeunload":
          case "popstate":
          case "winscroll":
          case "winload":
          case "winfocus":
          case "winblur":
            //
            const tp = type.replace(/^win/, "");
            //
            this.windowEvents.init(tp, new Mapper()).set(id, event);

            break;
          case "state":
            const [cb, statefuls, ini] = event.apply(E, [E]) as watchType;

            const sst = isArr(statefuls) ? statefuls : [statefuls];

            if (!sst.length) break;

            const smap = () => sst.map((st) => st.value);
            const handler = () => cb(...smap());

            if (ini) handler();

            sst.forEach((st) =>
              keyInMapArray<(() => void)[]>(id, this.resetST).push(
                st.call(handler, id + "_state")(id),
              ),
            );

            break;
          default:
            keyInMapArray<(() => void)[]>(id, this.resetEV).push(
              listener(E, type, event),
            );
        }
      });
    });

    this.processWindowEvents;

    this.states.forEach((fn, id) => {
      this.states.delete(id);

      //
      fn.forEach((f) => {
        keyInMapArray<(() => void)[]>(id, this.resetST).push(f(id));
      });
    });

    return this;
  }
  // call once
  get processWindowEvents() {
    //

    const WinListener = (evnt: string, wt: windowEvents) => {
      let lastKnownScrollPosition = 0;
      let ticking = false;

      const _scrll = (e: Event) => {
        lastKnownScrollPosition = window.scrollY;
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
  reset(id: string[]) {
    id.forEach((st) => {
      this.windowEvents.forEach((wt, ky) => {
        if (wt.has(st)) {
          wt.delete(st);
        }
      });
      //
      this.resetEV.get(st)?.forEach((f) => {
        f();
      });
      this.resetST.get(st)?.forEach((f) => {
        f();
      });
      // delete after reset
      this.resetST.delete(st);
      this.resetEV.delete(st);
    });

    // check the elements that are not connected??
    return this;
  }
  /*
    -------------------------
    reset - push - stage
    -------------------------
    */
  RPS(oz?: this) {
    if (oz) {
      //
      const ids: string[] = IDNotConnected();
      this.reset(ids);

      const zk = oz.keys;
      if (zk.length) this.reset(zk).push(oz).stage;
    }

    return this;
  }
}

export const Wizard = new OZ();

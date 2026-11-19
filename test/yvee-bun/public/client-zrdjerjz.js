// src/core/ref.core.ts
class RefState extends EventTarget {
  current;
  constructor(current) {
    super();
    this.current = current;
  }
  get value() {
    return this.current;
  }
  get clone() {
    if (typeof Element !== "undefined" && this.current instanceof Element) {
      return this.current;
    }
    return structuredClone(this.current);
  }
  set value(value) {
    if (Object.is(this.current, value))
      return;
    this.current = value;
    this.dispatchEvent(new CustomEvent("updated", { detail: value }));
  }
}

class Ref {
  state = new RefState(undefined);
  get element() {
    return this.state.value;
  }
  set element(element) {
    this.state.value = element;
  }
  get $() {
    return this.state.value;
  }
}
// src/utils.ts
var isBoolean = (value) => typeof value === "boolean";
var isArray = (value) => Array.isArray(value);
var isFunction = (value) => typeof value === "function";
var isObject = (value) => value !== null && typeof value === "object";
var isPlainObject = (value) => isObject(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

class Mapper extends Map {
  obj(value) {
    if (value) {
      Object.entries(value).forEach(([key, item]) => this.set(key, item));
    }
    return this;
  }
  init(key, value) {
    if (!this.has(key))
      this.set(key, value);
    return this.get(key);
  }
}
var keyInMap = (key, map) => {
  if (!map.has(key))
    map.set(key, new Mapper);
  return map.get(key);
};
var keyInMapArray = (key, map) => {
  if (!map.has(key))
    map.set(key, []);
  return map.get(key);
};
var oItems = (value) => Object.entries(value);
var ngify = (value) => JSON.stringify(value);
var reCamel = (value) => {
  if (value.startsWith("webkit"))
    value = `-${value}`;
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};
var makeID = (length) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  return Array.from({ length }, (_, index) => {
    const chars = letters + (index ? digits : "");
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }).join("");
};

// src/core/state/hook.stateful.core.ts
async function StateHook(callback, statefuls, { id = "stateHook", init } = {}) {
  const hooks = [];
  const smap = () => statefuls.map((st) => st.value);
  const handler = async () => {
    await callback(...smap());
  };
  for (const hook of statefuls) {
    hooks.push(await hook.hook(handler)(id));
  }
  if (init)
    await handler();
  return () => {
    hooks.forEach((unhook) => unhook());
  };
}
async function StateLoaded(callback, statefuls, { id = "stateLoad", init } = {}) {
  const hooks = [];
  const smap = () => statefuls.map((st) => st.value);
  const handler = async () => {
    await callback(...smap());
  };
  for (const hook of statefuls) {
    hooks.push(hook.loaded(handler)(id));
  }
  if (init)
    await handler();
  return () => {
    hooks.forEach((unhook) => unhook());
  };
}
var handleHooks = async (hooks) => {
  for (const [k, v] of hooks.entries()) {
    await v();
  }
  return Boolean(hooks.size);
};
var handleLoads = async (hooks) => {
  for (const [k, v] of hooks.entries()) {
    await v();
  }
  return Boolean(hooks.size);
};

// src/$/support.$.ts
var booleanAttributes = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);

// src/$/renderer.$.ts
var renderer;
var setContentRenderer = (next) => {
  renderer = next;
  return () => {
    if (renderer === next)
      renderer = undefined;
  };
};

// src/$/query.$.ts
var ElementIds = new Map;
var getElementById = (key) => {
  if (typeof document === "undefined")
    return;
  const cached = ElementIds.get(key);
  if (cached?.isConnected && cached.id === key)
    return cached;
  ElementIds.delete(key);
  const element = document.getElementById(key);
  if (!element)
    return;
  ElementIds.set(key, element);
  return element;
};
function IDNotConnected() {
  const ids = [];
  for (const [id, element] of ElementIds) {
    if (!element.isConnected || element.id !== id) {
      ids.push(id);
      ElementIds.delete(id);
    }
  }
  return ids;
}
// src/core/state/stateful.core.ts
var handleStates = async (states, value) => {
  let handled = false;
  for (const [key, val] of states) {
    const D = getElementById(key);
    if (!D || !val.size) {
      states.delete(key);
      continue;
    }
    for (const [k, v] of val.entries()) {
      handled = true;
      await v.call(D, value);
    }
  }
  return handled;
};

class Stateful extends EventTarget {
  options;
  hooks = new Mapper;
  loads = new Mapper;
  states = new Mapper;
  _value;
  listening = false;
  end;
  constructor(value, options = {}) {
    super();
    this.options = options;
    this._value = value;
  }
  get value() {
    return this._value;
  }
  get clone() {
    return structuredClone(this._value);
  }
  set value(newValue) {
    const equals = this.options.equals ?? Object.is;
    if (equals !== false && equals(this._value, newValue))
      return;
    this._value = newValue;
    this.dispatch();
  }
  listen() {
    const loaded = async () => {
      await handleLoads(this.loads);
    };
    const handler = async (event) => {
      const value = event.detail;
      const isH = await handleHooks(this.hooks);
      const isT = await handleStates(this.states, value);
      if (isT || isH || this.loads.size) {
        this.dispatchEvent(new CustomEvent("loaded", { detail: this._value }));
      }
      this.stopListeningWhenUnused();
    };
    if (!this.listening) {
      this.addEventListener("updated", handler, this.options);
      this.addEventListener("loaded", loaded, this.options);
      this.listening = true;
      this.end = () => {
        this.removeEventListener("updated", handler, this.options);
        this.removeEventListener("loaded", loaded, this.options);
        this.listening = false;
        this.end = undefined;
      };
    }
    return this.end;
  }
  stopListeningWhenUnused() {
    if (!this.states.size && !this.hooks.size && !this.loads.size)
      this.end?.();
  }
  call(callback, entry) {
    return async (id) => {
      keyInMap(id, this.states).set(entry, callback);
      if (typeof window !== "undefined")
        this.listen();
      return () => {
        const entries = this.states.get(id);
        entries?.delete(entry);
        if (entries && !entries.size)
          this.states.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  hook(callback) {
    return async (id) => {
      this.hooks.set(id, callback);
      if (typeof window !== "undefined")
        this.listen();
      return () => {
        this.hooks.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  loaded(callback) {
    return (id) => {
      this.loads.set(id, callback);
      if (typeof window !== "undefined")
        this.listen();
      return () => {
        this.loads.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  dispatch() {
    this.dispatchEvent(new CustomEvent("updated", { detail: this._value }));
  }
}
function State(value, options = {}) {
  return new Stateful(value, options);
}
// src/core/scope/registry.ts
var registry = new Map;
// src/core/storage/estream.storage.core.ts
var eventSources = new Map;
var eventListeners = new Map;
var eventOwners = new Map;
// src/dom/render/node.dom.ts
class DOM {
  tag;
  attr;
  ctx;
  constructor(tag, attr, ctx) {
    this.tag = tag;
    this.attr = attr;
    this.ctx = ctx;
    if (tag && !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(tag)) {
      throw new TypeError(`Invalid DOM tag name: ${tag}`);
    }
  }
}
async function dom(tag, attr = {}, ...ctx) {
  if (isFunction(tag)) {
    return await tag(attr ?? {}, ...ctx);
  }
  return new DOM(tag, attr ?? {}, ctx);
}
var frag = async (_attr, ...ctx) => new DOM("", {}, ctx);

// src/dom/render/oz.dom.ts
var listener = (E, type, fn) => {
  E.addEventListener(type, fn);
  return () => {
    E.removeEventListener(type, fn);
  };
};
var _WLS = {};
var _DLS = {};

class OZ {
  events = new Mapper;
  states = new Mapper;
  windowEvents = new Mapper;
  documentEvents = new Mapper;
  resetST = new Mapper;
  resetEV = new Mapper;
  get keys() {
    return [...new Set([...this.states.keys(), ...this.events.keys()])];
  }
  set(catt) {
    const { id, events, states } = catt;
    if (id) {
      if (events.size)
        this.events.set(id, events);
      if (states.length)
        this.states.set(id, states);
    }
    return this;
  }
  push(_OZ) {
    _OZ.events.forEach((event, id) => {
      event.forEach((fn, type) => {
        keyInMap(id, this.events).set(type, fn);
      });
    });
    _OZ.states.forEach((states, id) => {
      keyInMapArray(id, this.states).push(...states);
    });
    return this;
  }
  async stage() {
    for (const [id, ev] of this.events.entries()) {
      this.events.delete(id);
      const E = getElementById(id);
      if (!E) {
        continue;
      }
      const eread = ev.get("ready");
      if (eread) {
        const er = await eread.apply(E, [E]);
        if (isFunction(er)) {
          keyInMapArray(id, this.resetEV).push(er);
        }
      }
      let ctr = 0;
      for (const [type, event] of ev.entries()) {
        switch (type) {
          case "ready":
            break;
          case "element":
            {
              const cleanup = await event.apply(E, [E]);
              if (isFunction(cleanup)) {
                keyInMapArray(id, this.resetEV).push(cleanup);
              }
            }
            break;
          case "states":
          case "state":
            const it = await event.apply(E, [E]);
            const fiit = isArray(it[0]) ? it : it[0] ? [it] : [];
            if (!fiit.length)
              break;
            for (const fi of fiit) {
              const [cb, statefuls, ini, isloaded] = fi;
              if (!statefuls || statefuls.length === 0)
                continue;
              const sst = isArray(statefuls) ? statefuls : [statefuls];
              if (!sst.length)
                break;
              const smap = () => sst.map((st) => st.value);
              const handler = () => cb(...smap());
              if (ini)
                handler();
              if (isloaded) {
                for (const st of sst) {
                  keyInMapArray(id, this.resetST).push(st.loaded(handler)(`${id}_loaded${ctr++}`));
                }
                continue;
              }
              for (const st of sst) {
                keyInMapArray(id, this.resetST).push(await st.call(handler, `${id}_state${ctr}`)(id));
              }
              ctr++;
            }
            break;
          case "paste":
            if (type.startsWith("doc")) {
              const tp = type.replace(/^doc/, "");
              this.documentEvents.init(tp, new Mapper).set(id, event);
            } else {
              this.documentEvents.init(type, new Mapper).set(id, event);
            }
            break;
          case "resize":
          case "beforeunload":
          case "popstate":
            this.windowEvents.init(type, new Mapper).set(id, event);
            break;
          default:
            if (type.startsWith("win")) {
              const tp = type.replace(/^win/, "");
              this.windowEvents.init(tp, new Mapper).set(id, event);
            } else {
              keyInMapArray(id, this.resetEV).push(listener(E, type, event));
            }
        }
      }
    }
    this.processWindowEvents;
    this.processDocumentEvents;
    for (const [id, v] of this.states.entries()) {
      this.states.delete(id);
      if (!getElementById(id))
        continue;
      for (const f of v) {
        keyInMapArray(id, this.resetST).push(await f(id));
      }
    }
    return this;
  }
  get processWindowEvents() {
    const WinListener = (evnt, wt) => {
      let ticking = false;
      const _scrll = (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            wt.forEach((cb, id) => {
              const D = getElementById(id);
              if (D) {
                cb.call(D, e);
              } else {
                this.windowEvents.get(evnt)?.delete(id);
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      };
      const _cb = (e) => {
        wt.forEach((cb, id) => {
          const D = getElementById(id);
          if (D) {
            cb.call(D, e);
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
    const DocListener = (evnt, wt) => {
      let ticking = false;
      const _scrll = (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            wt.forEach((cb, id) => {
              const D = getElementById(id);
              if (D) {
                cb.call(D, e);
              } else {
                this.documentEvents.get(evnt)?.delete(id);
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      };
      const _cb = (e) => {
        wt.forEach((cb, id) => {
          const D = getElementById(id);
          if (D) {
            cb.call(D, e);
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
  reset(id) {
    const errors = [];
    id.forEach((st) => {
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
      for (const cleanup of [...this.resetEV.get(st) ?? [], ...this.resetST.get(st) ?? []]) {
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
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
  resetScope(prefix) {
    const ids = new Set([
      ...this.events.keys(),
      ...this.states.keys(),
      ...this.resetEV.keys(),
      ...this.resetST.keys()
    ]);
    for (const group of [...this.windowEvents.values(), ...this.documentEvents.values()]) {
      for (const id of group.keys())
        ids.add(id);
    }
    const scopedIds = [...ids].filter((id) => id === prefix || id.startsWith(`${prefix}-`));
    this.reset(scopedIds);
    return this;
  }
  async RPS(oz) {
    const ids = IDNotConnected();
    this.reset(ids);
    if (oz) {
      const zk = oz.keys;
      if (zk.length)
        await this.reset(zk).push(oz).stage();
    }
    this.processWindowEvents;
    this.processDocumentEvents;
    return this;
  }
}
var Wizard = new OZ;
// src/dom/render/idm.dom.ts
class Idm {
  counter;
  baseId;
  constructor(seed, counter = 0) {
    this.baseId = seed || makeID(4);
    this.counter = Number.isSafeInteger(counter) && counter >= 0 ? counter : 0;
  }
  static fromId(id) {
    const match = /^(.*)-(\d+)$/.exec(id);
    if (!match || !match[1])
      return new Idm(id);
    return new Idm(match[1], Number(match[2]));
  }
  get id() {
    return `${this.baseId}-${this.counter}`;
  }
  get nextId() {
    return `${this.baseId}-${this.counter++}`;
  }
  get childId() {
    return Idm.fromId(`${this.nextId}-0`);
  }
  append(prefix = "h") {
    return Idm.fromId(`${prefix}${this.id}`);
  }
}

// src/dom/render/cat.dom.ts
class CATT {
  xid;
  IDM;
  map = new Mapper;
  states = [];
  events = new Mapper;
  OZ;
  internalId;
  constructor(xid, IDM = new Idm, _OZ) {
    this.xid = xid;
    this.IDM = IDM;
    this.OZ = _OZ ?? new OZ;
  }
  attr_push(key, val, pre) {
    const ky = pre ?? key;
    if (!/^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(ky))
      return;
    if (pre === "style" && !/^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/.test(key)) {
      return;
    }
    if (!this.map.has(ky))
      this.map.set(ky, []);
    const vv = pre ? `${reCamel(key)}:${val};` : val;
    this.map.get(ky).push(vv);
  }
  get attr() {
    let _attr_arr = [""];
    this.map.forEach((v, k) => {
      const vv = v.join("");
      _attr_arr.push(vv ? `${k}="${vv}"` : k);
    });
    return _attr_arr.join(" ");
  }
  set id(id) {
    if (!this.map.has("id")) {
      this.internalId = id;
      this.map.set("id", [id]);
    }
  }
  get id() {
    return this.internalId ?? this.map.get("id")?.join("");
  }
  setId(id) {
    this.internalId = id;
  }
}

// src/dom/render/escape.dom.ts
var escapeHTML = (input) => String(input).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

// src/dom/render/ctx.dom.ts
var renderNestedDOM;
var setNestedDOMRenderer = (renderer) => {
  renderNestedDOM = renderer;
};
var TAGS = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var hasTag = (tag) => TAGS.includes(tag.toLowerCase());
var ctx_value = async (value, catt) => {
  const cc = await Promise.resolve(value);
  if (isArray(cc)) {
    const results = [];
    for (const c of cc) {
      results.push(await ctx_value(c, catt));
    }
    return results.join("");
  } else if (cc instanceof DOM) {
    if (!renderNestedDOM) {
      throw new Error("The DOM renderer has not been initialized.");
    }
    const { ctx, oz } = await renderNestedDOM(cc, catt.IDM);
    catt.OZ.push(oz);
    return ctx;
  } else if (isObject(cc)) {
    if (cc instanceof Set) {
      return escapeHTML([...cc].join(" "));
    }
    return escapeHTML(ngify(cc));
  } else if (isFunction(cc)) {
    return await ctx_value(cc(), catt);
  } else if (cc !== undefined && cc !== null) {
    return escapeHTML(cc);
  }
  return "";
};
var processCTXStateful = async (value, xid) => {
  const ndm = xid ? Idm.fromId(xid) : new Idm;
  const catt = new CATT(ndm.id, ndm);
  const ctx = await ctx_value(value, catt);
  return { ctx, catt };
};
async function Callback(arg) {
  const elementId = this.id;
  if (elementId) {
    const { ctx, catt } = await processCTXStateful(arg, elementId);
    if (this.innerHTML !== ctx) {
      this.innerHTML = ctx;
      await Wizard.RPS(catt.OZ);
      return true;
    }
  }
  return false;
}
var processCTX = async (v, len, catt, inner = []) => {
  if (isArray(v)) {
    for (const vv of v) {
      await processCTX(vv, v.length, catt, inner);
    }
  } else if (v instanceof Stateful) {
    if (len > 1) {
      await processCTX(await dom("div", {}, v), len, catt, inner);
    } else {
      const VL = v.value;
      const entry = VL instanceof DOM ? "dom" : "ctx";
      const { ctx, catt: _ct } = await processCTXStateful(VL, catt.xid + "-0");
      catt.xid = _ct.xid;
      inner.push(ctx);
      catt.OZ.push(_ct.OZ);
      catt.states.push(v.call(Callback, entry));
    }
  } else {
    inner.push(await ctx_value(v, catt));
  }
};

class CTX {
  tag;
  ctx;
  closing;
  constructor(tag = "", ctx) {
    this.tag = tag;
    this.ctx = ctx;
    const selfClosing = hasTag(tag);
    this.closing = selfClosing ? "" : `</${tag}>`;
  }
  async process(catt, ctx = this.ctx, inner = []) {
    for (const ct of ctx) {
      await processCTX(await Promise.resolve(ct), ctx.length, catt, inner);
    }
    return inner.join("");
  }
  async get(catt) {
    const elementId = catt.xid;
    const ctx = await this.process(catt);
    if (!this.tag)
      return ctx;
    if (hasTag(this.tag)) {
      if (ctx)
        throw new TypeError(`<${this.tag}> cannot contain child content.`);
      return `<${this.tag}${catt.attr}>`;
    }
    if (catt.events.size || catt.states.length) {
      catt.id = elementId;
    }
    return `<${this.tag}${catt.attr}>${ctx}${this.closing}`;
  }
}

// src/dom/attr/value.dom.ts
var booleanAttributes2 = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var isBooleanAttribute2 = (name) => booleanAttributes2.has(name.toLowerCase());
var attr_value = (value) => {
  if (isArray(value)) {
    return escapeHTML(value.filter((item) => item !== undefined).join(" "));
  }
  if (isPlainObject(value))
    return escapeHTML(ngify(value));
  if (isFunction(value))
    return attr_value(value());
  if (value === undefined || value === null)
    return "";
  return isBoolean(value) ? value ? "" : "false" : escapeHTML(String(value));
};
var dom_attr_value = (value) => {
  if (isArray(value)) {
    return value.filter((item) => item !== undefined).join(" ");
  }
  if (isPlainObject(value))
    return ngify(value);
  if (isFunction(value))
    return dom_attr_value(value());
  if (value === undefined || value === null)
    return "";
  return isBoolean(value) ? value ? "" : "false" : String(value);
};
// src/dom/attr/attr.dom.ts
var isValidAttributeName = (name) => /^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(name);
var isValidStyleName = (name) => /^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/.test(name);
function Callback2(attr, pre) {
  switch (pre ?? attr) {
    case "style":
      return function(value) {
        this.style.setProperty(attr, dom_attr_value(value));
      };
    default:
      return function(value) {
        if (isBooleanAttribute2(attr) && (typeof value === "boolean" || value == null)) {
          this.toggleAttribute(attr, value === true);
          return;
        }
        this.setAttribute(attr, dom_attr_value(value));
      };
  }
}

class ATTR {
  attr;
  constructor(attr = {}) {
    this.attr = attr;
  }
  get(catt, attr = this.attr, pre) {
    const processValue = (k, v) => {
      if (pre !== "style" && isBooleanAttribute2(k) && (v === false || v === null)) {
        return;
      }
      if (isArray(v)) {
        catt.attr_push(k, attr_value(v), pre);
      } else if (v instanceof Stateful) {
        const entry = pre ? `${pre}_${k}` : k;
        catt.states.push(v.call(Callback2(k, pre), entry));
        processValue(k, v.value);
      } else if (isObject(v)) {
        if (isPlainObject(v) && !pre) {
          this.get(catt, v, k);
        }
      } else {
        catt.attr_push(k, attr_value(v), pre);
      }
    };
    oItems(attr).forEach(([k, v]) => {
      const ok = String(k);
      if (!(pre === "style" ? isValidStyleName(ok) : isValidAttributeName(ok))) {
        return;
      }
      if (ok === "id" && v !== undefined) {
        catt.setId(dom_attr_value(v instanceof Stateful ? v.value : v));
      }
      if (ok === "ref") {
        if (v instanceof Ref) {
          catt.events.obj({
            element() {
              v.element = this;
            }
          });
        }
      } else if (["on"].includes(ok)) {
        isObject(attr.on) && catt.events.obj(attr.on);
      } else {
        if (v === undefined)
          return;
        processValue(ok, v);
      }
    });
  }
  unload(x) {
    let value;
    if (x in this.attr) {
      value = this.attr[x];
      delete this.attr[x];
    }
    return value;
  }
}

// src/dom/render/render.dom.ts
async function renderDom(node, pid = new Idm) {
  const { tag, attr: attr2, ctx } = await Promise.resolve(node);
  const idm = pid instanceof Idm ? pid : Idm.fromId(pid);
  const id = idm.nextId;
  const catt = new CATT(id, idm);
  const attributes = new ATTR(attr2);
  const context = new CTX(tag, ctx);
  attributes.get(catt);
  const html = await context.get(catt);
  return {
    ctx: html,
    oz: catt.OZ.set(catt),
    id: catt.id
  };
}
setNestedDOMRenderer(renderDom);
setContentRenderer(async (value, parentId) => {
  const { ctx, catt } = await processCTXStateful(value, parentId);
  return {
    html: ctx,
    commit: () => Wizard.RPS(catt.OZ).then(() => {
      return;
    })
  };
});
// src/yvee/rendering/head.ts
function asArray(value) {
  if (value === undefined)
    return [];
  return Array.isArray(value) ? value : [value];
}
function combineHead(defaults, page) {
  return {
    ...defaults,
    ...page,
    base: [...asArray(defaults.base), ...asArray(page.base)],
    meta: [...asArray(defaults.meta), ...asArray(page.meta)],
    link: [...asArray(defaults.link), ...asArray(page.link)],
    script: [...asArray(defaults.script), ...asArray(page.script)],
    css: [...asArray(defaults.css), ...asArray(page.css)],
    js: [...asArray(defaults.js), ...asArray(page.js)],
    elements: [...asArray(defaults.elements), ...asArray(page.elements)]
  };
}
function normalizeHeadValue(value) {
  if (value instanceof DOM)
    return { elements: [value] };
  if (typeof value === "string")
    return { style: value };
  return value ?? {};
}

class HeadDefaults {
  values = {};
  head(config) {
    if (config.title !== undefined)
      this.values.title = config.title;
    const style = [this.values.style, config.style].filter(Boolean).join(`
`);
    if (style)
      this.values.style = style;
    if (config.description !== undefined) {
      this.values.description = config.description;
    }
    for (const field of ["base", "meta", "link", "script", "css", "js", "elements"]) {
      const incoming = config[field];
      if (incoming === undefined)
        continue;
      const previous = this.values[field];
      const existing = previous === undefined ? [] : Array.isArray(previous) ? previous : [previous];
      const additions = Array.isArray(incoming) ? incoming : [incoming];
      this.values[field] = [...existing, ...additions];
    }
  }
}
function applyHead(config, owner, options = {}) {
  if (typeof document === "undefined") {
    return Object.assign(() => {}, {
      ready: Promise.resolve(),
      async activate() {},
      cancel() {}
    });
  }
  let previousTitle = document.title;
  const title = config.title ?? "";
  const nodes = [];
  let dynamicTitle;
  let renderedHead;
  const stylesheetLinks = [];
  let activated = !options.deferTitle;
  let titleManaged = false;
  let cancelled = false;
  let stylesheetWait = waitForStylesheets([]);
  if (activated && config.title !== undefined) {
    document.title = title;
    titleManaged = true;
  }
  const append = (tag, attrs) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "body" || value === undefined)
        continue;
      if (typeof value === "boolean")
        node.toggleAttribute(key, value);
      else
        node.setAttribute(key, String(value));
    }
    node.dataset.yvee = owner;
    if (tag === "script" && attrs.body)
      node.textContent = String(attrs.body);
    document.head.append(node);
    nodes.push(node);
    if (tag === "link" && String(attrs.rel ?? "").toLowerCase() === "stylesheet") {
      stylesheetLinks.push(node);
    }
  };
  if (!options.keepExisting)
    removeHeadElements(owner);
  for (const base of config.base ?? [])
    append("base", base);
  if (config.description) {
    append("meta", { name: "description", content: config.description });
  }
  for (const meta of config.meta ?? [])
    append("meta", meta);
  for (const link of config.link ?? [])
    append("link", link);
  const cssHrefs = asArray(config.css);
  for (const href of cssHrefs) {
    append("link", { rel: "stylesheet", href });
  }
  for (const script of config.script ?? [])
    append("script", script);
  const scripts = asArray(config.js);
  for (const src of scripts)
    append("script", { src });
  if (config.style) {
    const style = document.createElement("style");
    style.textContent = config.style;
    style.dataset.yvee = owner;
    document.head.append(style);
    nodes.push(style);
  }
  const ownerIdSeed = options.idSeed ?? `${owner}:h`;
  const ready = (async () => {
    if (config.elements?.length) {
      renderedHead = await renderHeadElements(config.elements, owner, ownerIdSeed);
      if (cancelled)
        return;
      const template = document.createElement("template");
      template.innerHTML = renderedHead.ctx;
      const children = Array.from(template.content.children);
      for (const child of children) {
        if (child instanceof HTMLTitleElement) {
          dynamicTitle = child;
          if (options.deferTitle)
            continue;
          titleManaged = true;
        }
        document.head.append(child);
        nodes.push(child);
      }
      stylesheetLinks.push(...children.filter((child) => child instanceof HTMLLinkElement && child.rel.toLowerCase() === "stylesheet"));
    }
    stylesheetWait = waitForStylesheets(stylesheetLinks);
    await stylesheetWait.ready;
    if (activated && renderedHead)
      await Wizard.RPS(renderedHead.oz);
  })();
  const cleanup = () => {
    cancelled = true;
    stylesheetWait.cancel();
    if (activated && renderedHead)
      Wizard.resetScope(ownerIdSeed);
    const managedTitle = dynamicTitle?.textContent ?? title;
    const shouldRestoreTitle = titleManaged && document.title === managedTitle;
    nodes.forEach((node) => node.remove());
    dynamicTitle?.remove();
    if (shouldRestoreTitle)
      document.title = previousTitle;
  };
  cleanup.ready = ready;
  cleanup.activate = async () => {
    if (cancelled || activated)
      return;
    activated = true;
    if (config.title !== undefined) {
      document.title = title;
      titleManaged = true;
    }
    if (dynamicTitle) {
      document.head.append(dynamicTitle);
      nodes.push(dynamicTitle);
      titleManaged = true;
    }
    if (renderedHead)
      await Wizard.RPS(renderedHead.oz);
  };
  cleanup.cancel = () => stylesheetWait.cancel();
  return cleanup;
}
async function renderHeadElements(elements, owner, idSeed) {
  const idm = new Idm(idSeed);
  const rendered = new OZ;
  const markup = [];
  let id;
  for (const element of elements) {
    const owned = await addHeadOwner(element, owner);
    const node = await renderDom(owned, idm);
    markup.push(node.ctx);
    rendered.push(node.oz);
    id = node.id ?? id;
  }
  return { ctx: markup.join(""), oz: rendered, id };
}
async function addHeadOwner(value, owner) {
  const resolved = await Promise.resolve(value);
  if (Array.isArray(resolved)) {
    const children = [];
    for (const child of resolved)
      children.push(await addHeadOwner(child, owner));
    return children;
  }
  if (!(resolved instanceof DOM))
    return resolved;
  const children = [];
  for (const child of resolved.ctx)
    children.push(await addHeadOwner(child, owner));
  const attr = resolved.tag ? { ...resolved.attr, "data-yvee": owner } : resolved.attr;
  return new DOM(resolved.tag, attr, children);
}
function removeHeadElements(owner) {
  if (typeof document === "undefined")
    return;
  document.head.querySelectorAll("[data-yvee]").forEach((node) => {
    if (node.getAttribute("data-yvee") === owner)
      node.remove();
  });
}
function waitForStylesheets(links) {
  const pending = new Set;
  const ready = Promise.all(links.map((link) => new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled)
        return;
      settled = true;
      pending.delete(finish);
      window.clearTimeout(timeout);
      link.removeEventListener("load", finish);
      link.removeEventListener("error", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, 8000);
    pending.add(finish);
    link.addEventListener("load", finish, { once: true });
    link.addEventListener("error", finish, { once: true });
  }))).then(() => {
    return;
  });
  return {
    ready,
    cancel() {
      for (const finish of [...pending])
        finish();
    }
  };
}

// src/yvee/guards/guards.ts
var routeGuards = new WeakMap;
var guardsFor = (controller) => routeGuards.get(controller) ?? [];
async function checkGuards(guards, context) {
  for (const guard of guards) {
    context.signal.throwIfAborted();
    const result = await guard(context);
    context.signal.throwIfAborted();
    if (result && result.kind !== "allow")
      return result;
  }
  return { kind: "allow" };
}
// src/yvee/pages/page.tsx
class Page {
  url = { path: "/", search: "", hash: "", params: new URLSearchParams };
  path = "/";
  params = {};
  data = {};
  error;
  status = 200;
}

class MissingPage extends Page {
  body() {
    return /* @__PURE__ */ dom("main", {
      role: "status"
    }, "Page not found: ", this.path);
  }
}

class FailurePage extends Page {
  status = 500;
  body() {
    return /* @__PURE__ */ dom("main", {
      role: "alert"
    }, "This page could not be loaded.");
  }
}

// src/yvee/client/load-page.ts
async function loadPage({
  app,
  routes,
  globalGuards,
  errors,
  error,
  url,
  data,
  signal
}) {
  const match = routes.find(url.path);
  const Controller = match?.entry.controller;
  const status = error ?? (Controller ? undefined : 404);
  const ErrorPage = errors.get(status ?? 404) ?? (status === 404 ? MissingPage : FailurePage);
  const page = status === undefined && Controller ? new Controller : new ErrorPage;
  if (status !== undefined)
    page.status = status;
  assignRoute(page, url, match?.params, data);
  const decision = await checkGuards([...globalGuards, ...guardsFor(page.constructor)], { app, page, url, params: page.params, data: page.data, signal });
  if (decision.kind !== "allow")
    return decision;
  try {
    const loaded = await renderPage(page, url, signal);
    return { ...loaded, url };
  } catch (failure) {
    if (signal.aborted)
      throw signal.reason ?? failure;
    return renderFailure({
      app,
      errors,
      globalGuards,
      url,
      data,
      failure,
      signal,
      original: page
    });
  }
}
function assignRoute(page, url, params, data) {
  page.url = url;
  page.path = url.path;
  page.params = params ?? {};
  Object.assign(page.data, data);
}
async function renderPage(page, url, signal) {
  if (signal.aborted)
    throw signal.reason ?? new Error("Page load aborted.");
  if (page.fetch) {
    const fetched = await page.fetch({
      url,
      params: page.params,
      data: page.data,
      signal
    });
    Object.assign(page.data, fetched);
  }
  if (signal.aborted)
    throw signal.reason ?? new Error("Page load aborted.");
  const bodyModule = await page.body?.();
  if (signal.aborted)
    throw signal.reason ?? new Error("Page load aborted.");
  const { bodyValue, moduleHead } = await resolveBodyModule(bodyModule, page);
  const routeHead = await page.head?.();
  const head = combineHead(normalizeHeadValue(moduleHead), normalizeHeadValue(routeHead));
  return {
    kind: "ready",
    status: page.status,
    head,
    body: Array.isArray(bodyValue) ? bodyValue : [bodyValue ?? ""]
  };
}
async function resolveBodyModule(value, page) {
  if (!isLazyPageModule(value)) {
    return { bodyValue: value, moduleHead: undefined };
  }
  const moduleHead = typeof value.head === "function" ? await value.head() : await value.head;
  const bodyValue = typeof value.default === "function" ? await value.default({ page }) : await value.default;
  return { bodyValue, moduleHead };
}
function isLazyPageModule(value) {
  return typeof value === "object" && value !== null && "default" in value;
}
async function renderFailure({
  app,
  errors,
  globalGuards,
  url,
  data,
  failure,
  signal,
  original
}) {
  const status = failure instanceof Response && failure.status >= 400 ? failure.status : 500;
  const ErrorPage = errors.get(status) ?? (status === 404 ? MissingPage : FailurePage);
  if (original.constructor === ErrorPage)
    throw failure;
  const page = new ErrorPage;
  assignRoute(page, url, original.params, data);
  page.error = failure;
  page.status = status;
  const decision = await checkGuards([...globalGuards, ...guardsFor(page.constructor)], { app, page, url, params: page.params, data: page.data, signal });
  if (decision.kind !== "allow")
    return decision;
  try {
    return { ...await renderPage(page, url, signal), url, failure };
  } catch (error) {
    if (signal.aborted)
      throw signal.reason ?? error;
    throw new AggregateError([failure, error], "Yvee error page failed to render.");
  }
}

// src/yvee/client/mount.tsx
async function mountRoot({ element, id, className, root, layout, hydrate = true }) {
  const content = layout ? await layout(root) : root;
  const tree = content instanceof DOM ? content : /* @__PURE__ */ dom("main", {
    class: className
  }, content);
  const rendered = await renderDom(tree, element.id || id);
  if (!hydrate || element.innerHTML !== rendered.ctx) {
    element.innerHTML = rendered.ctx;
  }
  await Wizard.RPS(rendered.oz);
}

// src/yvee/routing/path.ts
var normalizePath = (input) => {
  const raw = input.split(/[?#]/, 1)[0] || "/";
  const absolute = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = absolute.replace(/\/{2,}/g, "/");
  return compact.length > 1 ? compact.replace(/\/+$/, "") : "/";
};
var toURL = (input) => {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.href;
  const url = input instanceof URL ? input : new URL(input, base);
  return {
    path: normalizePath(url.pathname),
    search: url.search,
    hash: url.hash,
    params: url.searchParams
  };
};
var urlKey = (url) => `${url.path}${url.search}${url.hash}`;

// src/yvee/client/navigation.ts
class NavigationEvents {
  options;
  previousScrollRestoration;
  handlePop = (event) => this.options.onPop(toURL(location.href), event.state);
  handleClick = (event) => {
    if (!this.isEligibleClick(event))
      return;
    const anchor = event.target.closest("a");
    if (!anchor)
      return;
    const target = new URL(anchor.href, location.href);
    if (target.origin !== location.origin || !this.isWithinBase(target.pathname))
      return;
    event.preventDefault();
    this.options.navigate(`${target.pathname}${target.search}${target.hash}`);
  };
  constructor(options) {
    this.options = options;
  }
  start() {
    this.previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.addEventListener("popstate", this.handlePop);
    document.addEventListener("click", this.handleClick);
  }
  stop() {
    if (typeof window !== "undefined")
      window.removeEventListener("popstate", this.handlePop);
    if (typeof document !== "undefined")
      document.removeEventListener("click", this.handleClick);
    if (this.previousScrollRestoration !== undefined) {
      history.scrollRestoration = this.previousScrollRestoration;
      this.previousScrollRestoration = undefined;
    }
  }
  isEligibleClick(event) {
    if (event.defaultPrevented || event.button !== 0)
      return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return false;
    if (!(event.target instanceof Element))
      return false;
    const anchor = event.target.closest("a");
    return Boolean(anchor && !anchor.target && !anchor.hasAttribute("download"));
  }
  isWithinBase(pathname) {
    const base = this.options.base === "/" ? "/" : `${this.options.base.replace(/\/$/, "")}/`;
    return base === "/" || pathname === base.slice(0, -1) || pathname.startsWith(base);
  }
}

// src/yvee/client/runtime.ts
class YveeClient {
  options;
  navigation;
  element;
  mounted = false;
  ignoreURLHook = false;
  revision = 0;
  redirects = 0;
  currentURL;
  pendingNavigation;
  displayedEntry;
  nextEntryId = 0;
  scrollPositions = new Map;
  stopURL;
  stopHead;
  activeLoad;
  pendingHeads = new Set;
  constructor(options) {
    this.options = options;
    this.navigation = new NavigationEvents({
      base: options.base,
      onPop: (url, state) => {
        this.captureDisplayedScroll();
        const key = urlKey(url);
        const scroll = this.scrollPositions.get(this.entryKey(state) ?? "") ?? getScrollPosition(state) ?? this.scrollPositions.get(key);
        if (scroll)
          this.rememberScroll(key, scroll);
        this.pendingNavigation = undefined;
        this.updateURL(url);
        this.transition(url, true, scroll);
      },
      navigate: (path) => this.navigate(path)
    });
  }
  async mount(options = {}) {
    this.unmount();
    const mountRevision = this.revision;
    this.element = options.id ? document.getElementById(options.id) ?? undefined : document.body;
    if (!this.element)
      throw new Error(`Yvee mount element not found: ${options.id}`);
    if (!document.body.id)
      document.body.id = options.id ?? this.options.id;
    this.mounted = true;
    this.options.onLoading(true);
    let firstPage;
    try {
      firstPage = await this.resolveInitialPage(this.initialURL());
    } catch (error) {
      this.options.onLoading(false);
      this.options.onError?.(error, this.initialURL());
      throw error;
    }
    if (!this.mounted || mountRevision !== this.revision)
      return () => this.unmount();
    if (firstPage.kind === "ready") {
      if (firstPage.failure !== undefined) {
        this.options.onError?.(firstPage.failure, firstPage.url);
      }
      this.options.url.value = firstPage.url;
      this.options.root.value = firstPage.body;
      const initialHead = this.stageHead(combineHead(this.options.getHead(), firstPage.head), mountRevision);
      this.stopHead = initialHead;
      await initialHead.ready;
      if (!this.mounted || mountRevision !== this.revision) {
        initialHead();
        return () => this.unmount();
      }
      removeHeadElements(this.options.id);
      await initialHead.activate();
      const layout = this.options.getLayout();
      await mountRoot({
        element: this.element,
        id: this.options.id,
        root: this.options.root,
        ...options.className ? { className: options.className } : {},
        ...options.hydrate === undefined ? {} : { hydrate: options.hydrate },
        ...layout ? { layout } : {}
      });
      this.currentURL = firstPage.url;
      this.trackDisplayedEntry();
      const initialScroll = getScrollPosition(history.state) ?? getCurrentScroll();
      this.rememberScroll(urlKey(firstPage.url), initialScroll);
    }
    this.options.onLoading(false);
    await this.watchURL();
    this.navigation.start();
    return () => this.unmount();
  }
  navigate(path, state, replace = false) {
    const target = typeof path === "string" ? toURL(path) : toURL(`${path.path}${path.search}${path.hash}`);
    if (urlKey(target) === urlKey(this.options.url.value))
      return;
    if (!this.mounted) {
      this.options.url.value = target;
      return;
    }
    this.saveCurrentScroll();
    const targetKey = urlKey(target);
    const savedScroll = replace || target.hash ? undefined : this.scrollPositions.get(targetKey);
    this.writeHistory(target, state, replace, savedScroll);
    if (this.options.useHistory && location.protocol !== "file:") {
      this.pendingNavigation = {
        key: targetKey,
        replace,
        ...savedScroll ? { scroll: savedScroll } : {}
      };
    }
    this.options.url.value = target;
  }
  back() {
    if (typeof history !== "undefined")
      history.back();
  }
  forward() {
    if (typeof history !== "undefined")
      history.forward();
  }
  async resolveInitialPage(url) {
    const originalURL = url;
    const controller = new AbortController;
    this.activeLoad = controller;
    try {
      const initialStatus = Number(document.body.dataset.yveeError);
      delete document.body.dataset.yveeError;
      let result = await this.options.load(url, controller.signal, initialStatus >= 400 && initialStatus <= 599 ? initialStatus : undefined);
      let redirectCount = 0;
      while (result.kind === "redirect") {
        if (++redirectCount > 10)
          throw new Error("Yvee redirect limit exceeded.");
        url = toURL(result.to);
        result = await this.options.load(url, controller.signal);
      }
      if (urlKey(url) !== urlKey(originalURL))
        this.writeHistory(url, undefined, true);
      return result;
    } finally {
      if (this.activeLoad === controller)
        this.activeLoad = undefined;
    }
  }
  async transition(url, fromHistory = false, restoredScroll) {
    const revision = ++this.revision;
    this.displayedEntry = undefined;
    this.discardPendingHead();
    this.activeLoad?.abort();
    const controller = new AbortController;
    this.activeLoad = controller;
    this.options.onLoading(true);
    let result;
    try {
      result = await this.options.load(url, controller.signal);
    } catch (error) {
      if (this.activeLoad !== controller || !this.mounted)
        return;
      this.activeLoad = undefined;
      this.options.onLoading(false);
      this.options.onError?.(error, url);
      if (this.currentURL)
        this.cancelNavigation(url, false);
      return;
    }
    if (!this.mounted || revision !== this.revision || controller.signal.aborted)
      return;
    this.activeLoad = undefined;
    if (result.kind === "stop") {
      this.options.onLoading(false);
      if (this.currentURL)
        this.cancelNavigation(url, fromHistory);
      return;
    }
    if (result.kind === "redirect") {
      this.options.onLoading(false);
      this.followRedirect(result);
      return;
    }
    this.redirects = 0;
    if (result.failure !== undefined)
      this.options.onError?.(result.failure, result.url);
    const nextHead = this.stageHead(combineHead(this.options.getHead(), result.head), revision);
    await nextHead.ready;
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      nextHead();
      return;
    }
    await this.setRootAndWait(result.body, revision);
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      nextHead();
      return;
    }
    const navigationScroll = this.pendingNavigation?.key === urlKey(url) ? this.pendingNavigation.scroll : undefined;
    this.stopHead?.();
    removeHeadElements(this.options.id);
    await nextHead.activate();
    this.stopHead = nextHead;
    this.clearPendingNavigation(url);
    this.currentURL = result.url;
    this.options.onLoading(false);
    if (fromHistory)
      this.restoreScroll(restoredScroll, revision, result.url);
    else {
      this.replaceAddressIfNeeded(result.url);
      if (navigationScroll && !result.url.hash) {
        this.restoreScroll(navigationScroll, revision, result.url);
      } else {
        this.scrollToRoute(result.url, revision);
      }
    }
  }
  async watchURL() {
    this.stopURL = await StateHook(async (url) => {
      if (!this.mounted || this.ignoreURLHook)
        return;
      await this.transition(url);
    }, [this.options.url], { id: `${this.options.id}_url` });
  }
  followRedirect(result) {
    if (++this.redirects > 10)
      throw new Error("Yvee redirect limit exceeded.");
    this.navigate(result.to, undefined, result.replace ?? true);
  }
  cancelNavigation(url, fromHistory) {
    const pending = this.pendingNavigation;
    this.pendingNavigation = undefined;
    if (!fromHistory && pending?.key === urlKey(url) && !pending.replace && this.options.useHistory && location.protocol !== "file:") {
      this.updateURL(this.currentURL);
      history.back();
      return;
    }
    this.restoreURL(this.currentURL);
  }
  clearPendingNavigation(url) {
    if (this.pendingNavigation?.key === urlKey(url)) {
      this.pendingNavigation = undefined;
    }
  }
  discardPendingHead() {
    for (const cleanup of this.pendingHeads)
      cleanup();
    this.pendingHeads.clear();
  }
  stageHead(config, revision) {
    const cleanup = applyHead(config, `${this.options.id}-route-${revision}`, {
      keepExisting: true,
      deferTitle: true,
      idSeed: `${this.options.id}:h`
    });
    this.pendingHeads.add(cleanup);
    cleanup.ready.then(() => this.pendingHeads.delete(cleanup), () => this.pendingHeads.delete(cleanup));
    return cleanup;
  }
  async setRootAndWait(body, revision) {
    let resolveLoaded;
    const loaded = new Promise((resolve) => {
      resolveLoaded = resolve;
    });
    const cleanup = await StateLoaded(() => resolveLoaded(), [this.options.root], { id: `${this.options.id}_commit_${revision}` });
    try {
      this.options.root.value = body;
      await Promise.race([
        loaded,
        new Promise((resolve) => setTimeout(resolve, 0))
      ]);
    } finally {
      cleanup();
    }
  }
  writeHistory(url, state, replace = false, savedScroll) {
    if (!this.options.useHistory || location.protocol === "file:")
      return;
    const method = replace ? "replaceState" : "pushState";
    const scroll = savedScroll ?? (replace ? getCurrentScroll() : { x: 0, y: 0 });
    history[method]({ ...state, path: urlKey(url), scroll, yveeScrollEntry: this.newEntryKey() }, "", urlKey(url));
  }
  newEntryKey() {
    return `yvee:${this.options.id}:${Date.now()}:${++this.nextEntryId}`;
  }
  entryKey(state) {
    if (state && typeof state === "object" && "yveeScrollEntry" in state && typeof state.yveeScrollEntry === "string")
      return state.yveeScrollEntry;
    return;
  }
  trackDisplayedEntry() {
    const usesHistory = this.options.useHistory && location.protocol !== "file:";
    const existing = usesHistory ? this.entryKey(history.state) : undefined;
    this.displayedEntry = existing ?? this.newEntryKey();
    if (usesHistory && !existing) {
      history.replaceState({ ...history.state, yveeScrollEntry: this.displayedEntry }, "");
    }
  }
  captureDisplayedScroll() {
    if (!this.currentURL || !this.displayedEntry)
      return;
    const position = getCurrentScroll();
    this.rememberScroll(this.displayedEntry, position);
    this.rememberScroll(urlKey(this.currentURL), position);
    this.displayedEntry = undefined;
    return position;
  }
  saveCurrentScroll() {
    const scroll = this.captureDisplayedScroll();
    if (!scroll || !this.options.useHistory || location.protocol === "file:")
      return;
    history.replaceState({ ...history.state, path: urlKey(this.currentURL), scroll }, "");
  }
  rememberScroll(key, position) {
    this.scrollPositions.delete(key);
    this.scrollPositions.set(key, position);
    if (this.scrollPositions.size > 100) {
      const oldest = this.scrollPositions.keys().next().value;
      if (oldest)
        this.scrollPositions.delete(oldest);
    }
  }
  replaceAddressIfNeeded(url) {
    if (!this.options.useHistory || location.protocol === "file:")
      return;
    if (urlKey(url) === `${location.pathname}${location.search}${location.hash}`)
      return;
    history.replaceState(history.state, "", urlKey(url));
  }
  restoreURL(url) {
    if (this.options.useHistory && location.protocol !== "file:") {
      history.replaceState(history.state, "", urlKey(url));
    }
    this.updateURL(url);
    this.trackDisplayedEntry();
  }
  updateURL(url) {
    this.ignoreURLHook = true;
    try {
      this.options.url.value = url;
    } finally {
      this.ignoreURLHook = false;
    }
  }
  initialURL() {
    return toURL(location.protocol === "file:" ? "/" : location.href);
  }
  unmount() {
    this.mounted = false;
    this.revision++;
    this.stopURL?.();
    this.stopURL = undefined;
    this.stopHead?.();
    this.stopHead = undefined;
    this.discardPendingHead();
    this.activeLoad?.abort();
    this.activeLoad = undefined;
    this.options.onLoading(false);
    this.navigation.stop();
    if (this.element?.id)
      Wizard.resetScope(this.element.id);
    this.options.onUnmount();
    this.currentURL = undefined;
    this.displayedEntry = undefined;
    this.scrollPositions.clear();
  }
  restoreScroll(position, revision, url) {
    const restored = position ?? this.scrollPositions.get(urlKey(url));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!this.mounted || revision !== this.revision)
        return;
      if (restored)
        window.scrollTo(restored.x, restored.y);
      else
        window.scrollTo(0, 0);
      this.trackDisplayedEntry();
    }));
  }
  scrollToRoute(url, revision) {
    requestAnimationFrame(() => {
      if (!this.mounted || revision !== this.revision)
        return;
      if (url.hash) {
        const anchor = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (anchor) {
          anchor.scrollIntoView();
          this.trackDisplayedEntry();
          return;
        }
      }
      this.restoreScroll(undefined, revision, url);
    });
  }
}
function getCurrentScroll() {
  return { x: window.scrollX, y: window.scrollY };
}
function getScrollPosition(state) {
  if (!state || typeof state !== "object" || !("scroll" in state))
    return;
  const scroll = state.scroll;
  if (!scroll || typeof scroll !== "object")
    return;
  const position = scroll;
  if (typeof position.x !== "number" || typeof position.y !== "number")
    return;
  return { x: position.x, y: position.y };
}

// src/yvee/routing/routes.ts
var errorCodes = new WeakMap;
function error(status) {
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    throw new RangeError("Expected an HTTP error status between 400 and 599.");
  }
  return (controller) => {
    errorCodes.set(controller, status);
    return controller;
  };
}
var errorStatus = (controller) => errorCodes.get(controller);
var metadataByController = new WeakMap;
var annotate = (path, transport) => (controller) => {
  const metadata = metadataByController.get(controller) ?? [];
  metadataByController.set(controller, [...metadata, { path, transport }]);
  return controller;
};
var page = (path = "/") => annotate(path, "page");
var route = page;
var socketRoute = (path = "/") => annotate(path, "socket");
var routeMetadata = (controller) => metadataByController.get(controller) ?? [];
function compilePath(path, base) {
  const normalizedBase = normalizePath(base);
  const normalizedRoute = normalizePath(path);
  const prefix = normalizedBase === "/" ? "" : normalizedBase;
  const suffix = normalizedRoute === "/" ? "" : normalizedRoute;
  const normalized = normalizePath(`${prefix}/${suffix}`);
  const names = [];
  if (normalized === "/") {
    return { path: normalized, expression: /^\/?$/, names };
  }
  const segments = normalized.slice(1).split("/");
  const pattern = segments.map((segment) => {
    if (!segment.startsWith(":")) {
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    const name = segment.slice(1);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || names.includes(name)) {
      throw new TypeError(`Invalid route parameter: ${segment}`);
    }
    names.push(name);
    return "([^/]+)";
  }).join("/");
  return {
    path: normalized,
    expression: new RegExp(`^/${pattern}/?$`),
    names
  };
}

class RouteBook {
  base;
  entries = [];
  constructor(base = "/") {
    this.base = base;
  }
  add(path, controller, transport = "page") {
    const compiled = compilePath(path, this.base);
    const duplicate = this.entries.some((entry) => entry.path === compiled.path && entry.transport === transport);
    if (duplicate)
      throw new Error(`Route already registered: ${compiled.path}`);
    const entry = { ...compiled, controller, transport };
    this.entries.push(entry);
    return entry;
  }
  find(path, transport = "page") {
    const candidate = normalizePath(path);
    for (const entry of this.entries) {
      if (entry.transport !== transport)
        continue;
      const match = entry.expression.exec(candidate);
      if (!match)
        continue;
      const params = {};
      entry.names.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1] ?? "");
      });
      return { entry, params };
    }
    return;
  }
  all(transport) {
    return this.entries.filter((entry) => !transport || entry.transport === transport);
  }
}

// src/yvee/rendering/server.tsx
function createServerRenderer(context, options = {}) {
  const id = options.id ?? context.id;
  const withStatus = async ({ url: input, data, error }) => {
    const url = toYveeURL(input);
    const payload = data ?? options.data ?? context.data;
    const signal = new AbortController().signal;
    const loaded = await resolvePage(context, url, payload, error, signal);
    if (loaded.kind === "stop") {
      throw new Error(`Yvee server rendering was stopped by a guard for ${url.path}`);
    }
    const head = combineHead(context.defaults, loaded.head);
    const body = await renderBody(loaded.body, context.layout, options.class, id);
    const status = loaded.status;
    return { html: await renderDocument(body, head, id, status), status };
  };
  return Object.assign(async (request) => (await withStatus(request)).html, { withStatus });
}
async function resolvePage(context, initialURL, data, error, signal) {
  let url = initialURL;
  for (let redirects = 0;redirects <= 10; redirects++) {
    const result = await loadPage({
      app: context.app,
      routes: context.routes,
      globalGuards: context.guards,
      errors: context.errors,
      ...error === undefined ? {} : { error },
      url,
      data,
      signal
    });
    if (result.kind !== "redirect")
      return result;
    if (redirects === 10)
      throw new Error("Yvee redirect limit exceeded during server rendering.");
    error = undefined;
    url = toURL(result.to);
  }
  throw new Error("Yvee redirect limit exceeded during server rendering.");
}
async function renderBody(body, layout, className, id) {
  const root = State(body);
  const content = layout ? await layout(root) : root;
  const tree = content instanceof DOM ? content : /* @__PURE__ */ dom("main", {
    class: className
  }, content);
  return (await renderDom(tree, id)).ctx;
}
async function renderDocument(body, head, id, status) {
  const headHTML = await renderHead(head, id);
  return [
    "<!doctype html>",
    '<html lang="en">',
    `<head>${headHTML}</head>`,
    `<body id="${escapeAttribute(id)}"${status >= 400 ? ` data-yvee-error="${Number(status)}"` : ""}>${body}</body>`,
    "</html>"
  ].join("");
}
async function renderHead(head, owner) {
  const parts = [];
  for (const base of head.base ?? []) {
    parts.push(`<base${renderAttributes(base, owner)}>`);
  }
  if (head.description) {
    parts.push(`<meta${renderAttributes({
      name: "description",
      content: head.description
    }, owner)}>`);
  }
  for (const meta of head.meta ?? []) {
    parts.push(`<meta${renderAttributes(meta, owner)}>`);
  }
  for (const script of head.script ?? []) {
    const { body, ...attrs } = script;
    parts.push(`<script${renderAttributes(attrs, owner)}>${body ?? ""}</script>`);
  }
  for (const src of asArray2(head.js)) {
    parts.push(`<script${renderAttributes({ src }, owner)}></script>`);
  }
  if (head.title)
    parts.push(`<title>${escapeText(head.title)}</title>`);
  if (head.style) {
    parts.push(`<style data-yvee="${escapeAttribute(owner)}">${head.style}</style>`);
  }
  for (const link of head.link ?? []) {
    parts.push(`<link${renderAttributes(link, owner)}>`);
  }
  for (const href of asArray2(head.css)) {
    parts.push(`<link${renderAttributes({ rel: "stylesheet", href }, owner)}>`);
  }
  if (head.elements?.length) {
    parts.push((await renderHeadElements(head.elements, owner, `${owner}:h`)).ctx);
  }
  return parts.join("");
}
function renderAttributes(attributes, owner) {
  const marked = {
    ...attributes,
    "data-yvee": owner
  };
  return Object.entries(marked).map(([name, value]) => {
    if (value === false)
      return "";
    if (value === true)
      return ` ${name}`;
    return ` ${name}="${escapeAttribute(value)}"`;
  }).join("");
}
function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function asArray2(value) {
  if (value === undefined)
    return [];
  return Array.isArray(value) ? value : [value];
}
function toYveeURL(value) {
  if (typeof value === "string" || value instanceof URL)
    return toURL(value);
  return toURL(`${value.path}${value.search}${value.hash}`);
}

// src/yvee/platform/websocket.ts
class SocketController {
  connection;
  path = "/";
  params = {};
  open(_event) {}
  message(_event) {}
  close(_event) {}
  error(_event) {}
  sendJson(value) {
    if (this.connection?.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(value));
    }
  }
  onMessage(handler) {
    const previous = this.message.bind(this);
    this.message = (event) => {
      previous(event);
      try {
        handler(JSON.parse(String(event.data)), event);
      } catch {}
    };
    return this;
  }
}

class SocketHub {
  app;
  connections = new Map;
  constructor(app) {
    this.app = app;
  }
  load(path) {
    const routePath = path.startsWith("ws://") || path.startsWith("wss://") ? new URL(path).pathname : path;
    const match = this.app.routes.find(routePath, "socket");
    if (!match)
      throw new Error(`No WebSocket route matches ${path}`);
    const existing = this.connections.get(path);
    if (existing?.connection && existing.connection.readyState < WebSocket.CLOSING) {
      return existing;
    }
    const Controller = match.entry.controller;
    const controller = new Controller;
    const base = typeof location === "undefined" ? "http://localhost" : location.href;
    const address = new URL(path, base);
    address.protocol = address.protocol === "https:" ? "wss:" : "ws:";
    controller.path = path;
    controller.params = match.params;
    controller.connection = new WebSocket(address);
    controller.connection.addEventListener("open", (event) => controller.open(event));
    controller.connection.addEventListener("message", (event) => controller.message(event));
    controller.connection.addEventListener("close", (event) => {
      controller.close(event);
      if (this.connections.get(path) === controller)
        this.connections.delete(path);
    });
    controller.connection.addEventListener("error", (event) => controller.error(event));
    this.connections.set(path, controller);
    return controller;
  }
  unload(path) {
    this.connections.get(path)?.connection?.close();
    this.connections.delete(path);
  }
  closeAll() {
    for (const path of this.connections.keys())
      this.unload(path);
  }
}

// src/yvee/app.ts
class Yvee extends HeadDefaults {
  id;
  routes;
  url;
  loading;
  socket;
  history;
  data = {};
  root;
  pageErrors = new Map;
  globalGuards = [];
  client;
  layout;
  onError;
  constructor(options = {}) {
    super();
    const base = normalizePath(options.base ?? "/");
    const useHistory = options.history ?? true;
    this.id = options.id ?? `yvee-${Math.random().toString(36).slice(2, 9)}`;
    this.url = State(toURL("/"));
    this.loading = State(false);
    this.root = State([]);
    this.routes = new RouteBook(base);
    this.socket = new SocketHub(this);
    this.head({
      base: [{ href: base === "/" ? "/" : `${base}/` }],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" }
      ],
      ...options.index ? { js: options.index } : {}
    });
    this.client = new YveeClient({
      id: this.id,
      base,
      useHistory,
      url: this.url,
      root: this.root,
      load: (url, signal, error) => this.load(url, signal, error),
      getHead: () => this.values,
      getLayout: () => this.layout,
      onLoading: (loading) => {
        this.loading.value = loading;
      },
      onError: (error, url) => {
        if (this.onError)
          this.onError(error, url);
        else
          console.error("Yvee page transition failed", error);
      },
      onUnmount: () => this.socket.closeAll()
    });
    this.history = {
      navigate: (path, state) => this.client.navigate(path, state),
      replace: (path, state) => this.client.navigate(path, state, true),
      back: () => this.client.back(),
      forward: () => this.client.forward()
    };
  }
  Main(layout) {
    this.layout = layout;
    return this;
  }
  use(...guards) {
    this.globalGuards.push(...guards);
    return this;
  }
  head(config) {
    super.head(config);
    return this;
  }
  route(path) {
    return (controller) => {
      this.routes.add(path, controller);
      return controller;
    };
  }
  error(code, controller) {
    this.pageErrors.set(code, controller);
    return this;
  }
  register(...controllers) {
    for (const controller of controllers) {
      const status = errorStatus(controller);
      if (status !== undefined)
        this.error(status, controller);
      for (const metadata of routeMetadata(controller)) {
        this.routes.add(metadata.path, controller, metadata.transport);
      }
    }
    return this;
  }
  listRoutes(transport) {
    return this.routes.all(transport);
  }
  render(options = {}) {
    if (typeof document === "undefined") {
      throw new Error("Yvee.render() needs a browser document.");
    }
    this.data = options.data ?? {};
    return this.client.mount({
      ...options.id ? { id: options.id } : {},
      ...options.class ? { className: options.class } : {},
      ...options.hydrate === undefined ? {} : { hydrate: options.hydrate }
    });
  }
  server(options = {}) {
    return createServerRenderer({
      id: this.id,
      defaults: this.values,
      routes: this.routes,
      errors: this.pageErrors,
      guards: this.globalGuards,
      data: this.data,
      ...this.layout ? { layout: this.layout } : {},
      app: this
    }, options);
  }
  load(url, signal, error) {
    return loadPage({
      app: this,
      routes: this.routes,
      globalGuards: this.globalGuards,
      errors: this.pageErrors,
      url,
      data: this.data,
      ...error === undefined ? {} : { error },
      signal
    });
  }
}
// src/yvee/platform/storage.ts
class StoredValue {
  storeName;
  key;
  current;
  constructor(storeName, key, current) {
    this.storeName = storeName;
    this.key = key;
    this.current = current;
  }
  get value() {
    return this.current;
  }
  set value(value) {
    this.current = value;
  }
  set(value) {
    this.current = value;
    return this;
  }
  save() {
    if (typeof window !== "undefined") {
      this.storage().setItem(this.key, JSON.stringify(this.current));
    }
    return this;
  }
  remove() {
    if (typeof window !== "undefined")
      this.storage().removeItem(this.key);
    return this;
  }
  as = {
    str: () => String(this.current ?? ""),
    int: () => Number.parseInt(String(this.current), 10),
    float: () => Number.parseFloat(String(this.current)),
    bool: () => this.current === true || this.current === "true" || this.current === 1,
    json: () => this.current
  };
  storage() {
    return this.storeName === "localStorage" ? window.localStorage : window.sessionStorage;
  }
}

class BrowserStore {
  storeName;
  constructor(storeName) {
    this.storeName = storeName;
  }
  get(key, fallback) {
    let value;
    if (typeof window !== "undefined") {
      try {
        const raw = this.storage().getItem(key);
        if (raw !== null)
          value = JSON.parse(raw);
      } catch {
        value = undefined;
      }
    }
    return new StoredValue(this.storeName, key, value === undefined ? fallback : value);
  }
  set(key, value) {
    return new StoredValue(this.storeName, key, value).save();
  }
  remove(key) {
    if (typeof window !== "undefined")
      this.storage().removeItem(key);
    return this;
  }
  has(key) {
    return typeof window !== "undefined" && this.storage().getItem(key) !== null;
  }
  storage() {
    return this.storeName === "localStorage" ? window.localStorage : window.sessionStorage;
  }
}
var local = new BrowserStore("localStorage");
var session = new BrowserStore("sessionStorage");
export { State, dom, frag, Page, error, route, socketRoute, SocketController, Yvee };

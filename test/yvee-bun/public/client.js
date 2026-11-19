import {
  isBoolean,
  isArray,
  isFunction,
  isObject,
  isPlainObject,
  Mapper,
  keyInMap,
  keyInMapArray,
  oItems,
  ngify,
  reCamel,
  makeID,
  DOM,
  dom,
  frag
} from "./client-zw79xwpr.js";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, name) => {
  Object.defineProperty(target, "name", {
    value: name,
    enumerable: false,
    configurable: true
  });
  return target;
};
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => (key in obj) ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== undefined && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({
  kind: __decoratorStrings[kind],
  name,
  metadata,
  addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null))
});
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length;i < n; i++)
    flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : {
    get [name]() {
      return __privateGet(this, extra);
    },
    set [name](x) {
      __privateSet(this, extra, x);
    }
  }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1;i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => (name in x) };
      if (k ^ 3)
        access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2)
        access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? undefined : { get: desc.get, set: desc.set } : target, ctx);
    done._ = 1;
    if (k ^ 4 || it === undefined)
      __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null)
      __typeError("Object expected");
    else
      __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __chunkGraphs;
var __chunkSeen;
var __chunkNonce;
var __preload = (id, seenOnly) => {
  for (var [base, graph, ids] of __chunkGraphs || [])
    for (var stack = [id], g = globalThis, d = g.document, head, j, node, k, link;j = stack.pop(); )
      if (!__chunkSeen[j] && (node = graph[j])) {
        __chunkSeen[j] = 1;
        for (k = 1;k < node.length; k++)
          stack.push(ids[node[k]]);
        if (!seenOnly && j !== id && (head = d && d.head)) {
          if (__chunkNonce === undefined)
            __chunkNonce = (k = d.querySelector("meta[property=csp-nonce]")) && (k.nonce || k.getAttribute("nonce")) || "";
          link = d.createElement("link");
          link.rel = "modulepreload";
          link.crossOrigin = "";
          if (__chunkNonce)
            link.nonce = __chunkNonce;
          link.href = new g.URL(node[0], base);
          head.appendChild(link);
        }
      }
};
var __chunks = (base, ids, nodes, entry) => {
  for (var graph = {}, i = 0;i < ids.length; i++)
    graph[ids[i]] = nodes[i];
  (__chunkGraphs ||= []).push([base, graph, ids]);
  __chunkSeen ||= {};
  __preload(ids[entry], 1);
};
__chunks(import.meta.url,["qeq92968","yc7ye83t","48y5r3bw","gf1r0wxd","swdfv3wg","zw79xwpr"],[["./client.js",5],["./features-yc7ye83t.js",5],["./home-48y5r3bw.js",5],["./metadata-gf1r0wxd.js",5],["./studio-swdfv3wg.js",5],["./client-zw79xwpr.js"]],0);

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
// src/core/state/batch.core.ts
var depth = 0;
var pending = new Set;
function scheduleState(dispatch) {
  if (depth)
    pending.add(dispatch);
  else
    dispatch();
}
// src/core/state/hook.stateful.core.ts
var nextHook = 0;
async function StateHook(callback, statefuls, { id = `stateHook:${++nextHook}`, init, signal, scope } = {}) {
  signal?.throwIfAborted();
  scope?.signal.throwIfAborted();
  const hooks = [];
  const smap = () => statefuls.map((st) => st.value);
  const handler = async () => {
    await callback(...smap());
  };
  for (const hook of statefuls) {
    hooks.push(await hook.hook(handler)(id));
  }
  const stop = () => {
    hooks.splice(0).forEach((unhook) => unhook());
    signal?.removeEventListener("abort", stop);
  };
  signal?.addEventListener("abort", stop, { once: true });
  scope?.defer(stop);
  try {
    if (init)
      await handler();
  } catch (error) {
    stop();
    throw error;
  }
  if (signal?.aborted || scope?.disposed)
    stop();
  return stop;
}

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

// src/dom/render/escape.dom.ts
var escapeHTML = (input) => String(input).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

// src/dom/render/trust.dom.ts
function validateAttribute(name, value) {
  if (!/^[A-Za-z_:][A-Za-z0-9:._-]*$/.test(name)) {
    throw new TypeError(`Invalid attribute name: ${name}`);
  }
  const key = name.toLowerCase();
  if (key.startsWith("on") || key === "srcdoc") {
    throw new TypeError(`Executable attribute is not supported: ${name}`);
  }
  if (value === false || value == null)
    return;
  const text = String(value);
  if (key === "srcset" || key === "imagesrcset") {
    if (/data:/i.test(text))
      throw new TypeError("Data URLs are not supported in srcset.");
    for (const candidate of text.split(","))
      validateURL(candidate.trim().split(/\s+/)[0] ?? "", key);
  } else if (["href", "src", "action", "formaction", "poster", "cite", "background", "xlink:href", "data"].includes(key)) {
    validateURL(text, key);
  }
}
function validateURL(value, attribute) {
  const normalized = value.replace(/[\u0000-\u0020\u007f]/g, "");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(normalized)?.[1]?.toLowerCase();
  if (!scheme || ["http", "https"].includes(scheme))
    return;
  if ((attribute === "href" || attribute === "xlink:href") && ["mailto", "tel"].includes(scheme))
    return;
  if (attribute === "src" && /^data:image\/(?:png|gif|jpeg|webp|avif);base64,[a-z0-9+/=]*$/i.test(normalized))
    return;
  throw new TypeError(`Unsupported URL scheme in ${attribute}: ${scheme}`);
}
function inlineContent(tag, value) {
  const text = String(value ?? "");
  if (new RegExp(`</${tag}(?:[\\t\\n\\f\\r />]|$)`, "i").test(text) || tag === "script" && /<!--|<script[\t\n\f\r />]/i.test(text)) {
    throw new TypeError(`Unsafe inline ${tag} content; use an external file or serializePayload for JSON.`);
  }
  return text;
}
function serializePayload(value) {
  const json = JSON.stringify(value, (_key, item) => {
    if (typeof item === "bigint" || typeof item === "function" || typeof item === "symbol" || item === undefined || typeof item === "number" && !Number.isFinite(item)) {
      throw new TypeError("Bootstrap payload must contain JSON-serializable values.");
    }
    return item;
  });
  if (json === undefined)
    throw new TypeError("Bootstrap payload must be JSON-serializable.");
  return json.replace(/[<>&\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
function renderJSONScript(value, options) {
  return `<script type="application/json" id="${escapeHTML(options.id)}"${options.nonce === undefined ? "" : ` nonce="${escapeHTML(options.nonce)}"`}>${serializePayload(value)}</script>`;
}

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
class Stateful extends EventTarget {
  options;
  hooks = new Mapper;
  loads = new Mapper;
  states = new Mapper;
  _value;
  listening = false;
  controller = new AbortController;
  pending = new Set;
  failures = [];
  emit = () => {
    this.controller.abort();
    this.controller = new AbortController;
    this.dispatchEvent(new CustomEvent("updated", { detail: this._value }));
  };
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
  async flush() {
    while (this.pending.size)
      await Promise.all([...this.pending]);
    const failures = this.failures.splice(0);
    if (failures.length === 1)
      throw failures[0];
    if (failures.length)
      throw new AggregateError(failures, "State updates failed.");
  }
  report(error) {
    this.failures.push(error);
    const event = new CustomEvent("error", { detail: error, cancelable: true });
    this.dispatchEvent(event);
    try {
      if (this.options.onError)
        this.options.onError(error);
      else if (!event.defaultPrevented)
        console.error("Yvee state update failed", error);
    } catch (reportError) {
      console.error("Yvee state error handler failed", reportError);
    }
  }
  async update(value, update) {
    const errors = [];
    const attempt = async (callback) => {
      try {
        await callback();
      } catch (error) {
        if (update.isCurrent())
          errors.push(error);
      }
    };
    for (const [id, hook] of [...this.hooks.entries()]) {
      if (!update.isCurrent())
        return;
      if (this.hooks.get(id) !== hook)
        continue;
      await attempt(() => hook(update));
    }
    for (const [id, bindings] of this.states) {
      const element = getElementById(id);
      if (!element || !bindings.size) {
        this.states.delete(id);
        continue;
      }
      for (const [entry, binding] of [...bindings.entries()]) {
        if (!update.isCurrent())
          return;
        const owned = () => update.isCurrent() && this.states.get(id)?.get(entry) === binding && getElementById(id) === element;
        if (!owned())
          continue;
        await attempt(() => binding.call(element, value, { signal: update.signal, isCurrent: owned }));
      }
    }
    if (!update.isCurrent())
      return;
    if (!errors.length) {
      for (const [id, loaded] of [...this.loads.entries()]) {
        if (!update.isCurrent())
          return;
        if (this.loads.get(id) === loaded)
          await attempt(loaded);
      }
      if (update.isCurrent())
        this.dispatchEvent(new CustomEvent("loaded", { detail: value }));
    }
    if (errors.length === 1)
      throw errors[0];
    if (errors.length)
      throw new AggregateError(errors, "State subscribers failed.");
  }
  listen() {
    if (this.options.signal?.aborted)
      return () => {};
    if (!this.listening) {
      const handler = (event) => {
        const controller = this.controller;
        const update = { signal: controller.signal, isCurrent: () => !controller.signal.aborted };
        let stopAbort;
        const aborted = new Promise((resolve) => {
          const done = () => resolve();
          controller.signal.addEventListener("abort", done, { once: true });
          stopAbort = () => controller.signal.removeEventListener("abort", done);
        });
        const work = this.update(event.detail, update).catch((error) => {
          if (update.isCurrent())
            this.report(error);
        });
        const job = Promise.race([work, aborted]).finally(() => {
          stopAbort();
          this.pending.delete(job);
          this.stopListeningWhenUnused();
        });
        this.pending.add(job);
      };
      const abort = () => this.end?.();
      this.options.signal?.addEventListener("abort", abort, { once: true });
      this.addEventListener("updated", handler, this.options);
      this.listening = true;
      this.end = () => {
        this.removeEventListener("updated", handler, this.options);
        this.options.signal?.removeEventListener("abort", abort);
        this.controller.abort();
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
      this.listen();
      return () => {
        const entries = this.states.get(id);
        if (entries?.get(entry) === callback)
          entries.delete(entry);
        if (entries && !entries.size)
          this.states.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  hook(callback) {
    return async (id) => {
      this.hooks.set(id, callback);
      this.listen();
      return () => {
        if (this.hooks.get(id) === callback)
          this.hooks.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  loaded(callback) {
    return (id) => {
      this.loads.set(id, callback);
      this.listen();
      return () => {
        if (this.loads.get(id) === callback)
          this.loads.delete(id);
        this.stopListeningWhenUnused();
      };
    };
  }
  dispatch() {
    scheduleState(this.emit);
  }
}
function State(value, options = {}) {
  return new Stateful(value, options);
}
// src/core/scope/registry.ts
function createScopeRegistry() {
  return new Map;
}
var registry = createScopeRegistry();
// src/core/storage/estream.storage.core.ts
var eventSources = new Map;
var eventListeners = new Map;
var eventOwners = new Map;
// src/core/disposal.core.ts
class DisposalScope {
  controller = new AbortController;
  cleanups = new Set;
  get signal() {
    return this.controller.signal;
  }
  get disposed() {
    return this.signal.aborted;
  }
  defer(cleanup) {
    let active = true;
    const release = () => {
      if (!active)
        return;
      active = false;
      this.cleanups.delete(release);
      cleanup();
    };
    if (this.disposed)
      release();
    else
      this.cleanups.add(release);
    return release;
  }
  own(resource) {
    this.defer(() => {
      if ("dispose" in resource)
        resource.dispose();
      else
        resource.close();
    });
    return resource;
  }
  listen(target, type, listener, options) {
    if (this.disposed)
      return () => {};
    target.addEventListener(type, listener, options);
    return this.defer(() => target.removeEventListener(type, listener, options));
  }
  timeout(callback, ms) {
    if (this.disposed)
      return () => {};
    const timer = setTimeout(() => {
      release();
      if (!this.disposed)
        callback();
    }, ms);
    const release = this.defer(() => clearTimeout(timer));
    return release;
  }
  dispose() {
    if (this.disposed)
      return;
    this.controller.abort();
    const errors = [];
    for (const cleanup of [...this.cleanups].reverse()) {
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, "Resource cleanup failed.");
  }
}
// src/yvee/rendering/head/config.ts
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
  head(value) {
    const config = normalizeHeadValue(value);
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
  tokens = new Map;
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
  async stage(isCurrent = () => true) {
    for (const [id, ev] of [...this.events.entries()]) {
      if (!isCurrent())
        return this;
      this.events.delete(id);
      const E = getElementById(id);
      if (!E) {
        continue;
      }
      const token = {};
      this.tokens.set(id, token);
      const owned = () => isCurrent() && this.tokens.get(id) === token && getElementById(id) === E;
      const retain = (cleanup) => {
        if (owned())
          keyInMapArray(id, this.resetEV).push(cleanup);
        else
          cleanup();
      };
      const eread = ev.get("ready");
      if (eread) {
        const er = await eread.apply(E, [E]);
        if (isFunction(er)) {
          retain(er);
        }
      }
      if (!owned())
        return this;
      let ctr = 0;
      for (const [type, event] of ev.entries()) {
        if (!owned())
          return this;
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
            const it = await event.apply(E, [E]);
            if (!owned())
              return this;
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
                await handler();
              if (!owned())
                return this;
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
    for (const [id, v] of [...this.states.entries()]) {
      if (!isCurrent())
        return this;
      this.states.delete(id);
      if (!getElementById(id))
        continue;
      const token = this.tokens.get(id) ?? {};
      this.tokens.set(id, token);
      for (const f of v) {
        const stop = await f(id);
        if (!isCurrent() || this.tokens.get(id) !== token) {
          stop();
          return this;
        }
        keyInMapArray(id, this.resetST).push(stop);
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
      this.tokens.delete(st);
      this.events.delete(st);
      this.states.delete(st);
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
      ...this.tokens.keys(),
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
  async RPS(oz, isCurrent = () => true) {
    if (!isCurrent())
      return this;
    const ids = IDNotConnected();
    this.reset(ids);
    if (oz) {
      const zk = oz.keys;
      if (zk.length)
        await this.reset(zk).push(oz).stage(isCurrent);
    }
    this.processWindowEvents;
    this.processDocumentEvents;
    return this;
  }
}
var Wizard = new OZ;
// src/dom/render/idm.dom.ts
class Idm {
  nonce;
  counter;
  baseId;
  constructor(seed, counter = 0, nonce) {
    this.nonce = nonce;
    this.baseId = seed || makeID(4);
    this.counter = Number.isSafeInteger(counter) && counter >= 0 ? counter : 0;
  }
  static fromId(id, nonce) {
    const match = /^(.*)-(\d+)$/.exec(id);
    if (!match || !match[1])
      return new Idm(id, 0, nonce);
    return new Idm(match[1], Number(match[2]), nonce);
  }
  get id() {
    return `${this.baseId}-${this.counter}`;
  }
  get nextId() {
    return `${this.baseId}-${this.counter++}`;
  }
  get childId() {
    return Idm.fromId(`${this.nextId}-0`, this.nonce);
  }
  append(prefix = "h") {
    return Idm.fromId(`${prefix}${this.id}`, this.nonce);
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
    validateAttribute(ky, undefined);
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
      this.map.set("id", [escapeHTML(id)]);
    }
  }
  get id() {
    return this.internalId ?? this.map.get("id")?.join("");
  }
  setId(id) {
    this.internalId = id;
  }
}

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
var processCTXStateful = async (value, xid, nonce) => {
  const ndm = xid ? Idm.fromId(xid, nonce) : new Idm(undefined, 0, nonce);
  const catt = new CATT(ndm.id, ndm);
  const ctx = await ctx_value(value, catt);
  return { ctx, catt };
};
async function Callback(arg, nonce, update) {
  const elementId = this.id;
  if (elementId) {
    const { ctx, catt } = await processCTXStateful(arg, elementId, nonce);
    if (update && !update.isCurrent())
      return false;
    if (this.innerHTML !== ctx) {
      this.innerHTML = ctx;
      await Wizard.RPS(catt.OZ, update?.isCurrent);
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
      const { ctx, catt: _ct } = await processCTXStateful(VL, catt.xid + "-0", catt.IDM.nonce);
      catt.xid = _ct.xid;
      inner.push(ctx);
      catt.OZ.push(_ct.OZ);
      catt.states.push(v.call(function(arg, update) {
        return Callback.call(this, arg, catt.IDM.nonce, update);
      }, entry));
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
    let ctx;
    const rawTag = this.tag.toLowerCase();
    if (rawTag === "script" || rawTag === "style") {
      const flatten = async (value) => {
        const resolved = await value;
        if (Array.isArray(resolved))
          return (await Promise.all(resolved.map(flatten))).join("");
        if (typeof resolved === "function")
          return flatten(resolved());
        if (resolved == null)
          return "";
        if (typeof resolved !== "string" && typeof resolved !== "number")
          throw new TypeError("Inline script/style children must be static text.");
        return String(resolved);
      };
      ctx = inlineContent(rawTag, await flatten(this.ctx));
    } else
      ctx = await this.process(catt);
    if (!this.tag)
      return ctx;
    if (catt.events.size || catt.states.length)
      catt.id = elementId;
    if (hasTag(this.tag)) {
      if (ctx)
        throw new TypeError(`<${this.tag}> cannot contain child content.`);
      return `<${this.tag}${catt.attr}>`;
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
        const text = dom_attr_value(value);
        validateAttribute(attr, text);
        this.setAttribute(attr, text);
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
      if (pre !== "style" && !(v instanceof Stateful) && !isObject(v))
        validateAttribute(k, dom_attr_value(v));
      if (isArray(v)) {
        if (!pre)
          validateAttribute(k, dom_attr_value(v));
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
  const nonceAttr = ["script", "style"].includes(tag.toLowerCase()) && idm.nonce !== undefined ? { ...attr2, nonce: idm.nonce } : attr2;
  const attributes = new ATTR(nonceAttr);
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
// src/yvee/rendering/head/elements.ts
async function renderHeadElements(elements, owner, idSeed, nonce) {
  const idm = new Idm(idSeed, 0, nonce);
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
  const attr = resolved.tag ? { ...resolved.attr, "data-yv": owner } : resolved.attr;
  return new DOM(resolved.tag, attr, children);
}

// src/yvee/rendering/head/stylesheets.ts
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

// src/yvee/rendering/head/browser.ts
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
    if (tag === "script" && typeof attrs.src === "string") {
      const src = new URL(attrs.src, document.baseURI).href;
      const type = String(attrs.type ?? "").toLowerCase();
      const existing = Array.from(document.head.querySelectorAll("script[src]")).find((script) => script.src === src && script.type.toLowerCase() === type);
      if (existing)
        return;
    }
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "body" || value === undefined)
        continue;
      validateAttribute(key, value);
      if (typeof value === "boolean")
        node.toggleAttribute(key, value);
      else
        node.setAttribute(key, String(value));
    }
    if ((tag === "script" || tag === "style") && options.nonce !== undefined)
      node.setAttribute("nonce", options.nonce);
    node.dataset.yv = owner;
    if (tag === "script" && attrs.body)
      node.textContent = inlineContent("script", attrs.body);
    document.head.append(node);
    nodes.push(node);
    if (tag === "link" && String(attrs.rel ?? "").toLowerCase() === "stylesheet") {
      stylesheetLinks.push(node);
    }
  };
  const ownerIdSeed = options.idSeed ?? `${owner}:h`;
  const ready = (async () => {
    if (!options.keepExisting)
      removeHeadElements(owner);
    const base = config.base?.at(-1);
    if (base) {
      document.head.querySelectorAll("base").forEach((node) => node.remove());
      append("base", base);
    }
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
      style.textContent = inlineContent("style", config.style);
      if (options.nonce !== undefined)
        style.setAttribute("nonce", options.nonce);
      style.dataset.yv = owner;
      document.head.append(style);
      nodes.push(style);
    }
    if (config.elements?.length) {
      renderedHead = await renderHeadElements(config.elements, owner, ownerIdSeed, options.nonce);
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
      await Wizard.RPS(renderedHead.oz, () => !cancelled && activated);
  })();
  const cleanup = () => {
    if (cancelled)
      return;
    cancelled = true;
    try {
      stylesheetWait.cancel();
      if (activated && renderedHead)
        Wizard.resetScope(ownerIdSeed);
    } finally {
      const managedTitle = dynamicTitle?.textContent ?? title;
      const shouldRestoreTitle = titleManaged && document.title === managedTitle;
      nodes.forEach((node) => node.remove());
      dynamicTitle?.remove();
      if (shouldRestoreTitle)
        document.title = previousTitle;
    }
  };
  cleanup.ready = ready.catch((error) => {
    cleanup();
    throw error;
  });
  cleanup.activate = async () => {
    if (cancelled || activated)
      return;
    previousTitle = document.title;
    activated = true;
    if (dynamicTitle) {
      document.head.querySelectorAll("title").forEach((node) => {
        if (node !== dynamicTitle)
          node.remove();
      });
      document.head.append(dynamicTitle);
      nodes.push(dynamicTitle);
      titleManaged = true;
    } else if (config.title !== undefined) {
      document.title = title;
      titleManaged = true;
    }
    if (renderedHead)
      await Wizard.RPS(renderedHead.oz, () => !cancelled && activated);
  };
  cleanup.cancel = () => stylesheetWait.cancel();
  return cleanup;
}
function removeHeadElements(owner) {
  if (typeof document === "undefined")
    return;
  document.head.querySelectorAll("[data-yv]").forEach((node) => {
    if (node.getAttribute("data-yv") !== owner)
      return;
    if (node instanceof HTMLScriptElement && node.hasAttribute("src"))
      return;
    node.remove();
  });
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
  resources = new DisposalScope;
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
  ownPageSignal(page, signal);
  try {
    const decision = await checkGuards([...globalGuards, ...guardsFor(page.constructor)], { app, page, url, params: page.params, data: page.data, signal });
    if (decision.kind !== "allow") {
      page.resources.dispose();
      return decision;
    }
    const loaded = await renderPage(page, url, signal);
    return { ...loaded, url, dispose: () => page.resources.dispose() };
  } catch (failure) {
    page.resources.dispose();
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
  page.data = Object.assign(Object.create(null), page.data, data);
}
async function renderPage(page, url, signal) {
  if (signal.aborted)
    throw signal.reason ?? new Error("Page load aborted.");
  if (page.fetch) {
    const fetched = await page.fetch({
      url,
      params: page.params,
      data: page.data,
      signal: page.resources.signal,
      resources: page.resources
    });
    Object.assign(page.data, fetched);
  }
  if (signal.aborted)
    throw signal.reason ?? new Error("Page load aborted.");
  const bodyModule = await page.body?.();
  if (signal.aborted)
    throw signal.reason ?? new Error("Page load aborted.");
  const { bodyValue, moduleHead } = await resolveBodyModule(bodyModule, page);
  signal.throwIfAborted();
  const routeHead = await page.head?.();
  signal.throwIfAborted();
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
  const moduleHead = typeof value.head === "function" ? await value.head({ page }) : await value.head;
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
  ownPageSignal(page, signal);
  try {
    const decision = await checkGuards([...globalGuards, ...guardsFor(page.constructor)], { app, page, url, params: page.params, data: page.data, signal });
    if (decision.kind !== "allow") {
      page.resources.dispose();
      return decision;
    }
    return { ...await renderPage(page, url, signal), url, failure, dispose: () => page.resources.dispose() };
  } catch (error) {
    page.resources.dispose();
    if (signal.aborted)
      throw signal.reason ?? error;
    throw new AggregateError([failure, error], "Yvee error page failed to render.");
  }
}
function ownPageSignal(page, signal) {
  const abort = () => {
    try {
      page.resources.dispose();
    } catch (error) {
      console.error("Yvee aborted page cleanup failed", error);
    }
  };
  if (signal.aborted)
    abort();
  else {
    signal.addEventListener("abort", abort, { once: true });
    page.resources.defer(() => signal.removeEventListener("abort", abort));
  }
}

// src/yvee/client/mount.tsx
async function mountRoot({ element, id, className, root, layout, hydrate = true, nonce, isCurrent }) {
  const content = layout ? await layout(root) : root;
  const tree = content instanceof DOM ? content : /* @__PURE__ */ dom("main", {
    class: className
  }, content);
  const rendered = await renderDom(tree, new Idm(element.id || id, 0, nonce));
  if (isCurrent && !isCurrent())
    return;
  const template = document.createElement("template");
  template.innerHTML = rendered.ctx;
  if (!hydrate || element.innerHTML !== template.innerHTML) {
    element.innerHTML = rendered.ctx;
  }
  await Wizard.RPS(rendered.oz, isCurrent);
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
    const root = this.options.root?.();
    if (root && anchor.closest("[data-app]") !== root)
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
    if (this.options.history !== false) {
      this.previousScrollRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
      window.addEventListener("popstate", this.handlePop);
    }
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

// src/yvee/client/runtime/history.ts
class RouteHistory {
  options;
  displayedEntry;
  nextEntryId = 0;
  scrollPositions = new Map;
  constructor(options) {
    this.options = options;
  }
  pop(url, state) {
    this.captureDisplayedScroll();
    const key = urlKey(url);
    const scroll = this.scrollPositions.get(this.entryKey(state) ?? "") ?? getScrollPosition(state) ?? this.scrollPositions.get(key);
    if (scroll)
      this.rememberScroll(key, scroll);
    return scroll;
  }
  initialize(url) {
    this.trackDisplayedEntry();
    this.rememberScroll(urlKey(url), getScrollPosition(history.state) ?? getCurrentScroll());
  }
  getScroll(key) {
    return this.scrollPositions.get(key);
  }
  beginTransition() {
    this.displayedEntry = undefined;
  }
  reset() {
    this.displayedEntry = undefined;
    this.scrollPositions.clear();
  }
  restoreAddress(url) {
    if (this.options.enabled && location.protocol !== "file:") {
      history.replaceState(history.state, "", urlKey(url));
    }
  }
  write(url, state, replace = false, savedScroll) {
    if (!this.options.enabled || location.protocol === "file:")
      return;
    const method = replace ? "replaceState" : "pushState";
    const scroll = savedScroll ?? (replace ? getCurrentScroll() : { x: 0, y: 0 });
    history[method]({ ...state, path: urlKey(url), scroll, yveeScrollEntry: this.newEntryKey() }, "", urlKey(url));
  }
  newEntryKey() {
    return `yv:${this.options.id}:${Date.now()}:${++this.nextEntryId}`;
  }
  entryKey(state) {
    if (state && typeof state === "object" && "yveeScrollEntry" in state && typeof state.yveeScrollEntry === "string")
      return state.yveeScrollEntry;
    return;
  }
  trackDisplayedEntry() {
    const usesHistory = this.options.enabled && location.protocol !== "file:";
    const existing = usesHistory ? this.entryKey(history.state) : undefined;
    this.displayedEntry = existing ?? this.newEntryKey();
    if (usesHistory && !existing) {
      history.replaceState({ ...history.state, yveeScrollEntry: this.displayedEntry }, "");
    }
  }
  captureDisplayedScroll() {
    const currentURL = this.options.currentURL();
    if (!currentURL || !this.displayedEntry)
      return;
    const position = getCurrentScroll();
    this.rememberScroll(this.displayedEntry, position);
    this.rememberScroll(urlKey(currentURL), position);
    this.displayedEntry = undefined;
    return position;
  }
  saveCurrentScroll() {
    const scroll = this.captureDisplayedScroll();
    if (!scroll || !this.options.enabled || location.protocol === "file:")
      return;
    history.replaceState({ ...history.state, path: urlKey(this.options.currentURL()), scroll }, "");
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
    if (!this.options.enabled || location.protocol === "file:")
      return;
    if (urlKey(url) === `${location.pathname}${location.search}${location.hash}`)
      return;
    history.replaceState(history.state, "", urlKey(url));
  }
}
function getCurrentScroll() {
  return { x: window.scrollX, y: window.scrollY };
}
function getScrollPosition(state) {
  if (!state || typeof state !== "object" || !("scroll" in state))
    return;
  const scroll = state.scroll;
  if (!scroll || typeof scroll !== "object" || !("x" in scroll) || !("y" in scroll))
    return;
  if (typeof scroll.x !== "number" || typeof scroll.y !== "number")
    return;
  return { x: scroll.x, y: scroll.y };
}

// src/yvee/client/runtime/scroll.ts
class RouteScroll {
  options;
  constructor(options) {
    this.options = options;
  }
  async restoreScroll(position, revision, url) {
    const restored = position ?? this.options.history.getScroll(urlKey(url));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (this.options.isCurrent(revision)) {
        routeScroll(() => {
          if (restored)
            window.scrollTo(restored.x, restored.y);
          else
            window.scrollTo(0, 0);
        });
        this.options.history.trackDisplayedEntry();
      }
      resolve();
    })));
  }
  async scrollToRoute(url, revision) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    if (!this.options.isCurrent(revision))
      return;
    if (url.hash) {
      const anchor = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (anchor) {
        routeScroll(() => anchor.scrollIntoView());
        this.options.history.trackDisplayedEntry();
        return;
      }
    }
    await this.restoreScroll(undefined, revision, url);
  }
}
function routeScroll(scroll) {
  if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    scroll();
    return;
  }
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  try {
    scroll();
  } finally {
    root.style.scrollBehavior = previous;
  }
}

// src/yvee/client/runtime/accessibility.ts
class RouteAccessibility {
  id;
  element;
  status;
  constructor(id, element) {
    this.id = id;
    this.element = element;
  }
  dispose() {
    this.status?.remove();
    this.status = undefined;
  }
  mount() {
    const status = document.createElement("div");
    status.dataset.yveeRouteStatus = this.id;
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    Object.assign(status.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0"
    });
    document.body.append(status);
    this.status = status;
  }
  commit(url, isCurrent) {
    const element = this.element();
    if (!isCurrent() || !element)
      return;
    const hashTarget = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    const target = hashTarget && (element === hashTarget || element.contains(hashTarget)) ? hashTarget : (element.matches("[data-yvee-focus]") ? element : null) ?? element.querySelector("[data-yvee-focus]") ?? (element.matches("h1") ? element : null) ?? element.querySelector("h1") ?? (element.tagName === "BODY" ? null : element);
    if (target) {
      const addedTabIndex = !target.hasAttribute("tabindex");
      if (addedTabIndex)
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (addedTabIndex) {
        if (document.activeElement === target) {
          target.addEventListener("blur", () => {
            if (target.getAttribute("tabindex") === "-1")
              target.removeAttribute("tabindex");
          }, { once: true });
        } else if (target.getAttribute("tabindex") === "-1") {
          target.removeAttribute("tabindex");
        }
      }
    }
    const status = this.status;
    if (!status)
      return;
    status.textContent = "";
    requestAnimationFrame(() => {
      if (isCurrent() && status.isConnected) {
        status.textContent = document.title || target?.textContent?.trim() || url.path;
      }
    });
  }
}

// src/yvee/client/runtime/view.ts
class RouteView {
  options;
  active;
  nonce;
  pending = new Set;
  committedHead;
  committedBody;
  constructor(options) {
    this.options = options;
  }
  remember(body, head) {
    this.committedBody = body;
    this.committedHead = head;
  }
  reset() {
    this.committedHead = undefined;
    this.committedBody = undefined;
  }
  async setBody(body, revision) {
    this.options.root.value = body;
    try {
      await this.options.root.flush();
    } catch (error) {
      if (this.options.isCurrent(revision) && this.committedBody) {
        this.options.root.value = this.committedBody;
        try {
          await this.options.root.flush();
        } catch (rollback) {
          throw new AggregateError([error, rollback], "Route commit and rollback failed.");
        }
      }
      throw error;
    }
  }
  async activate(nextHead, revision) {
    this.active?.();
    try {
      await nextHead.activate();
    } catch (error) {
      if (this.options.isCurrent(revision)) {
        nextHead();
        try {
          if (this.committedBody) {
            this.options.root.value = this.committedBody;
            await this.options.root.flush();
          }
          if (this.committedHead) {
            const restored = this.stage(this.committedHead, revision);
            await restored.ready;
            await restored.activate();
            this.active = restored;
            this.releasePending(restored);
          }
        } catch (rollback) {
          throw new AggregateError([error, rollback], "Head commit and rollback failed.");
        }
      }
      throw error;
    }
  }
  releasePending(head) {
    this.pending.delete(head);
  }
  releaseActive() {
    const active = this.active;
    this.active = undefined;
    active?.();
  }
  discardPending() {
    const cleanups = [...this.pending];
    this.pending.clear();
    const errors = [];
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, "Pending head cleanup failed.");
  }
  stage(config, revision) {
    const cleanup = applyHead(config, `${this.options.id}-r${revision}`, {
      keepExisting: true,
      deferTitle: true,
      idSeed: `${this.options.id}:h`,
      ...this.nonce === undefined ? {} : { nonce: this.nonce }
    });
    this.pending.add(cleanup);
    return cleanup;
  }
}

// src/yvee/client/runtime/client.ts
class YveeClient {
  options;
  navigation;
  history;
  scroll;
  accessibility;
  view;
  nonce;
  element;
  mounted = false;
  ignoreURLHook = false;
  revision = 0;
  mountEpoch = 0;
  redirects = 0;
  stopPage;
  pendingPages = new Set;
  currentURL;
  pendingNavigation;
  stopURL;
  activeLoad;
  constructor(options) {
    this.options = options;
    this.history = new RouteHistory({ id: options.id, enabled: options.useHistory, currentURL: () => this.currentURL });
    this.scroll = new RouteScroll({ history: this.history, isCurrent: (revision) => this.mounted && revision === this.revision });
    this.accessibility = new RouteAccessibility(options.id, () => this.element);
    this.view = new RouteView({
      id: options.id,
      root: options.root,
      isCurrent: (revision) => this.mounted && revision === this.revision
    });
    this.navigation = new NavigationEvents({
      base: options.base,
      history: options.useHistory,
      root: () => this.element,
      onPop: (url, state) => {
        const scroll = this.history.pop(url, state);
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
    try {
      return await this.mountAtRevision(options, mountRevision);
    } catch (error) {
      if (mountRevision === this.revision) {
        this.unmount();
        this.options.onError?.(error, this.initialURL());
      }
      throw error;
    }
  }
  async mountAtRevision(options, mountRevision) {
    this.options.onMount?.();
    this.nonce = options.nonce;
    this.view.nonce = options.nonce;
    const mountEpoch = this.mountEpoch;
    const stop = () => {
      if (mountEpoch === this.mountEpoch)
        this.unmount();
    };
    this.element = options.id ? document.getElementById(options.id) ?? undefined : document.body;
    if (!this.element)
      throw new Error(`Yvee mount element not found: ${options.id}`);
    if (!document.body.id)
      document.body.id = options.id ?? this.options.id;
    this.element.dataset.app = this.options.id;
    this.mounted = true;
    this.options.onLoading(true);
    const firstPage = await this.resolveInitialPage(this.initialURL());
    if (!this.mounted || mountRevision !== this.revision) {
      if (firstPage.kind === "ready")
        firstPage.dispose?.();
      return stop;
    }
    if (firstPage.kind === "ready") {
      if (firstPage.dispose)
        this.pendingPages.add(firstPage.dispose);
      if (firstPage.failure !== undefined) {
        this.options.onError?.(firstPage.failure, firstPage.url);
      }
      this.options.url.value = firstPage.url;
      this.options.root.value = firstPage.body;
      const initialHead = this.view.stage(combineHead(this.options.getHead(), firstPage.head), mountRevision);
      this.view.active = initialHead;
      await initialHead.ready;
      if (!this.mounted || mountRevision !== this.revision) {
        initialHead();
        return stop;
      }
      removeHeadElements("root");
      await initialHead.activate();
      this.view.releasePending(initialHead);
      const layout = this.options.getLayout();
      await mountRoot({
        element: this.element,
        id: this.options.id,
        root: this.options.root,
        isCurrent: () => this.mounted && mountRevision === this.revision,
        ...this.nonce === undefined ? {} : { nonce: this.nonce },
        ...options.className ? { className: options.className } : {},
        ...options.hydrate === undefined ? {} : { hydrate: options.hydrate },
        ...layout ? { layout } : {}
      });
      if (!this.mounted || mountRevision !== this.revision)
        return stop;
      this.accessibility.mount();
      this.stopPage = firstPage.dispose;
      if (firstPage.dispose)
        this.pendingPages.delete(firstPage.dispose);
      this.view.remember(firstPage.body, combineHead(this.options.getHead(), firstPage.head));
      this.currentURL = firstPage.url;
      this.history.initialize(firstPage.url);
    }
    this.options.onLoading(false);
    await this.watchURL();
    if (!this.mounted || mountRevision !== this.revision)
      return stop;
    this.navigation.start();
    return stop;
  }
  navigate(path, state, replace = false) {
    const target = typeof path === "string" ? toURL(path) : toURL(`${path.path}${path.search}${path.hash}`);
    if (urlKey(target) === urlKey(this.options.url.value))
      return;
    if (!this.mounted) {
      this.options.url.value = target;
      return;
    }
    this.history.saveCurrentScroll();
    const targetKey = urlKey(target);
    const savedScroll = replace || target.hash ? undefined : this.history.getScroll(targetKey);
    this.history.write(target, state, replace, savedScroll);
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
      const initialStatus = Number(document.body.dataset.error);
      delete document.body.dataset.error;
      let result = await this.options.load(url, controller.signal, initialStatus >= 400 && initialStatus <= 599 ? initialStatus : undefined);
      let redirectCount = 0;
      while (result.kind === "redirect") {
        if (++redirectCount > 10)
          throw new Error("Yvee redirect limit exceeded.");
        url = toURL(result.to);
        result = await this.options.load(url, controller.signal);
      }
      if (urlKey(url) !== urlKey(originalURL))
        this.history.write(url, undefined, true);
      return result;
    } finally {
      if (this.activeLoad === controller)
        this.activeLoad = undefined;
    }
  }
  async transition(url, fromHistory = false, restoredScroll) {
    const revision = this.revision + 1;
    try {
      await this.runTransition(url, fromHistory, restoredScroll);
    } catch (error) {
      if (!this.mounted || revision !== this.revision)
        return;
      const errors = [error];
      try {
        this.view.discardPending();
      } catch (cleanup) {
        errors.push(cleanup);
      }
      try {
        this.discardPendingPages();
      } catch (cleanup) {
        errors.push(cleanup);
      }
      this.options.onLoading(false);
      this.options.onError?.(errors.length === 1 ? error : new AggregateError(errors, "Transition cleanup failed."), url);
      if (this.currentURL)
        this.cancelNavigation(url, fromHistory);
    }
  }
  async runTransition(url, fromHistory = false, restoredScroll) {
    const revision = ++this.revision;
    this.history.beginTransition();
    this.view.discardPending();
    this.discardPendingPages();
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
        this.cancelNavigation(url, fromHistory);
      return;
    }
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      if (result.kind === "ready")
        result.dispose?.();
      return;
    }
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
    if (result.dispose)
      this.pendingPages.add(result.dispose);
    this.redirects = 0;
    if (result.failure !== undefined)
      this.options.onError?.(result.failure, result.url);
    const nextHead = this.view.stage(combineHead(this.options.getHead(), result.head), revision);
    await nextHead.ready;
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      nextHead();
      return;
    }
    await this.view.setBody(result.body, revision);
    if (!this.mounted || revision !== this.revision || controller.signal.aborted) {
      nextHead();
      return;
    }
    const navigationScroll = this.pendingNavigation?.key === urlKey(url) ? this.pendingNavigation.scroll : undefined;
    await this.view.activate(nextHead, revision);
    if (!this.mounted || revision !== this.revision) {
      nextHead();
      return;
    }
    this.view.active = nextHead;
    this.view.releasePending(nextHead);
    this.clearPendingNavigation(url);
    const previousPage = this.stopPage;
    this.stopPage = result.dispose;
    if (result.dispose)
      this.pendingPages.delete(result.dispose);
    try {
      previousPage?.();
    } catch (error) {
      this.options.onError?.(error, result.url);
    }
    this.view.remember(result.body, combineHead(this.options.getHead(), result.head));
    this.currentURL = result.url;
    if (!this.options.useHistory) {
      this.accessibility.commit(result.url, () => this.mounted && revision === this.revision);
      this.options.onLoading(false);
      return;
    }
    if (fromHistory)
      await this.scroll.restoreScroll(restoredScroll, revision, result.url);
    else {
      this.history.replaceAddressIfNeeded(result.url);
      if (navigationScroll && !result.url.hash) {
        await this.scroll.restoreScroll(navigationScroll, revision, result.url);
      } else {
        await this.scroll.scrollToRoute(result.url, revision);
      }
    }
    if (this.mounted && revision === this.revision) {
      this.accessibility.commit(result.url, () => this.mounted && revision === this.revision);
      this.options.onLoading(false);
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
  restoreURL(url) {
    this.history.restoreAddress(url);
    this.updateURL(url);
    this.history.trackDisplayedEntry();
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
  dispose() {
    this.unmount();
  }
  discardPendingPages() {
    const cleanups = [...this.pendingPages];
    this.pendingPages.clear();
    const errors = [];
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, "Pending page cleanup failed.");
  }
  unmount() {
    this.mountEpoch++;
    this.mounted = false;
    this.revision++;
    const stopURL = this.stopURL;
    this.stopURL = undefined;
    const stopPage = this.stopPage;
    this.stopPage = undefined;
    const activeLoad = this.activeLoad;
    this.activeLoad = undefined;
    const errors = [];
    const cleanup = (fn) => {
      try {
        fn();
      } catch (error) {
        errors.push(error);
      }
    };
    cleanup(() => activeLoad?.abort());
    cleanup(() => stopURL?.());
    cleanup(() => this.view.releaseActive());
    cleanup(() => this.view.discardPending());
    cleanup(() => this.discardPendingPages());
    cleanup(() => this.navigation.stop());
    cleanup(() => {
      if (this.element?.id)
        Wizard.resetScope(this.element.id);
    });
    cleanup(() => stopPage?.());
    cleanup(() => this.accessibility.dispose());
    if (this.element?.dataset.app === this.options.id)
      delete this.element.dataset.app;
    cleanup(() => this.options.onUnmount());
    this.options.onLoading(false);
    this.currentURL = undefined;
    this.view.reset();
    this.pendingNavigation = undefined;
    this.history.reset();
    if (errors.length)
      throw new AggregateError(errors, "App disposal failed.");
  }
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

// src/yvee/rendering/request.ts
function snapshotData(value, seen = new WeakMap) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "function" || typeof value === "symbol")
      throw new TypeError("SSR data must be plain data; use dataFactory for request-owned services.");
    return value;
  }
  const previous = seen.get(value);
  if (previous)
    return previous;
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) {
    throw new TypeError("SSR data must be plain data; use dataFactory for request-owned services.");
  }
  const copy = Array.isArray(value) ? [] : Object.create(proto);
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === "length")
      continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!("value" in descriptor))
      throw new TypeError("SSR data must not contain accessors.");
    Object.defineProperty(copy, key, { value: snapshotData(descriptor.value, seen), enumerable: descriptor.enumerable ?? false, configurable: true, writable: true });
  }
  if (Array.isArray(value))
    copy.length = value.length;
  return Object.freeze(copy);
}

// src/yvee/rendering/server.tsx
function createServerRenderer(context, options = {}) {
  const id = options.id ?? context.id;
  const withStatus = async (request) => {
    const { url: input, data, error, nonce } = request;
    const url = toYveeURL(input);
    const signal = request.signal ?? new AbortController().signal;
    const cleanups = [];
    let failure;
    let failed = false;
    try {
      signal.throwIfAborted();
      const payload = options.dataFactory ? await options.dataFactory({ ...request, signal, onDispose: (cleanup) => {
        cleanups.push(cleanup);
      } }) : snapshotData(data ?? options.data ?? context.data);
      signal.throwIfAborted();
      const loaded = await resolvePage(context, url, payload, error, signal);
      if (loaded.kind === "stop") {
        throw new Error(`Yvee server rendering was stopped by a guard for ${url.path}`);
      }
      if (loaded.dispose)
        cleanups.push(loaded.dispose);
      const head = combineHead(context.defaults, loaded.head);
      const body = await renderBody(loaded.body, context.layout, options.class, id, nonce);
      const status = loaded.status;
      const html = await renderDocument(body, head, id, status, nonce, payload);
      signal.throwIfAborted();
      return { html, status };
    } catch (error) {
      failure = error;
      failed = true;
      throw error;
    } finally {
      const errors = [];
      for (const cleanup of cleanups.reverse()) {
        try {
          await cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length)
        throw new AggregateError(failed ? [failure, ...errors] : errors, "SSR request cleanup failed.");
    }
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
async function renderBody(body, layout, className, id, nonce) {
  const root = State(body);
  const content = layout ? await layout(root) : root;
  const tree = content instanceof DOM ? content : /* @__PURE__ */ dom("main", {
    class: className
  }, content);
  return (await renderDom(tree, new Idm(id, 0, nonce))).ctx;
}
async function renderDocument(body, head, id, status, nonce, data) {
  const headHTML = await renderHead(head, "root", nonce);
  return [
    "<!doctype html>",
    '<html lang="en">',
    `<head>${headHTML}${renderJSONScript(data, { id: "yvee-ssr-payload", ...nonce === undefined ? {} : { nonce } })}</head>`,
    `<body id="${escapeAttribute(id)}"${status >= 400 ? ` data-error="${Number(status)}"` : ""}>${body}</body>`,
    "</html>"
  ].join("");
}
async function renderHead(head, owner, nonce) {
  const parts = [];
  const base = head.base?.at(-1);
  if (base)
    parts.push(`<base${renderAttributes(base, owner)}>`);
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
    parts.push(`<script${renderAttributes({ ...attrs, ...nonce === undefined ? {} : { nonce } }, owner)}>${inlineContent("script", body)}</script>`);
  }
  for (const src of asArray2(head.js)) {
    parts.push(`<script${renderAttributes({ src, ...nonce === undefined ? {} : { nonce } }, owner)}></script>`);
  }
  if (head.title)
    parts.push(`<title${renderAttributes({}, owner)}>${escapeText(head.title)}</title>`);
  if (head.style) {
    parts.push(`<style${renderAttributes({ ...nonce === undefined ? {} : { nonce } }, owner)}>${inlineContent("style", head.style)}</style>`);
  }
  for (const link of head.link ?? []) {
    parts.push(`<link${renderAttributes(link, owner)}>`);
  }
  for (const href of asArray2(head.css)) {
    parts.push(`<link${renderAttributes({ rel: "stylesheet", href }, owner)}>`);
  }
  if (head.elements?.length) {
    parts.push((await renderHeadElements(head.elements, owner, `${owner}:h`, nonce)).ctx);
  }
  return parts.join("");
}
function renderAttributes(attributes, owner) {
  const marked = {
    ...attributes,
    "data-yv": owner
  };
  return Object.entries(marked).map(([name, value]) => {
    validateAttribute(name, value);
    if (value === false)
      return "";
    if (value === true)
      return ` ${name}`;
    return ` ${name}="${escapeAttribute(value)}"`;
  }).join("");
}
var escapeAttribute = escapeHTML;
var escapeText = escapeHTML;
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
  messageError(error, phase, _event) {
    console.error(`Yvee socket ${phase} failed`, error);
  }
  sendJson(value) {
    if (this.connection?.readyState === WebSocket.OPEN)
      this.connection.send(JSON.stringify(value));
  }
  onMessage(handler, options = {}) {
    const previous = this.message.bind(this);
    this.message = async (event) => {
      const report = (error, phase) => {
        if (options.onError)
          options.onError(error, phase, event);
        else
          this.messageError(error, phase, event);
      };
      try {
        await previous(event);
      } catch (error) {
        report(error, "handler");
      }
      let value;
      try {
        if (typeof event.data !== "string")
          throw new TypeError("Expected a JSON text frame.");
        value = JSON.parse(event.data);
      } catch (error) {
        report(error, "parse");
        return;
      }
      try {
        if (options.validate && !options.validate(value))
          throw new TypeError("Socket payload validation failed.");
      } catch (error) {
        report(error, "validation");
        return;
      }
      try {
        await handler(value, event);
      } catch (error) {
        report(error, "handler");
      }
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
  load(path, options = {}) {
    options.signal?.throwIfAborted();
    if (typeof WebSocket === "undefined")
      throw new Error("WebSocket is not available in this environment.");
    const base = typeof location === "undefined" ? "http://localhost" : location.href;
    const address = new URL(path, base);
    if (address.protocol === "https:")
      address.protocol = "wss:";
    else if (address.protocol === "http:")
      address.protocol = "ws:";
    else if (!["ws:", "wss:"].includes(address.protocol))
      throw new TypeError("Unsupported WebSocket protocol.");
    const match = this.app.routes.find(address.pathname, "socket");
    if (!match)
      throw new Error(`No WebSocket route matches ${path}`);
    const existing = this.connections.get(path);
    if (existing)
      return existing.controller;
    const attempts = options.retry?.attempts ?? 0;
    const delay = options.retry?.delay ?? 250;
    const maxDelay = options.retry?.maxDelay ?? 30000;
    if (!Number.isSafeInteger(attempts) || attempts < 0 || !Number.isFinite(delay) || delay < 0 || !Number.isFinite(maxDelay) || maxDelay < delay) {
      throw new RangeError("Invalid WebSocket retry policy.");
    }
    const Controller = match.entry.controller;
    const controller = new Controller;
    controller.path = path;
    controller.params = match.params;
    const scope = new DisposalScope;
    this.connections.set(path, { controller, scope });
    scope.defer(() => {
      if (this.connections.get(path)?.controller === controller)
        this.connections.delete(path);
    });
    if (options.signal)
      scope.listen(options.signal, "abort", () => this.unload(path), { once: true });
    let retries = 0;
    const report = (error) => console.error("Yvee socket callback failed", error);
    const connect = () => {
      if (scope.disposed)
        return;
      const socket = new WebSocket(address);
      controller.connection = socket;
      const connection = new DisposalScope;
      const release = scope.defer(() => connection.dispose());
      connection.defer(() => {
        if (socket.readyState < WebSocket.CLOSING)
          socket.close();
      });
      connection.listen(socket, "open", (event) => {
        try {
          Promise.resolve(controller.open(event)).catch(report);
        } catch (error) {
          report(error);
        }
      });
      connection.listen(socket, "message", (event) => {
        try {
          Promise.resolve(controller.message(event)).catch(report);
        } catch (error) {
          report(error);
        }
      });
      connection.listen(socket, "error", (event) => {
        try {
          Promise.resolve(controller.error(event)).catch(report);
        } catch (error) {
          report(error);
        }
      });
      connection.listen(socket, "close", (event) => {
        release();
        try {
          Promise.resolve(controller.close(event)).catch(report);
        } catch (error) {
          report(error);
        }
        if (scope.disposed)
          return;
        if (retries < attempts)
          scope.timeout(() => {
            try {
              connect();
            } catch (error) {
              report(error);
              scope.dispose();
            }
          }, Math.min(maxDelay, delay * 2 ** retries++));
        else
          scope.dispose();
      });
    };
    try {
      connect();
    } catch (error) {
      scope.dispose();
      throw error;
    }
    return controller;
  }
  unload(path) {
    this.connections.get(path)?.scope.dispose();
  }
  closeAll() {
    const errors = [];
    for (const { scope } of [...this.connections.values()]) {
      try {
        scope.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, "Socket cleanup failed.");
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
  resources = new DisposalScope;
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
    this.id = options.id ?? Math.random().toString(36).slice(2, 9);
    this.url = State(toURL("/"));
    this.loading = State(false);
    this.root = State([], { onError() {} });
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
      onMount: () => {
        if (this.resources.disposed)
          this.resources = new DisposalScope;
      },
      onUnmount: () => {
        const errors = [];
        try {
          this.resources.dispose();
        } catch (error) {
          errors.push(error);
        }
        try {
          this.socket.closeAll();
        } catch (error) {
          errors.push(error);
        }
        if (errors.length)
          throw new AggregateError(errors, "Owned app resources failed to close.");
      }
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
  head(value) {
    super.head(value);
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
    this.data = options.data ?? {};
    const renderer = this.server({
      ...options.id ? { id: options.id } : {},
      ...options.class ? { class: options.class } : {},
      data: this.data
    });
    const mount = typeof document === "undefined" ? Promise.resolve() : this.client.mount({
      ...options.id ? { id: options.id } : {},
      ...options.class ? { className: options.class } : {},
      ...options.hydrate === undefined ? {} : { hydrate: options.hydrate },
      ...options.nonce === undefined ? {} : { nonce: options.nonce }
    });
    const callable = Object.assign((request) => renderer(request), { withStatus: renderer.withStatus });
    return Object.assign(callable, {
      then: mount.then.bind(mount),
      catch: mount.catch.bind(mount),
      finally: mount.finally.bind(mount)
    });
  }
  dispose() {
    this.client.dispose();
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
class VersionedValue {
  store;
  base;
  schema;
  key;
  constructor(store, base, schema) {
    this.store = store;
    this.base = base;
    this.schema = schema;
    if (!Number.isSafeInteger(schema.version) || schema.version < 1)
      throw new TypeError("Storage versions must be positive integers.");
    this.key = `${base}:v${schema.version}`;
  }
  get() {
    if (this.store.has(this.key))
      return this.check(this.store.get(this.key).value);
    for (let version = this.schema.version - 1;version >= 1; version--) {
      const key = `${this.base}:v${version}`;
      if (!this.store.has(key))
        continue;
      let value = this.store.get(key).value;
      for (let next = version + 1;next <= this.schema.version; next++) {
        const migrate = this.schema.migrations?.[next];
        if (!migrate)
          throw new Error(`Missing storage migration to version ${next}.`);
        value = migrate(value);
      }
      const result = this.check(value);
      this.store.set(this.key, result);
      return result;
    }
    return this.check(this.schema.fallback());
  }
  set(value) {
    this.store.set(this.key, this.check(value));
    return this;
  }
  remove() {
    this.store.remove(this.key);
    return this;
  }
  watch(callback, options) {
    return this.store.watch(this.key, callback, options);
  }
  check(value) {
    if (!this.schema.validate(value))
      throw new TypeError(`Invalid stored value for '${this.key}'.`);
    return value;
  }
}

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
  versioned(key, schema) {
    return new VersionedValue(this, key, schema);
  }
  watch(key, callback, { signal, scope } = {}) {
    if (typeof window === "undefined" || signal?.aborted || scope?.disposed)
      return () => {};
    const target = window;
    const storage = this.storage();
    storage.getItem(key);
    const listener = (event) => {
      if (event.storageArea === storage && (event.key === key || event.key === null)) {
        callback({ key: event.key, oldValue: event.oldValue, newValue: event.newValue });
      }
    };
    const stop = () => {
      target.removeEventListener("storage", listener);
      signal?.removeEventListener("abort", stop);
    };
    target.addEventListener("storage", listener);
    signal?.addEventListener("abort", stop, { once: true });
    return scope ? scope.defer(stop) : stop;
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
// test/yvee-bun/chat/room.ts
var chatPath = "/ws/chat";
var messageLimit = 500;

// test/yvee-bun/chat/popup.tsx
var _init, _base, _dec;
let _ChatSocket;
_dec = [
  socketRoute(chatPath)
];

class ChatSocket extends (_base = SocketController) {
  static {
    _init = __decoratorStart(_base);
    _ChatSocket = __decorateElement(_init, 0, "ChatSocket", _dec, this);
  }
}
ChatSocket = _ChatSocket;
__runInitializers(_init, 1, _ChatSocket);
function chatPopup(hub) {
  const status = State("Connecting…");
  const offline = State(true);
  const transcript = State("");
  const messages = [];
  let socket;
  function connect() {
    if (socket?.connection && socket.connection.readyState < WebSocket.CLOSING)
      return;
    status.value = "Connecting…";
    const peer = hub.load(chatPath);
    socket = peer;
    peer.open = () => {
      offline.value = false;
      status.value = "Connected";
    };
    peer.onMessage(({ sender, text }) => {
      messages.push(sender + ": " + text);
      if (messages.length > 100)
        messages.shift();
      transcript.value = messages.join(`
`);
    }, { validate: (value) => typeof value === "object" && value !== null && ("sender" in value) && typeof value.sender === "string" && ("text" in value) && typeof value.text === "string" });
    peer.close = () => {
      if (peer !== socket)
        return;
      offline.value = true;
      status.value = "Disconnected. Reopen chat to reconnect.";
    };
  }
  return /* @__PURE__ */ dom("details", {
    class: "chat-popup",
    on: { toggle(event) {
      if (event.currentTarget.open)
        connect();
    } }
  }, /* @__PURE__ */ dom("summary", null, "Room chat"), /* @__PURE__ */ dom("div", {
    class: "chat-panel"
  }, /* @__PURE__ */ dom("small", {
    role: "status"
  }, status), /* @__PURE__ */ dom("pre", {
    role: "log",
    "aria-live": "polite"
  }, transcript), /* @__PURE__ */ dom("form", {
    on: { submit(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const text = String(new FormData(form).get("message") ?? "").trim();
      if (!text || socket?.connection?.readyState !== WebSocket.OPEN)
        return;
      socket.sendJson({ text });
      form.reset();
    } }
  }, /* @__PURE__ */ dom("input", {
    name: "message",
    "aria-label": "Chat message",
    placeholder: "Write a message",
    maxlength: messageLimit,
    required: true
  }), /* @__PURE__ */ dom("button", {
    type: "submit",
    disabled: offline
  }, "Send"))));
}

// test/yvee-bun/routes/not-found.tsx
var _init2, _base2, _dec2;
let _NotFoundPage;
_dec2 = [
  error(404)
];

class NotFoundPage extends (_base2 = Page) {
  static {
    _init2 = __decoratorStart(_base2);
    _NotFoundPage = __decorateElement(_init2, 0, "NotFoundPage", _dec2, this);
  }
  head() {
    return /* @__PURE__ */ dom("title", null, "Page not found · Yvee");
  }
  body() {
    return /* @__PURE__ */ dom("section", {
      class: "route-card home-card"
    }, /* @__PURE__ */ dom("p", {
      class: "eyebrow"
    }, "Error ", this.status), /* @__PURE__ */ dom("h1", null, "Page not found"), /* @__PURE__ */ dom("p", null, "We couldn’t find a page at ", /* @__PURE__ */ dom("code", null, this.path), "."), /* @__PURE__ */ dom("a", {
      href: "/"
    }, "Return home"));
  }
}
NotFoundPage = _NotFoundPage;
__runInitializers(_init2, 1, _NotFoundPage);

// test/yvee-bun/routes/features.tsx
class FeaturesRoute extends Page {
  title = State("Features · Yvee Bun example");
  description = State("A second route with reactive browser head state.");
  ctr = State(0);
  head() {
    return /* @__PURE__ */ dom(frag, null, /* @__PURE__ */ dom("meta", {
      name: "generator",
      content: "Yvee Bun example"
    }));
  }
  body() {
    return __preload("yc7ye83t"), import("./features-yc7ye83t.js");
  }
}
route("/features")(FeaturesRoute);

// test/yvee-bun/routes/home.tsx
class HomeRoute extends Page {
  head() {
    return /* @__PURE__ */ dom(frag, null, /* @__PURE__ */ dom("title", null, "Home · Yvee Bun example"), /* @__PURE__ */ dom("meta", {
      name: "description",
      content: "Yvee server rendering and client navigation with Bun."
    }), /* @__PURE__ */ dom("link", {
      rel: "stylesheet",
      href: "/styles/home.css"
    }));
  }
  body() {
    return __preload("48y5r3bw"), import("./home-48y5r3bw.js");
  }
}
route("/")(HomeRoute);

// test/yvee-bun/routes/metadata.tsx
class MetadataRoute extends Page {
  head() {
    return /* @__PURE__ */ dom(frag, null, /* @__PURE__ */ dom("title", null, "SSR Data & Metadata · Yvee Bun example"), /* @__PURE__ */ dom("meta", {
      name: "description",
      content: "Inspect rich route metadata, server-rendered request data, and a browser POST refresh."
    }), /* @__PURE__ */ dom("meta", {
      name: "author",
      content: "Yvee Bun example"
    }), /* @__PURE__ */ dom("meta", {
      name: "keywords",
      content: "Yvee, Bun, SSR, SPA, route data, metadata"
    }), /* @__PURE__ */ dom("meta", {
      name: "robots",
      content: "index,follow"
    }), /* @__PURE__ */ dom("meta", {
      name: "theme-color",
      content: "#183e3a"
    }), /* @__PURE__ */ dom("meta", {
      name: "color-scheme",
      content: "light"
    }), /* @__PURE__ */ dom("meta", {
      name: "application-name",
      content: "Yvee Field Notes"
    }), /* @__PURE__ */ dom("meta", {
      property: "og:type",
      content: "website"
    }), /* @__PURE__ */ dom("meta", {
      property: "og:site_name",
      content: "Yvee Field Notes"
    }), /* @__PURE__ */ dom("meta", {
      property: "og:title",
      content: "SSR Data & Metadata"
    }), /* @__PURE__ */ dom("meta", {
      property: "og:description",
      content: "A server-rendered payload followed by a browser POST request."
    }), /* @__PURE__ */ dom("meta", {
      property: "og:url",
      content: "/metadata"
    }), /* @__PURE__ */ dom("meta", {
      property: "og:image",
      content: "/assets/greenhouse-hero.png"
    }), /* @__PURE__ */ dom("meta", {
      property: "og:image:alt",
      content: "The Yvee Field Studio greenhouse"
    }), /* @__PURE__ */ dom("meta", {
      name: "twitter:card",
      content: "summary_large_image"
    }), /* @__PURE__ */ dom("meta", {
      name: "twitter:title",
      content: "SSR Data & Metadata"
    }), /* @__PURE__ */ dom("meta", {
      name: "twitter:description",
      content: "See what arrived through SSR and what the browser posts back."
    }), /* @__PURE__ */ dom("meta", {
      name: "twitter:image",
      content: "/assets/greenhouse-hero.png"
    }), /* @__PURE__ */ dom("link", {
      rel: "canonical",
      href: "/metadata"
    }), /* @__PURE__ */ dom("link", {
      rel: "preload",
      as: "image",
      href: "/assets/greenhouse-hero.png"
    }), /* @__PURE__ */ dom("link", {
      rel: "stylesheet",
      href: "/styles/metadata.css"
    }));
  }
  async fetch(context) {
    if (typeof window === "undefined")
      return {};
    const response = await fetch("/api/ssr-payload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requestId: context.data.ssr?.requestId,
        visitor: context.data.ssr?.visitor,
        path: context.url.path
      }),
      signal: context.signal
    });
    if (!response.ok)
      throw new Error(`POST /api/ssr-payload failed (${response.status})`);
    const clientPost = await response.json();
    return { clientPost };
  }
  body() {
    return __preload("gf1r0wxd"), import("./metadata-gf1r0wxd.js");
  }
}
route("/metadata")(MetadataRoute);

// test/yvee-bun/routes/studio.tsx
var _init3, _base3, _dec3;
let _StudioRoute;
_dec3 = [
  route("/studio")
];

class StudioRoute extends (_base3 = Page) {
  static {
    _init3 = __decoratorStart(_base3);
    _StudioRoute = __decorateElement(_init3, 0, "StudioRoute", _dec3, this);
  }
  head() {
    return /* @__PURE__ */ dom(frag, null, /* @__PURE__ */ dom("title", null, "Field Studio · Yvee Bun example"), /* @__PURE__ */ dom("meta", {
      name: "description",
      content: "A visual route with a generated greenhouse hero and layered sections."
    }), /* @__PURE__ */ dom("link", {
      rel: "stylesheet",
      href: "/styles/studio.css"
    }), /* @__PURE__ */ dom("link", {
      rel: "preload",
      as: "image",
      href: "/assets/greenhouse-hero.png"
    }));
  }
  body() {
    return __preload("swdfv3wg"), import("./studio-swdfv3wg.js");
  }
}
StudioRoute = _StudioRoute;
__runInitializers(_init3, 1, _StudioRoute);

// test/yvee-bun/create-app.tsx
function createDemoApp() {
  const app = new Yvee({ history: true, id: "root" });
  app.head({
    css: "/styles/shared.css",
    script: [{ type: "module", src: "/client.js" }]
  });
  app.register(HomeRoute, FeaturesRoute, StudioRoute, MetadataRoute, NotFoundPage, ChatSocket);
  app.Main((content) => /* @__PURE__ */ dom("main", {
    class: "app-shell"
  }, /* @__PURE__ */ dom("nav", {
    class: "site-nav",
    "aria-label": "Main navigation"
  }, /* @__PURE__ */ dom("a", {
    class: "site-brand",
    href: "/"
  }, "Yvee / Bun"), /* @__PURE__ */ dom("div", {
    class: "site-nav__links"
  }, /* @__PURE__ */ dom("a", {
    href: "/"
  }, "Home"), /* @__PURE__ */ dom("a", {
    href: "/features"
  }, "Features"), /* @__PURE__ */ dom("a", {
    href: "/studio"
  }, "Studio"), /* @__PURE__ */ dom("a", {
    href: "/metadata"
  }, "SSR data"), /* @__PURE__ */ dom("a", {
    href: "/missing-page"
  }, "404 demo"))), chatPopup(app.socket), content));
  return app;
}

// test/yvee-bun/client.tsx
var app = createDemoApp();
var bootstrap = document.getElementById("yvee-ssr-payload");
var data = {};
if (bootstrap?.textContent) {
  try {
    const parsed = JSON.parse(bootstrap.textContent);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      data = parsed;
    }
  } catch (error) {
    console.error("Could not read Yvee SSR payload", error);
  }
}
app.render({ data }).then(() => {
  document.body.dataset.ready = "true";
}).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const notice = document.createElement("pre");
  notice.className = "demo-error";
  notice.textContent = `Yvee client failed to start: ${message}`;
  document.body.replaceChildren(notice);
  console.error(error);
});

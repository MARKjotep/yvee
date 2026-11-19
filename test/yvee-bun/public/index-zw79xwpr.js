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

export { isBoolean, isArray, isFunction, isObject, isPlainObject, Mapper, keyInMap, keyInMapArray, oItems, ngify, reCamel, makeID, DOM, dom, frag };

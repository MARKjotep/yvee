import { Elements, Ref } from "../$";
import {
  isArr,
  isBool,
  isFN,
  isObj,
  isPlainObject,
  log,
  ngify,
  oItems,
  V,
} from "../../@";
import { Stateful } from "../../stateful";
import { CATT } from "../cat";
import { CSSStyle } from "./style";

export * from "./events";
export * from "./style";

export const attr_value = (v: any): string => {
  if (isArr(v)) {
    return v.filter((f) => f !== undefined).join(" ");
  } else if (isObj(v)) {
    if (isPlainObject(v)) {
      return ngify(v);
    }
  } else if (isFN(v)) {
    return attr_value((v as any)());
  } else if (v !== undefined && v !== null) {
    return isBool(v) ? (v ? "" : "false") : String(v);
  }
  return "";
};

function Callback(attr: string, pre?: string) {
  switch (pre ?? attr) {
    case "style":
      return function (this: Elements, e: string) {
        this.style.setProperty(attr, e);
      };
    default:
      return function (this: HTMLElement, e: any) {
        this.setAttribute(attr, e);
      };
  }
}

export class ATTR {
  constructor(public attr: EAttr = {}) {}
  get(catt: CATT, attr: EAttr = this.attr, pre?: string) {
    //
    const processValue = (k: string, v: any) => {
      //
      if (isArr(v)) {
        catt.attr_push(k, attr_value(v), pre);
      } else if (v instanceof Stateful) {
        const entry = pre ? `${pre}_${k}` : k;
        //
        catt.states.push(
          v.call(Callback(k, pre) as (this: Elements, arg: any) => void, entry),
        );

        processValue(k, v.value);
        //
      } else if (isObj(v)) {
        if (isPlainObject(v) && !pre) {
          this.get(catt, v as any, k);
        }
      } else {
        catt.attr_push(k, attr_value(v), pre);
      }
    };

    oItems(attr).forEach(([k, v]) => {
      if (k === "ref") {
        if (v instanceof Ref) {
          catt.events.obj({
            element() {
              v.element = this;
            },
          });
        }
      } else if (["on"].includes(k)) {
        isObj(attr.on) && catt.events.obj(attr.on);
      } else {
        if (v === undefined) return;
        processValue(k, v);
      }
    });
  }
  unload<T>(x: string): T | undefined {
    let ATX = undefined;
    if (x in this.attr) {
      ATX = this.attr[x as keyof EAttr];
      delete this.attr[x as keyof EAttr];
    }
    return ATX as T;
  }
}

/*
-------------------------

-------------------------
*/

export interface EAttr<T = DVal> {
  [key: string]: any;
  [key: `data-${string}`]: T | any;
  accesskey?: T;
  autocapitalize?: T;
  class?: T;
  on?: events<any>;
  ref?: Ref<any>;
  contenteditable?: T;
  dir?: T;
  draggable?: T;
  hidden?: T;
  id?: T;
  itemprop?: T;
  lang?: T;
  role?: T;
  slot?: T;
  spellcheck?: T;
  style?: CSSStyle | string;
  tabindex?: T;
  title?: T;
  translate?: T;
}

export interface ElementAttributes {
  link: linkAttr;
  base: baseAttr;
  meta: metaAttr;

  // Basic ----------------------------------
  p: EAttr;
  br: EAttr;
  hr: EAttr;
  h: EAttr;
  cmnt: EAttr;
  root: EAttr;

  // Styles and Semantics ----------------------------------
  div: EAttr;
  span: EAttr;
  header: EAttr;
  hgroup: EAttr;
  footer: EAttr;
  main: EAttr;
  section: EAttr;
  search: EAttr;
  article: EAttr;
  aside: EAttr;
  details: detailsAttr;
  dialog: dialogAttr;
  summary: EAttr;
  data: dataAttr;
  // Programming ----------------------------------
  noscript: EAttr;
  object: objectAttr;
  param: paramAttr;
  script: scriptAttr;
  // Links ----------------------------------
  a: aAttr;
  nav: EAttr;
  style: styleAttr;
  // Audio / Video ----------------------------------
  audio: audioAttr;
  video: videoAttr;
  source: sourceAttr;
  track: trackAttr;
  // Images ----------------------------------
  img: imgAttr;
  map: mapAttr;
  area: areaAttr;
  canvas: canvasAttr;
  figcaption: EAttr;
  figure: EAttr;
  picture: EAttr;
  // IFrame ----------------------------------
  iframe: iframeAttr;
  // Forms and Input ----------------------------------
  form: formAttr;
  input: inputAttr;
  textarea: textareaAttr;
  button: buttonAttr;
  select: selectAttr;
  optgroup: optgroupAttr;
  option: optionAttr;
  label: labelAttr;
  fieldset: fieldsetAttr;
  legend: EAttr;
  datalist: EAttr;
  // Tables ----------------------------------
  table: EAttr;
  caption: EAttr;
  th: thAttr;
  tr: EAttr;
  td: tdAttr;
  thead: EAttr;
  tbody: EAttr;
  tfoot: EAttr;
  col: colAttr;
  colgroup: colgroupAttr;
  // Formatting ----------------------------------

  b: EAttr;
  i: EAttr;
  q: qAttr;
  s: EAttr;
  u: EAttr;
  em: EAttr;
  rp: EAttr;
  del: delAttr;
  dfn: EAttr;
  ins: insAttr;
  kbd: EAttr;
  pre: EAttr;
  sub: EAttr;
  sup: EAttr;
  var: EAttr;
  wbr: EAttr;
  cite: EAttr;
  time: timeAttr;
  abbr: EAttr;
  code: EAttr;
  mark: EAttr;
  samp: EAttr;
  meter: meterAttr;
  small: EAttr;
  strong: EAttr;
  address: EAttr;
  progress: progressAttr;
  template: EAttr;
  blockquote: blockquoteAttr;
  // List ----------------------------------
  menu: menuAttr;
  ul: EAttr;
  ol: olAttr;
  li: liAttr;
  dl: EAttr;
  dt: EAttr;
  dd: EAttr;

  h1: EAttr;
  h2: EAttr;
  h3: EAttr;
  h4: EAttr;
  h5: EAttr;
  h6: EAttr;
}

export interface SVGAttributes {
  // SVG Elements  ----------------------------------
  svg: EAttr;
  path: EAttr;
  circle: EAttr;
  animate: EAttr;
  animateMotion: EAttr;
  animateTransform: EAttr;
  clipPath: EAttr;
  defs: EAttr;
  desc: EAttr;
  ellipse: EAttr;
  feBlend: EAttr;
  feColorMatrix: EAttr;
  feComponentTransfer: EAttr;
  feComposite: EAttr;
  feConvolveMatrix: EAttr;
  feDiffuseLighting: EAttr;
  feDisplacementMap: EAttr;
  feDistantLight: EAttr;
  feDropShadow: EAttr;
  feFlood: EAttr;
  feFuncA: EAttr;
  feFuncB: EAttr;
  feFuncG: EAttr;
  feFuncR: EAttr;
  feGaussianBlur: EAttr;
  feImage: EAttr;
  feMerge: EAttr;
  feMergeNode: EAttr;
  feMorphology: EAttr;
  feOffset: EAttr;
  fePointLight: EAttr;
  feSpecularLighting: EAttr;
  feSpotLight: EAttr;
  feTile: EAttr;
  feTurbulence: EAttr;
  filter: EAttr;
  foreignObject: EAttr;
  g: EAttr;
  image: EAttr;
  line: EAttr;
  linearGradient: EAttr;
  marker: EAttr;
  mask: EAttr;
  metadata: EAttr;
  mpath: EAttr;
  pattern: EAttr;
  polygon: EAttr;
  polyline: EAttr;
  radialGradient: EAttr;
  rect: EAttr;
  set: EAttr;
  stop: EAttr;
  symbol: EAttr;
  text: EAttr;
  textPath: EAttr;
  title: EAttr;
  tspan: EAttr;
  use: EAttr;
  view: EAttr;
}

// ---------------------
export interface aAttr<T = DVal> extends EAttr {
  download?: T;
  href?: T;
  hreflang?: T;
  media?: T;
  ping?: T;
  referrerpolicy?: T;
  rel?: T;
  shape?: T;
  target?: T;
}
interface areaAttr<T = DVal> extends EAttr {
  alt?: T;
  coords?: T;
  download?: T;
  href?: T;
  media?: T;
  ping?: T;
  referrerpolicy?: T;
  rel?: T;
  shape?: T;
  target?: T;
}
interface audioAttr<T = DVal> extends EAttr {
  autoplay?: T;
  controls?: T;
  crossorigin?: T;
  loop?: T;
  muted?: T;
  preload?: T;
  src?: T;
}
interface baseAttr<T = DVal> extends EAttr {
  href?: T;
  target?: T;
}
interface blockquoteAttr<T = DVal> extends EAttr {
  cite?: T;
}
export interface buttonAttr<T = DVal> extends EAttr {
  disabled?: T;
  form?: T;
  formaction?: T;
  formenctype?: T;
  formmethod?: T;
  formnovalidate?: T;
  formtarget?: T;
  name?: T;
  type?: T;
  value?: T;
}
interface canvasAttr<T = DVal> extends EAttr {
  height?: T;
  width?: T;
}
interface colAttr<T = DVal> extends EAttr {
  span?: T;
}
interface colgroupAttr<T = DVal> extends EAttr {
  span?: T;
}
interface dataAttr<T = DVal> extends EAttr {
  value?: T;
}
interface delAttr<T = DVal> extends EAttr {
  cite?: T;
  datetime?: T;
}
interface detailsAttr<T = DVal> extends EAttr {
  open?: T;
}
interface dialogAttr<T = DVal> extends EAttr {
  open?: T;
}
interface embedAttr<T = DVal> extends EAttr {
  height?: T;
  src?: T;
  type?: T;
  width?: T;
}
interface fieldsetAttr<T = DVal> extends EAttr {
  disabled?: T;
  form?: T;
  name?: T;
}
interface formAttr<T = DVal> extends EAttr {
  accept?: T;
  "accept-charset"?: T;
  action?: T;
  autocomplete?: T;
  enctype?: T;
  method?: T;
  name?: T;
  novalidate?: T;
  target?: T;
}
interface iframeAttr<T = DVal> extends EAttr {
  allow?: T;
  csp?: T;
  loading?: T;
  name?: T;
  height?: T;
  referrerpolicy?: T;
  sandbox?: T;
  src?: T;
  srcdoc?: T;
  width?: T;
}
interface imgAttr<T = DVal> extends EAttr {
  alt?: T;
  crossorigin?: T;
  decoding?: T;
  ismap?: T;
  loading?: T;
  height?: T;
  referrerpolicy?: T;
  sizes?: T;
  src?: T;
  srcset?: T;
  usemap?: T;
  width?: T;
}
interface inputAttr<T = DVal> extends EAttr {
  accept?: T;
  alt?: T;
  autocomplete?: T;
  capture?: T;
  checked?: T;
  dirname?: T;
  disabled?: T;
  form?: T;
  formaction?: T;
  formenctype?: T;
  formmethod?: T;
  formnovalidate?: T;
  formtarget?: T;
  list?: T;
  max?: T;
  maxlength?: T;
  minlength?: T;
  min?: T;
  multiple?: T;
  name?: T;
  pattern?: T;
  placeholder?: T;
  height?: T;
  readonly?: T;
  required?: T;
  size?: T;
  src?: T;
  step?: T;
  type?: T;
  usemap?: T;
  value?: T;
  width?: T;
}
interface insAttr<T = DVal> extends EAttr {
  cite?: T;
  datetime?: T;
}
interface labelAttr<T = DVal> extends EAttr {
  for?: T;
  form?: T;
}
interface liAttr<T = DVal> extends EAttr {
  value?: T;
}
interface linkAttr<T = DVal> extends EAttr {
  as?: T;
  crossorigin?: T;
  href?: T;
  hreflang?: T;
  integrity?: T;
  media?: T;
  referrerpolicy?: T;
  rel?: T;
  sizes?: T;
  type?: T;
}
interface mapAttr<T = DVal> extends EAttr {
  name?: T;
}
interface menuAttr<T = DVal> extends EAttr {
  type?: T;
}
interface metaAttr<T = DVal> extends EAttr {
  charset?: T;
  content?: T;
  "http-equiv"?: T;
  name?: T;
}
interface meterAttr<T = DVal> extends EAttr {
  form?: T;
  high?: T;
  low?: T;
  max?: T;
  min?: T;
  optimum?: T;
  value?: T;
}
interface objectAttr<T = DVal> extends EAttr {
  data?: T;
  form?: T;
  name?: T;
  height?: T;
  type?: T;
  usemap?: T;
  width?: T;
}
interface olAttr<T = DVal> extends EAttr {
  reversed?: T;
  start?: T;
  type?: T;
}
interface optgroupAttr<T = DVal> extends EAttr {
  disabled?: T;
  label?: T;
}
interface optionAttr<T = DVal> extends EAttr {
  disabled?: T;
  label?: T;
  selected?: T;
  value?: T;
}
interface outputAttr<T = DVal> extends EAttr {
  for?: T;
  form?: T;
  name?: T;
}
interface paramAttr<T = DVal> extends EAttr {
  name?: T;
  value?: T;
}
interface progressAttr<T = DVal> extends EAttr {
  form?: T;
  max?: T;
  value?: T;
}
interface qAttr<T = DVal> extends EAttr {
  cite?: T;
}
interface scriptAttr<T = DVal> extends EAttr {
  async?: T;
  crossorigin?: T;
  defer?: T;
  integrity?: T;
  referrerpolicy?: T;
  src?: T;
  type?: T;
}
interface selectAttr<T = DVal> extends EAttr {
  autocomplete?: T;
  disabled?: T;
  form?: T;
  multiple?: T;
  name?: T;
  required?: T;
  size?: T;
}
interface sourceAttr<T = DVal> extends EAttr {
  media?: T;
  sizes?: T;
  src?: T;
  srcset?: T;
  type?: T;
}
interface styleAttr<T = DVal> extends EAttr {
  media?: T;
  type?: T;
}
interface tdAttr<T = DVal> extends EAttr {
  colspan?: T;
  headers?: T;
  rowspan?: T;
}
interface textareaAttr<T = DVal> extends EAttr {
  autocomplete?: T;
  cols?: T;
  dirname?: T;
  disabled?: T;
  enterkeyhint?: T;
  form?: T;
  inputmode?: T;
  maxlength?: T;
  minlength?: T;
  name?: T;
  placeholder?: T;
  readonly?: T;
  required?: T;
  rows?: T;
  wrap?: T;
}
interface thAttr<T = DVal> extends EAttr {
  colspan?: T;
  headers?: T;
  rowspan?: T;
  scope?: T;
}
interface timeAttr<T = DVal> extends EAttr {
  datetime?: T;
}
interface trackAttr<T = DVal> extends EAttr {
  default?: T;
  kind?: T;
  label?: T;
  src?: T;
  srclang?: T;
}
interface videoAttr<T = DVal> extends EAttr {
  autoplay?: T;
  controls?: T;
  crossorigin?: T;
  loop?: T;
  muted?: T;
  playsinline?: T;
  height?: T;
  poster?: T;
  preload?: T;
  src?: T;
  width?: T;
}
interface contenteditableAttr<T = DVal> extends EAttr {
  enterkeyhint?: T;
  inputmode?: T;
}

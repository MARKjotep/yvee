import type { EAttr } from "./base.attr.dom";
import type { DVal } from "./value-types.attr.dom";

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

export interface areaAttr<T = DVal> extends EAttr {
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

export interface audioAttr<T = DVal> extends EAttr {
  autoplay?: T;
  controls?: T;
  crossorigin?: T;
  loop?: T;
  muted?: T;
  preload?: T;
  src?: T;
}

export interface baseAttr<T = DVal> extends EAttr {
  href?: T;
  target?: T;
}

export interface blockquoteAttr<T = DVal> extends EAttr {
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

export interface canvasAttr<T = DVal> extends EAttr {
  height?: T;
  width?: T;
}

export interface colAttr<T = DVal> extends EAttr {
  span?: T;
}

export interface colgroupAttr<T = DVal> extends EAttr {
  span?: T;
}

export interface dataAttr<T = DVal> extends EAttr {
  value?: T;
}

export interface delAttr<T = DVal> extends EAttr {
  cite?: T;
  datetime?: T;
}

export interface detailsAttr<T = DVal> extends EAttr {
  open?: T;
}

export interface dialogAttr<T = DVal> extends EAttr {
  open?: T;
}

export interface embedAttr<T = DVal> extends EAttr {
  height?: T;
  src?: T;
  type?: T;
  width?: T;
}

export interface fieldsetAttr<T = DVal> extends EAttr {
  disabled?: T;
  form?: T;
  name?: T;
}

export interface formAttr<T = DVal> extends EAttr {
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

export interface iframeAttr<T = DVal> extends EAttr {
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

export interface imgAttr<T = DVal> extends EAttr {
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

export interface inputAttr<T = DVal> extends EAttr {
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

export interface insAttr<T = DVal> extends EAttr {
  cite?: T;
  datetime?: T;
}

export interface labelAttr<T = DVal> extends EAttr {
  for?: T;
  form?: T;
}

export interface liAttr<T = DVal> extends EAttr {
  value?: T;
}

export interface linkAttr<T = DVal> extends EAttr {
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

export interface mapAttr<T = DVal> extends EAttr {
  name?: T;
}

export interface menuAttr<T = DVal> extends EAttr {
  type?: T;
}

export interface metaAttr<T = DVal> extends EAttr {
  charset?: T;
  content?: T;
  "http-equiv"?: T;
  name?: T;
}

export interface meterAttr<T = DVal> extends EAttr {
  form?: T;
  high?: T;
  low?: T;
  max?: T;
  min?: T;
  optimum?: T;
  value?: T;
}

export interface objectAttr<T = DVal> extends EAttr {
  data?: T;
  form?: T;
  name?: T;
  height?: T;
  type?: T;
  usemap?: T;
  width?: T;
}

export interface olAttr<T = DVal> extends EAttr {
  reversed?: T;
  start?: T;
  type?: T;
}

export interface optgroupAttr<T = DVal> extends EAttr {
  disabled?: T;
  label?: T;
}

export interface optionAttr<T = DVal> extends EAttr {
  disabled?: T;
  label?: T;
  selected?: T;
  value?: T;
}

export interface outputAttr<T = DVal> extends EAttr {
  for?: T;
  form?: T;
  name?: T;
}

export interface paramAttr<T = DVal> extends EAttr {
  name?: T;
  value?: T;
}

export interface progressAttr<T = DVal> extends EAttr {
  form?: T;
  max?: T;
  value?: T;
}

export interface qAttr<T = DVal> extends EAttr {
  cite?: T;
}

export interface scriptAttr<T = DVal> extends EAttr {
  async?: T;
  crossorigin?: T;
  defer?: T;
  integrity?: T;
  referrerpolicy?: T;
  src?: T;
  type?: T;
}

export interface selectAttr<T = DVal> extends EAttr {
  autocomplete?: T;
  disabled?: T;
  form?: T;
  multiple?: T;
  name?: T;
  required?: T;
  size?: T;
}

export interface sourceAttr<T = DVal> extends EAttr {
  media?: T;
  sizes?: T;
  src?: T;
  srcset?: T;
  type?: T;
}

export interface styleAttr<T = DVal> extends EAttr {
  media?: T;
  type?: T;
}

export interface tdAttr<T = DVal> extends EAttr {
  colspan?: T;
  headers?: T;
  rowspan?: T;
}

export interface textareaAttr<T = DVal> extends EAttr {
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

export interface thAttr<T = DVal> extends EAttr<T> {
  colspan?: T;
  headers?: T;
  rowspan?: T;
  scope?: T;
}

export interface timeAttr<T = DVal> extends EAttr {
  datetime?: T;
}

export interface trackAttr<T = DVal> extends EAttr {
  default?: T;
  kind?: T;
  label?: T;
  src?: T;
  srclang?: T;
}

export interface videoAttr<T = DVal> extends EAttr {
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

export interface contenteditableAttr<T = DVal> extends EAttr {
  enterkeyhint?: T;
  inputmode?: T;
}


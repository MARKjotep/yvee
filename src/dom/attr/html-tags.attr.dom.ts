import type { EAttr } from "./base.attr.dom";
import type { DVal } from "./value-types.attr.dom";

export interface aAttr<T = DVal> extends EAttr {
  download?: T | undefined;
  href?: T | undefined;
  hreflang?: T | undefined;
  media?: T | undefined;
  ping?: T | undefined;
  referrerpolicy?: T | undefined;
  rel?: T | undefined;
  shape?: T | undefined;
  target?: T | undefined;
}

export interface areaAttr<T = DVal> extends EAttr {
  alt?: T | undefined;
  coords?: T | undefined;
  download?: T | undefined;
  href?: T | undefined;
  media?: T | undefined;
  ping?: T | undefined;
  referrerpolicy?: T | undefined;
  rel?: T | undefined;
  shape?: T | undefined;
  target?: T | undefined;
}

export interface audioAttr<T = DVal> extends EAttr {
  autoplay?: T | undefined;
  controls?: T | undefined;
  crossorigin?: T | undefined;
  loop?: T | undefined;
  muted?: T | undefined;
  preload?: T | undefined;
  src?: T | undefined;
}

export interface baseAttr<T = DVal> extends EAttr {
  href?: T | undefined;
  target?: T | undefined;
}

export interface blockquoteAttr<T = DVal> extends EAttr {
  cite?: T | undefined;
}

export interface buttonAttr<T = DVal> extends EAttr {
  disabled?: T | undefined;
  form?: T | undefined;
  formaction?: T | undefined;
  formenctype?: T | undefined;
  formmethod?: T | undefined;
  formnovalidate?: T | undefined;
  formtarget?: T | undefined;
  name?: T | undefined;
  type?: T | undefined;
  value?: T | undefined;
}

export interface canvasAttr<T = DVal> extends EAttr {
  height?: T | undefined;
  width?: T | undefined;
}

export interface colAttr<T = DVal> extends EAttr {
  span?: T | undefined;
}

export interface colgroupAttr<T = DVal> extends EAttr {
  span?: T | undefined;
}

export interface dataAttr<T = DVal> extends EAttr {
  value?: T | undefined;
}

export interface delAttr<T = DVal> extends EAttr {
  cite?: T | undefined;
  datetime?: T | undefined;
}

export interface detailsAttr<T = DVal> extends EAttr {
  open?: T | undefined;
}

export interface dialogAttr<T = DVal> extends EAttr {
  open?: T | undefined;
}

export interface embedAttr<T = DVal> extends EAttr {
  height?: T | undefined;
  src?: T | undefined;
  type?: T | undefined;
  width?: T | undefined;
}

export interface fieldsetAttr<T = DVal> extends EAttr {
  disabled?: T | undefined;
  form?: T | undefined;
  name?: T | undefined;
}

export interface formAttr<T = DVal> extends EAttr {
  accept?: T | undefined;
  "accept-charset"?: T | undefined;
  action?: T | undefined;
  autocomplete?: T | undefined;
  enctype?: T | undefined;
  method?: T | undefined;
  name?: T | undefined;
  novalidate?: T | undefined;
  target?: T | undefined;
}

export interface iframeAttr<T = DVal> extends EAttr {
  allow?: T | undefined;
  csp?: T | undefined;
  loading?: T | undefined;
  name?: T | undefined;
  height?: T | undefined;
  referrerpolicy?: T | undefined;
  sandbox?: T | undefined;
  src?: T | undefined;
  srcdoc?: T | undefined;
  width?: T | undefined;
}

export interface imgAttr<T = DVal> extends EAttr {
  alt?: T | undefined;
  crossorigin?: T | undefined;
  decoding?: T | undefined;
  ismap?: T | undefined;
  loading?: T | undefined;
  height?: T | undefined;
  referrerpolicy?: T | undefined;
  sizes?: T | undefined;
  src?: T | undefined;
  srcset?: T | undefined;
  usemap?: T | undefined;
  width?: T | undefined;
}

export interface inputAttr<T = DVal> extends EAttr {
  accept?: T | undefined;
  alt?: T | undefined;
  autocomplete?: T | undefined;
  capture?: T | undefined;
  checked?: T | undefined;
  dirname?: T | undefined;
  disabled?: T | undefined;
  form?: T | undefined;
  formaction?: T | undefined;
  formenctype?: T | undefined;
  formmethod?: T | undefined;
  formnovalidate?: T | undefined;
  formtarget?: T | undefined;
  list?: T | undefined;
  max?: T | undefined;
  maxlength?: T | undefined;
  minlength?: T | undefined;
  min?: T | undefined;
  multiple?: T | undefined;
  name?: T | undefined;
  pattern?: T | undefined;
  placeholder?: T | undefined;
  height?: T | undefined;
  readonly?: T | undefined;
  required?: T | undefined;
  size?: T | undefined;
  src?: T | undefined;
  step?: T | undefined;
  type?: T | undefined;
  usemap?: T | undefined;
  value?: T | undefined;
  width?: T | undefined;
}

export interface insAttr<T = DVal> extends EAttr {
  cite?: T | undefined;
  datetime?: T | undefined;
}

export interface labelAttr<T = DVal> extends EAttr {
  for?: T | undefined;
  form?: T | undefined;
}

export interface liAttr<T = DVal> extends EAttr {
  value?: T | undefined;
}

export interface linkAttr<T = DVal> extends EAttr {
  as?: T | undefined;
  crossorigin?: T | undefined;
  href?: T | undefined;
  hreflang?: T | undefined;
  integrity?: T | undefined;
  media?: T | undefined;
  referrerpolicy?: T | undefined;
  rel?: T | undefined;
  sizes?: T | undefined;
  type?: T | undefined;
}

export interface mapAttr<T = DVal> extends EAttr {
  name?: T | undefined;
}

export interface menuAttr<T = DVal> extends EAttr {
  type?: T | undefined;
}

export interface metaAttr<T = DVal> extends EAttr {
  charset?: T | undefined;
  content?: T | undefined;
  "http-equiv"?: T | undefined;
  name?: T | undefined;
}

export interface meterAttr<T = DVal> extends EAttr {
  form?: T | undefined;
  high?: T | undefined;
  low?: T | undefined;
  max?: T | undefined;
  min?: T | undefined;
  optimum?: T | undefined;
  value?: T | undefined;
}

export interface objectAttr<T = DVal> extends EAttr {
  data?: T | undefined;
  form?: T | undefined;
  name?: T | undefined;
  height?: T | undefined;
  type?: T | undefined;
  usemap?: T | undefined;
  width?: T | undefined;
}

export interface olAttr<T = DVal> extends EAttr {
  reversed?: T | undefined;
  start?: T | undefined;
  type?: T | undefined;
}

export interface optgroupAttr<T = DVal> extends EAttr {
  disabled?: T | undefined;
  label?: T | undefined;
}

export interface optionAttr<T = DVal> extends EAttr {
  disabled?: T | undefined;
  label?: T | undefined;
  selected?: T | undefined;
  value?: T | undefined;
}

export interface outputAttr<T = DVal> extends EAttr {
  for?: T | undefined;
  form?: T | undefined;
  name?: T | undefined;
}

export interface paramAttr<T = DVal> extends EAttr {
  name?: T | undefined;
  value?: T | undefined;
}

export interface progressAttr<T = DVal> extends EAttr {
  form?: T | undefined;
  max?: T | undefined;
  value?: T | undefined;
}

export interface qAttr<T = DVal> extends EAttr {
  cite?: T | undefined;
}

export interface scriptAttr<T = DVal> extends EAttr {
  async?: T | undefined;
  crossorigin?: T | undefined;
  defer?: T | undefined;
  integrity?: T | undefined;
  referrerpolicy?: T | undefined;
  src?: T | undefined;
  type?: T | undefined;
}

export interface selectAttr<T = DVal> extends EAttr {
  autocomplete?: T | undefined;
  disabled?: T | undefined;
  form?: T | undefined;
  multiple?: T | undefined;
  name?: T | undefined;
  required?: T | undefined;
  size?: T | undefined;
}

export interface sourceAttr<T = DVal> extends EAttr {
  media?: T | undefined;
  sizes?: T | undefined;
  src?: T | undefined;
  srcset?: T | undefined;
  type?: T | undefined;
}

export interface styleAttr<T = DVal> extends EAttr {
  media?: T | undefined;
  type?: T | undefined;
}

export interface tdAttr<T = DVal> extends EAttr {
  colspan?: T | undefined;
  headers?: T | undefined;
  rowspan?: T | undefined;
}

export interface textareaAttr<T = DVal> extends EAttr {
  autocomplete?: T | undefined;
  cols?: T | undefined;
  dirname?: T | undefined;
  disabled?: T | undefined;
  enterkeyhint?: T | undefined;
  form?: T | undefined;
  inputmode?: T | undefined;
  maxlength?: T | undefined;
  minlength?: T | undefined;
  name?: T | undefined;
  placeholder?: T | undefined;
  readonly?: T | undefined;
  required?: T | undefined;
  rows?: T | undefined;
  wrap?: T | undefined;
}

export interface thAttr<T = DVal> extends EAttr<T> {
  colspan?: T | undefined;
  headers?: T | undefined;
  rowspan?: T | undefined;
  scope?: T | undefined;
}

export interface timeAttr<T = DVal> extends EAttr {
  datetime?: T | undefined;
}

export interface trackAttr<T = DVal> extends EAttr {
  default?: T | undefined;
  kind?: T | undefined;
  label?: T | undefined;
  src?: T | undefined;
  srclang?: T | undefined;
}

export interface videoAttr<T = DVal> extends EAttr {
  autoplay?: T | undefined;
  controls?: T | undefined;
  crossorigin?: T | undefined;
  loop?: T | undefined;
  muted?: T | undefined;
  playsinline?: T | undefined;
  height?: T | undefined;
  poster?: T | undefined;
  preload?: T | undefined;
  src?: T | undefined;
  width?: T | undefined;
}

export interface contenteditableAttr<T = DVal> extends EAttr {
  enterkeyhint?: T | undefined;
  inputmode?: T | undefined;
}


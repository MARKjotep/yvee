import type { EAttr } from "./base.attr.dom";
import type { DVal } from "./value-types.attr.dom";

export interface SVGAttributes {
  // SVG Elements  ----------------------------------
  svg: svgAttr & { viewBox?: DVal };
  path: svgEAttr;
  circle: svgEAttr;
  animate: svgEAttr;
  animateMotion: svgEAttr;
  animateTransform: svgEAttr;
  clipPath: svgEAttr;
  defs: svgEAttr;
  desc: svgEAttr;
  ellipse: svgEAttr;
  feBlend: svgEAttr;
  feColorMatrix: svgEAttr;
  feComponentTransfer: svgEAttr;
  feComposite: svgEAttr;
  feConvolveMatrix: svgEAttr;
  feDiffuseLighting: svgEAttr;
  feDisplacementMap: svgEAttr;
  feDistantLight: svgEAttr;
  feDropShadow: svgEAttr;
  feFlood: svgEAttr;
  feFuncA: svgEAttr;
  feFuncB: svgEAttr;
  feFuncG: svgEAttr;
  feFuncR: svgEAttr;
  feGaussianBlur: svgEAttr;
  feImage: svgEAttr;
  feMerge: svgEAttr;
  feMergeNode: svgEAttr;
  feMorphology: svgEAttr;
  feOffset: svgEAttr;
  fePointLight: svgEAttr;
  feSpecularLighting: svgEAttr;
  feSpotLight: svgEAttr;
  feTile: svgEAttr;
  feTurbulence: svgEAttr;
  filter: svgEAttr;
  foreignObject: svgEAttr;
  g: svgEAttr;
  image: svgEAttr;
  line: svgEAttr;
  linearGradient: svgEAttr;
  marker: svgEAttr;
  mask: svgEAttr;
  metadata: svgEAttr;
  mpath: svgEAttr;
  pattern: svgEAttr;
  polygon: svgEAttr;
  polyline: svgEAttr;
  radialGradient: svgEAttr;
  rect: svgEAttr;
  set: svgEAttr;
  stop: svgEAttr;
  symbol: svgEAttr;
  text: svgETextAttr;
  textPath: svgEAttr;
  title: svgEAttr;
  tspan: svgEAttr;
  use: svgEAttr;
  view: svgEAttr;
}

export interface svgAttr<T = DVal> extends EAttr<T> {
  height?: T;
  width?: T;
  preserveAspectRatio?: T;
  fill?: T;
  stroke?: T;
  strokeWidth?: T;
  opacity?: T;
  display?: T;
  overflow?: T;
}

export interface svgEAttr<T = DVal> extends svgAttr<T> {
  transform?: T;
  role?: T;
  tabindex?: T;
  visibility?: T;
  fillOpacity?: T;
  fillRule?: T;
  stroke?: T;
  strokeWidth?: T;
  strokeOpacity?: T;
  strokeLinecap?: T;
  strokeLinejoin?: T;
  strokeMiterlimit?: T;
  strokeDasharray?: T;
  strokeDashoffset?: T;
  x?: T;
  y?: T;
  x1?: T;
  y1?: T;
  x2?: T;
  y2?: T;
  cx?: T;
  cy?: T;
  r?: T;
  rx?: T;
  ry?: T;
  d?: T;
  points?: T;
}

export interface svgETextAttr<T = DVal> extends svgEAttr<T> {
  fontSize?: T;
  fontFamily?: T;
  fontWeight?: T;
  textAnchor?: T;
  dominantBaseline?: T;
}


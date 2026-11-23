import type { EAttr } from "./base.attr.dom";
import type { DVal } from "./value-types.attr.dom";

export interface SVGAttributes {
  // SVG Elements  ----------------------------------
  svg: svgAttr & { viewBox?: DVal | undefined };
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
  height?: T | undefined;
  width?: T | undefined;
  preserveAspectRatio?: T | undefined;
  fill?: T | undefined;
  stroke?: T | undefined;
  strokeWidth?: T | undefined;
  opacity?: T | undefined;
  display?: T | undefined;
  overflow?: T | undefined;
}

export interface svgEAttr<T = DVal> extends svgAttr<T> {
  transform?: T | undefined;
  role?: T | undefined;
  tabindex?: T | undefined;
  visibility?: T | undefined;
  fillOpacity?: T | undefined;
  fillRule?: T | undefined;
  stroke?: T | undefined;
  strokeWidth?: T | undefined;
  strokeOpacity?: T | undefined;
  strokeLinecap?: T | undefined;
  strokeLinejoin?: T | undefined;
  strokeMiterlimit?: T | undefined;
  strokeDasharray?: T | undefined;
  strokeDashoffset?: T | undefined;
  x?: T | undefined;
  y?: T | undefined;
  x1?: T | undefined;
  y1?: T | undefined;
  x2?: T | undefined;
  y2?: T | undefined;
  cx?: T | undefined;
  cy?: T | undefined;
  r?: T | undefined;
  rx?: T | undefined;
  ry?: T | undefined;
  d?: T | undefined;
  points?: T | undefined;
}

export interface svgETextAttr<T = DVal> extends svgEAttr<T> {
  fontSize?: T | undefined;
  fontFamily?: T | undefined;
  fontWeight?: T | undefined;
  textAnchor?: T | undefined;
  dominantBaseline?: T | undefined;
}


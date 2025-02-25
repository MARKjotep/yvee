import { $$, obj, V } from "./@";
import { Dom, dom, frag, baseAttr, c_events, X3 } from "./dom";
import { Stateful } from "./stateful";

import { Elements } from "./storage";
import { doc } from "./yvee";

export { __, $$, Meta, cssLoader, addCSS } from "./@";
export { $ } from "./$";
export { State, Stateful, stateHook } from "./stateful";
export { Yvee, Router, doc, websocket } from "./yvee";
export { local, session, eventStream, minClient } from "./storage";
export { Dom, dom, frag } from "./dom";
export * from "./ui";
// export * from "./misc";

//
export type { _$ } from "./$";

export type { headAttr } from "./@";

declare global {
  type events = {
    [P in keyof GlobalEventHandlersEventMap]?: (
      this: Elements,
      e: GlobalEventHandlersEventMap[P],
    ) => void;
  } & c_events;
  type attr = baseAttr | obj<X3>;
  type ctx = V | Dom | Stateful<V | Dom> | ctx[];
  type obj<T> = Record<string, T>;
  type DomFN<T extends {}> = (a: attr & T, ...D: ctx[]) => Dom;

  namespace JSX {
    type Element = Dom;

    interface IntrinsicElements {
      // Basic ----------------------------------
      p: attr;
      br: attr;
      hr: attr;
      h: attr;
      cmnt: attr;
      root: attr;
      // Styles and Semantics ----------------------------------
      html: attr;
      body: attr;
      div: attr;
      span: attr;
      header: attr;
      hgroup: attr;
      footer: attr;
      main: attr;
      section: attr;
      search: attr;
      article: attr;
      aside: attr;
      details: attr;
      dialog: attr;
      summary: attr;
      data: attr;
      // Programming ----------------------------------
      noscript: attr;
      object: attr;
      param: attr;
      script: attr;
      // Links ----------------------------------
      a: attr;
      nav: attr;
      style: attr;
      // Audio / Video ----------------------------------
      audio: attr;
      video: attr;
      source: attr;
      track: attr;
      // Images ----------------------------------
      img: attr;
      map: attr;
      area: attr;
      canvas: attr;
      figcaption: attr;
      figure: attr;
      picture: attr;
      // IFrame ----------------------------------
      iframe: attr;
      // Forms and Input ----------------------------------
      form: attr;
      input: attr;
      textarea: attr;
      button: attr;
      select: attr;
      optgroup: attr;
      option: attr;
      label: attr;
      fieldset: attr;
      legend: attr;
      datalist: attr;
      // Tables ----------------------------------
      table: attr;
      caption: attr;
      th: attr;
      tr: attr;
      td: attr;
      thead: attr;
      tbody: attr;
      tfoot: attr;
      col: attr;
      colgroup: attr;
      // Formatting ----------------------------------

      b: attr;
      i: attr;
      q: attr;
      s: attr;
      u: attr;
      em: attr;
      rp: attr;
      del: attr;
      dfn: attr;
      ins: attr;
      kbd: attr;
      pre: attr;
      sub: attr;
      sup: attr;
      var: attr;
      wbr: attr;
      cite: attr;
      time: attr;
      abbr: attr;
      code: attr;
      mark: attr;
      samp: attr;
      meter: attr;
      small: attr;
      strong: attr;
      address: attr;
      progress: attr;
      template: attr;
      blockquote: attr;
      // List ----------------------------------
      menu: attr;
      ul: attr;
      ol: attr;
      li: attr;
      dl: attr;
      dt: attr;
      dd: attr;

      h1: attr;
      h2: attr;
      h3: attr;
      h4: attr;
      h5: attr;
      h6: attr;

      // SVG Elements  ----------------------------------
      svg: attr;
      path: attr;
      circle: attr;
      animate: attr;
      animateMotion: attr;
      animateTransform: attr;
      clipPath: attr;
      defs: attr;
      desc: attr;
      ellipse: attr;
      feBlend: attr;
      feColorMatrix: attr;
      feComponentTransfer: attr;
      feComposite: attr;
      feConvolveMatrix: attr;
      feDiffuseLighting: attr;
      feDisplacementMap: attr;
      feDistantLight: attr;
      feDropShadow: attr;
      feFlood: attr;
      feFuncA: attr;
      feFuncB: attr;
      feFuncG: attr;
      feFuncR: attr;
      feGaussianBlur: attr;
      feImage: attr;
      feMerge: attr;
      feMergeNode: attr;
      feMorphology: attr;
      feOffset: attr;
      fePointLight: attr;
      feSpecularLighting: attr;
      feSpotLight: attr;
      feTile: attr;
      feTurbulence: attr;
      filter: attr;
      foreignObject: attr;
      g: attr;
      image: attr;
      line: attr;
      linearGradient: attr;
      marker: attr;
      mask: attr;
      metadata: attr;
      mpath: attr;
      pattern: attr;
      polygon: attr;
      polyline: attr;
      radialGradient: attr;
      rect: attr;
      set: attr;
      stop: attr;
      symbol: attr;
      text: attr;
      textPath: attr;
      title: attr;
      tspan: attr;
      use: attr;
      view: attr;
    }
  }
}

export const resolvePath = (base: string, relative: string) => {
  return `${base.replace(/\/+$/, "")}/${relative.replace(/^\.\/+/, "")}`;
};

type RouteType = (path: string) => <Q extends typeof doc<{}>>(f: Q) => Q;
export const Routes = (fn: (route: RouteType) => void) => {
  return (route: RouteType) => {
    fn(route);
  };
};

type ErrorType = (...codes: number[]) => <Q extends typeof doc<{}>>(f: Q) => Q;
export const Errors = (fn: (error: ErrorType) => void) => {
  return (error: ErrorType) => {
    fn(error);
  };
};

import { validateAttribute } from "../../dom/render/trust.dom";
import { Elem } from "./element.$";
import type { Elements } from "../query.$";
import { anim } from "./anim.element.$";
import {
  isBooleanAttribute,
  isFunction,
  isNumber,
  isStateValue,
  oItems,
  reCamel,
  toAttributeValue,
  type CSSStyle,
  type V,
} from "../support.$";
import { renderContent } from "../renderer.$";

export class Eget<T extends Elements = HTMLElement> {
  constructor(
    public e: T,
    protected _query?: string,
  ) {}
  get a() {
    return new anim(this as any);
  }
  get all() {
    if (this._query) {
      const QD = document.querySelectorAll(this._query);
      if (QD.length) {
        return Array.from(QD).map((a) => a as T);
      }
    }
    return [];
  }
  get attr() {
    const lat = this.e;
    return {
      has: (attr: string): boolean => {
        return lat.hasAttribute(attr);
      },
      get: (attr: string): string | null => {
        return lat.getAttribute(attr);
      },
      del: (attr: string): Eget<T> => {
        lat.removeAttribute(attr);

        return this;
      },
      set: (attrs: Record<string, unknown>): Eget<T> => {
        for (const [name, value] of Object.entries(attrs)) {
          if (value === undefined) continue;
          const text = toAttributeValue(value);
          validateAttribute(name, text);
          if (isBooleanAttribute(name) && typeof value === "boolean") {
            lat.toggleAttribute(name, value);
          } else {
            lat.setAttribute(name, text);
          }
        }
        return this;
      },
    };
  }
  get children() {
    return Array.from(this.e.children).map((element) => new Elem(element as T));
  }
  get click() {
    (this.e as HTMLElement).click();
    return this;
  }
  get delete() {
    this.e.remove();
    return this;
  }
  get disabled() {
    return "disabled" in this.e ? Boolean(this.e.disabled) : false;
  }
  get focus() {
    this.e.focus();
    return this;
  }
  get href() {
    return (this.e as unknown as HTMLAnchorElement)?.href ?? "";
  }
  get id() {
    return this.e.id;
  }
  get inner(): string {
    return this.e.innerHTML;
  }
  get offsetParent(): Elem | undefined {
    let prtn = (this.e as HTMLElement).offsetParent;
    if (prtn) {
      return new Elem(prtn as HTMLElement);
    }
    return undefined;
  }
  get parent(): Elem | undefined {
    let prtn = this.e.parentElement;
    if (prtn) {
      return new Elem(prtn);
    }
    return undefined;
  }
  get hash() {
    return (this.e as unknown as HTMLAnchorElement)?.hash ?? "";
  }
  get path() {
    return (this.e as unknown as HTMLAnchorElement)?.pathname ?? "";
  }
  get rect() {
    return this.e.getBoundingClientRect();
  }
  get remove_element() {
    this.e.remove();
    return this;
  }
  get style() {
    const CC = this.e.style;
    const TT = this as unknown as Elem<T>;
    return {
      set: (
        style: CSSStyle | Record<string, V | null | undefined>,
        delayOrFN: number | ((e?: any) => void) = 0,
      ): Elem<T> => {
        const TES = CC as unknown as Record<string, unknown>;
        const styler = () => {
          oItems(style).forEach(([st, vs]) => {
            if (vs === undefined) return;
            const value = isStateValue(vs) ? vs.value : vs;
            if (st in TES) {
              if (TES[String(st)] !== value) {
                TES[String(st)] = value;
              }
            } else {
              if (value !== null) {
                CC.setProperty(String(st), String(value));
              } else {
                CC.removeProperty(String(st));
              }
            }
          });
        };

        if (isFunction(delayOrFN)) {
          TT.e.addEventListener("transitionend", delayOrFN as EventListener, {
            once: true,
          });
        }

        if (isNumber(delayOrFN)) {
          setTimeout(styler, delayOrFN);
        } else {
          styler();
        }

        return TT;
      },
      get: (prop: keyof CSSStyleDeclaration | string) => {
        //
        const rc = reCamel(String(prop));
        return CC.getPropertyValue(rc);
      },
      del: (...props: (keyof CSSStyleDeclaration | string)[]): Elem<T> => {
        props.forEach((pr) => {
          const rc = reCamel(String(pr));
          CC.removeProperty(rc);
        });

        return TT;
      },
    };
  }
  get submit() {
    if (!(this.e instanceof HTMLFormElement)) return false;
    this.e.requestSubmit();
    return true;
  }
  get tag() {
    return this.e.tagName.toLowerCase();
  }
  get value() {
    return "value" in this.e ? (this.e.value ?? "") : "";
  }

  get unload() {
    return () => {
      this.e.remove();
    };
  }

  private async updateContent(
    value: unknown,
    position: "inner" | InsertPosition,
  ) {
    const rendered = await renderContent(value, dID(this.id));
    if (position === "inner") {
      this.e.innerHTML = rendered.html;
    } else {
      this.e.insertAdjacentHTML(position, rendered.html);
    }
    await rendered.commit?.();
  }

  set append(val: any) {
    void this.updateContent(val, "beforeend");
  }
  set appendfirst(val: any) {
    void this.updateContent(val, "afterbegin");
  }
  set inner(val: any) {
    void this.updateContent(val, "inner");
  }
  set disabled(vl: boolean) {
    let tval = this.e;
    if ("disabled" in tval) {
      tval.disabled = vl;
    }
  }

  set id(did: string) {
    this.e.id = did;
  }
  set value(vl: any) {
    if ("value" in this.e) this.e.value = vl;
  }
}

const dID = (id?: string): string | undefined => (id ? `${id}-0` : id);

import { maybePromise, Mapper as Mapper$1, V as V$1, MinStorage, Storage } from '@coff-r/x';
export { IfClient, Time, __, bind, log, maybePromise } from '@coff-r/x';

type V = string | number | boolean;
type obj$1<T> = Record<string, T>;

type CSSinT = {
    [P in keyof CSSStyleDeclaration]?: V;
} & {
    [key: string]: V;
};
declare function upsertCSS(selector: string, rules?: CSSinT): void;

/**
 * A custom Map implementation that provides additional utility methods for working with objects and maps.
 *
 * @template K - The type of the keys in the map.
 * @template V - The type of the values in the map.
 */
declare class Mapper<K, V> extends Map<K, V> {
    obj(obj?: object | null): void;
    map(map: Mapper<K, V>): void;
    ass<T>(key: K, obj: T): void;
    lacks(key: K): boolean;
    init(key: K, val: V): V;
}

declare class Idm {
    private counter;
    private readonly baseId;
    constructor(rawId?: string);
    get id(): string;
    get nextId(): string;
}

type MetaTag = {
    charset: string;
} | {
    name: string;
    content: string;
} | {
    property: string;
    content: string;
} | {
    "http-equiv": string;
    content: string;
};
interface MetaViewport {
    width?: string;
    height?: string;
    initialScale?: string;
    minimumScale?: string;
    maximumScale?: string;
    userScalable?: "yes" | "no";
    interactiveWidget?: "resizes-content" | "overlays-content";
}
interface HttpEquiv {
    contentSecurityPolicy?: string;
    contentType?: string;
    defaultStyle?: string;
    refresh?: string | number;
    cacheControl?: string;
    xUaCompatible?: string;
}
interface OpenGraphBase {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}
type TwitterCardType = "summary" | "summary_large_image" | "app" | "player";
interface TwitterMeta extends OpenGraphBase {
    card?: TwitterCardType;
}
declare class MetaBuilder {
    readonly tags: MetaTag[];
    constructor(description?: string);
    author(name: string): this;
    charset(value: string): this;
    keywords(...keywords: string[]): this;
    viewport(vp: MetaViewport): this;
    httpEquiv(values: HttpEquiv): this;
    robots(...directives: ("index" | "noindex" | "follow" | "nofollow")[]): this;
    themeColor(color: string): this;
    openGraph(og: OpenGraphBase): this;
    twitter(meta: TwitterMeta): this;
    extend(tags: MetaTag[]): this;
    toArray(): readonly MetaTag[];
}

type Obj<T> = Record<string, T>;
type MetaAttrs<Value = string> = {
    charset?: Value;
    content?: Value;
    "http-equiv"?: Value;
    name?: Value;
    property?: Value;
    media?: Value;
    url?: Value;
};
type LinkAttrs<Value = string> = {
    href?: Value;
    hreflang?: Value;
    media?: Value;
    referrerpolicy?: Value;
    rel?: "stylesheet" | "icon" | "manifest" | Value;
    sizes?: Value;
    title?: Value;
    type?: Value;
    as?: Value;
    crossorigin?: Value;
};
type ImportMapAttrs<Value = string> = {
    imports?: Obj<Value>;
    scopes?: Obj<Value>;
    integrity?: Obj<Value>;
};
type ScriptAttrs<Value = string | boolean> = {
    async?: Value;
    crossorigin?: Value;
    defer?: Value;
    integrity?: Value;
    nomodule?: Value;
    referrerpolicy?: Value;
    src?: Value;
    type?: "text/javascript" | Value;
    id?: Value;
    importmap?: ImportMapAttrs<Value>;
    body?: Value;
    yid?: string;
};
type BaseAttrs<Value = string> = {
    href?: Value;
    target?: "_blank" | "_parent" | "_self" | "_top";
};
interface HeadAttributes<Value = string> {
    title?: string;
    description?: string;
    base?: BaseAttrs<Value>[];
    meta?: MetaAttrs<Value>[] | MetaBuilder;
    link?: LinkAttrs<Value>[];
    script?: ScriptAttrs<Value>[];
    css?: Value[] | Value;
    js?: Value[] | Value;
}
declare abstract class Head implements HeadAttributes {
    title?: string;
    description?: string;
    css?: string[] | string;
    js?: string[] | string;
    meta?: MetaAttrs<string>[] | MetaBuilder;
    link?: LinkAttrs<string>[];
    script?: ScriptAttrs<string>[];
}
type headType = Mapper<keyof HeadAttributes, any>;
interface HeadConfig {
    initial?: headType;
    mark?: boolean;
    push?: obj$1<any>;
}
declare class HtmlHead {
    lang: string;
    htmlHead: headType;
    head: (heads?: Omit<HeadAttributes, "base"> & {
        base?: HeadAttributes["base"];
    }) => void;
    constructor({ mark, push }?: HeadConfig);
}

declare const cssLoader: (attrs: LinkAttrs<string>) => Promise<HTMLLinkElement | undefined>;

type hookFN<T extends any[]> = (...args: statefulValue<T>) => maybePromise<void>;
interface stateCFG {
    id?: string;
    init?: boolean;
}
declare function StateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: Stateful<T[K]>;
}], { id, init }?: stateCFG): Promise<() => void>;

declare class OZ {
    private events;
    private states;
    private windowEvents;
    private resetST;
    private resetEV;
    get keys(): string[];
    set(catt: CATT): this;
    push(_OZ: this): this;
    get stage(): this;
    get processWindowEvents(): this;
    reset(id: string[]): this;
    RPS(oz?: this): this;
}

declare class CATT {
    xid: string;
    IDM: Idm;
    map: Mapper$1<string, string[]>;
    states: ((id: string) => () => void)[];
    events: Mapper$1<string, (...arg: any) => any>;
    OZ: OZ;
    constructor(xid: string, IDM?: Idm, _OZ?: OZ);
    attr_push(key: string, val: any, pre?: string): void;
    get attr(): string;
    set id(id: string);
    get id(): string | undefined;
}

type CSSStyle = {
    [P in keyof CSSStyleDeclaration]?: DVal;
} & {
    [key: string]: DVal;
};

interface c_events<T extends Elements = HTMLElement> {
    state?: (this: T, e: T) => [(...args: any[]) => void, Stateful<any>[], boolean?];
    ready?: (this: T, e: T) => void;
    resize?: (this: T, e: UIEvent) => void;
    beforeunload?: (this: T, e: BeforeUnloadEvent) => void;
    popstate?: (this: T, e: PopStateEvent) => void;
    winscroll?: (this: T, e: Event) => void;
    winload?: (this: T, e: Event) => void;
    winfocus?: (this: T, e: Event) => void;
    winblur?: (this: T, e: Event) => void;
}

interface EAttr<T = DVal> {
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
interface ElementAttributes {
    link: linkAttr;
    base: baseAttr;
    meta: metaAttr;
    p: EAttr;
    br: EAttr;
    hr: EAttr;
    h: EAttr;
    cmnt: EAttr;
    root: EAttr;
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
    noscript: EAttr;
    object: objectAttr;
    param: paramAttr;
    script: scriptAttr;
    a: aAttr;
    nav: EAttr;
    style: styleAttr;
    audio: audioAttr;
    video: videoAttr;
    source: sourceAttr;
    track: trackAttr;
    img: imgAttr;
    map: mapAttr;
    area: areaAttr;
    canvas: canvasAttr;
    figcaption: EAttr;
    figure: EAttr;
    picture: EAttr;
    iframe: iframeAttr;
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
interface SVGAttributes {
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
interface aAttr<T = DVal> extends EAttr {
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
interface buttonAttr<T = DVal> extends EAttr {
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

type kf = KeyframeAnimationOptions;
type KFType = (CSSStyle | obj<V$1>)[] | CSSStyle | obj<V$1>;
declare class anim {
    private e;
    opt: kf;
    constructor(e: Elem);
    animate(keyframes: CSSStyle[] | CSSStyle, options?: kf): Elem<HTMLElement>;
    get slide(): {
        left: (options?: kf) => anim;
        right: (options?: kf) => anim;
        up: (options?: kf) => anim;
        down: (options?: kf) => anim;
    };
    fade(options?: kf): this;
    shake(XorY?: string, opt?: kf): this;
    color(c?: string[], opt?: kf): this;
    bg(c?: string | string[], opt?: kf): this;
    bounce(sVal?: number, opt?: kf): this;
}

declare class Eget<T extends Elements = HTMLElement> {
    e: T;
    protected _query?: string | undefined;
    private _parent?;
    constructor(e: T, _query?: string | undefined);
    get a(): anim;
    get all(): T[];
    get attr(): {
        has: (attr: string) => boolean;
        get: (attr: string) => string | null;
        del: (attr: string) => Eget<T>;
        set: (attrs: obj<any>) => Eget<T>;
    };
    get children(): Elem<T>[];
    get click(): this;
    get delete(): this;
    get disabled(): boolean;
    get focus(): this;
    get href(): string;
    get id(): string;
    get inner(): string;
    get offsetParent(): Elem | undefined;
    get parent(): Elem | undefined;
    get hash(): string;
    get path(): string;
    get rect(): DOMRect;
    get remove_element(): this;
    get style(): {
        set: (style: CSSStyle | obj<V$1 | null>, delayOrFN?: number | ((e?: any) => void)) => Elem<T>;
        get: (prop: keyof CSSStyleDeclaration | string) => string;
        del: (...props: (keyof CSSStyleDeclaration | string)[]) => Elem<T>;
    };
    get submit(): any;
    get tag(): string;
    get value(): any;
    get unload(): () => void;
    set append(val: any);
    set appendfirst(val: any);
    set inner(val: any);
    set disabled(vl: boolean);
    set id(did: string);
    set value(vl: any);
}

type fn<E, T> = (e?: E) => T;
declare class Elem<T extends Elements = HTMLElement> extends Eget<T> {
    add(...className: string[]): () => void;
    remove(...className: string[]): this;
    toggle(className: string | fn<any, string>, force?: boolean): boolean;
    hasNode(e: Node): boolean;
    has(...classes: string[]): boolean;
    insert(position: InsertPosition): {
        HTML: (...text: string[]) => Elem<T>;
        element: (...elem: HTMLElement[]) => Elem<T>;
        text: (this: Elem<T>, ...text: string[]) => Elem<T>;
    };
    is(tp: {
        dom?: string;
        class?: string | string[];
    }): boolean;
    on(event: keyof events, handler: (e?: any) => void, useCapture?: boolean): this;
    remove_on(event: keyof DocumentEventMap, handler: EventListenerOrEventListenerObject, useCapture?: boolean): this;
    timed(fn: (ee?: Elem<T>) => void, timeout?: number): this;
    animate(keyframes: KFType, options?: kf, onComplete?: fn<any, void>): this;
    animate(keyframes: KFType, onComplete?: fn<any, void>): this;
    query(query: string): T | null;
    queryAll(query: string): T[];
    newChild<P>(element: TagNames, props?: Record<string, P>): Elem<HTMLElement>;
    newChildNS<P>(element: TagNames, props?: Record<string, P>): Elem<SVGElement>;
    get(property: string): any;
}

type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | SVGElementTagNameMap[keyof SVGElementTagNameMap];
type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
interface CLI {
    id?: string;
    class?: string;
}
declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: CLI, parent?: P): Elem<T> | undefined;
declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: string, parent?: P): Elem<T> | undefined;
declare function $<T extends Elements = HTMLElement>(element: T): Elem<T>;
type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
type $_<T extends Elements = HTMLElement> = Elem<T>;
declare class Ref<T extends Elements = HTMLElement> {
    state: Stateful<_$<T>>;
    get element(): T | undefined;
    set element(elem: T | undefined);
    get $(): _$<T>;
}
declare const useRef: <T extends Elements = HTMLElement>() => Ref<T>;

type statefulValue<T extends any[]> = {
    [K in keyof T]: T[K] extends Stateful<infer U> ? U : T[K];
};
declare class Stateful<T> extends EventTarget {
    private options;
    private deep;
    private verify;
    private hooks;
    private states;
    private _value;
    private listening;
    private end?;
    constructor(value: T, options?: AddEventListenerOptions, deep?: boolean, verify?: boolean);
    get value(): T;
    set value(newValue: T);
    get listen(): () => void;
    call<Q>(callback: (this: Elements, arg: T) => Q, entry: string): (id: string) => () => void;
    hook<T extends any[]>(callback: hookFN<T>): (id: string) => () => void;
}
declare function State<T>(value: T, options?: AddEventListenerOptions): Stateful<T>;
/**
 * Quick State checking - skip checking of Object keys:values as it will only be compared as a===b
 */
declare function QState<T>(value: T, verify?: boolean): Stateful<T>;

interface renderedDom {
    ctx: string;
    oz: OZ;
    id: string | undefined;
}
declare function renderDom(Dom: DOM, pid?: Idm | string): Promise<renderedDom>;
declare class DOM {
    tag: string;
    attr: attr;
    ctx: ctx[];
    constructor(tag: string, attr: attr, ctx: ctx[]);
}
declare function dom$1(tag: string | ((attr: attr, ...ctx: ctx[]) => maybePromise<DOM>), attr?: attr | null, ...ctx: ctx[]): Promise<DOM>;
declare const frag: (attr: attr, ...ctx: DOM[]) => Promise<DOM>;
declare global {
    type events<T extends Elements = HTMLElement> = {
        [P in keyof GlobalEventHandlersEventMap]?: (this: T, e: GlobalEventHandlersEventMap[P]) => void;
    } & c_events<T>;
    type DVal<T = V$1 | V$1[]> = T | Stateful<T> | undefined;
    type dom = DOM;
    type ctx<T = DVal | dom> = maybePromise<T | Stateful<T> | ctx[]>;
    type obj<T> = Record<string, T>;
    type DomFN<T = {}> = (a: attr & T, ...D: ctx[]) => maybePromise<dom>;
    type attr = EAttr;
    namespace JSX {
        type Element = maybePromise<dom>;
        interface IntrinsicElements extends ElementAttributes, SVGAttributes {
        }
    }
}

interface docObj {
    args?: obj<any>;
    data?: obj<any>;
}
declare class doc<T extends docObj = obj<obj<any>>> extends Head {
    path: string;
    data: T["data"];
    args: T["args"];
    importArgs: any[] | (() => any[]);
    fetch?(): maybePromise<obj<any>>;
    head?(): maybePromise<void>;
    body?(): maybePromise<any>;
    static A: (a: aAttr, ...ctx: ctx[]) => Promise<DOM>;
}

type ExtraState = Record<string, unknown>;
type HistoryData<S extends ExtraState = ExtraState> = (S & {
    path: string;
}) | null;
type ChangeHandler<S extends ExtraState> = (path: string, state: HistoryData<S>) => void;
declare class PathHistory<S extends ExtraState = ExtraState> {
    private onChange;
    private popListener?;
    constructor(path?: Stateful<string>, isDev?: boolean, onChange?: ChangeHandler<S>);
    /** Current path (pathname + search + hash) */
    path(): string;
    /** Current state object */
    state(): HistoryData<S>;
    /** Navigate to a new path using pushState (no-op if same as current) */
    navigate(path: string, state?: S, title?: string): void;
    /** Replace current entry using replaceState (no-op if same as current) */
    replace(path: string, state?: S, title?: string): void;
    back(): void;
    forward(): void;
    /** Remove listeners */
    destroy(): void;
    private resolve;
    private samePath;
}

interface contentObj {
    args?: obj<any>;
    data?: obj<any>;
}
declare class content<T extends contentObj = obj<obj<string>>> {
    path: string;
    data: T["data"];
    args: T["args"];
    importArgs: any[] | (() => any[]);
    body?(): maybePromise<any>;
    static Button: (a: buttonAttr & {
        tab?: string | string[];
    }, ...ctx: ctx[]) => Promise<DOM>;
}

declare class websocket<T = Record<string, any>> {
    path: string;
    protected args: T;
    route: string;
    ws: WebSocket;
    isConnected: Stateful<boolean>;
    data: T;
    constructor(path: string, args?: T);
    protected open(event: Event): Promise<void> | void;
    protected message(event: MessageEvent): Promise<void> | void;
    protected close(event: CloseEvent): Promise<void> | void;
    protected error(event: Event): Promise<void> | void;
    get connect(): this;
    get reconnect(): this;
    get disconnect(): this;
    /**
     * code:
     * * 0 - CONNECTING: The connection is being established.
     * * 1 - OPEN: The connection is open and ready to communicate.
     * * 2 - CLOSING: The connection is in the process of closing.
     * * 3 - CLOSED: The connection has been closed or could not be opened.
     */
    get state(): number;
    set send(message: string | ArrayBufferLike | Blob | ArrayBufferView);
}
declare class socket {
    protected yvee: Yvee;
    constructor(yvee: Yvee);
    load(_path: string): Promise<websocket<Record<string, any>> | undefined>;
    unload(_path: string): void;
}

declare class BasePath<T> extends MinStorage {
    cls: T;
    constructor(path: string, cls: T);
}
declare class ClientPath extends BasePath<typeof doc<{}>> {
}
declare class SocketPath extends BasePath<typeof websocket> {
}
declare class MainStorage<T extends InstanceType<typeof BasePath>> {
    storage: Storage<T>;
    error: Storage<T>;
}
declare class Stormy extends MainStorage<ClientPath> {
    wss: Storage<SocketPath>;
    setRoute(path: string, _doc: typeof doc<{}>): void;
    getRoute(path: string, error?: number): doc<{}>;
    setWss(path: string, _wss: typeof websocket): void;
    getWss(path: string): [SocketPath | undefined, Record<string, string>];
    setError(code: number, _doc: typeof doc<{}>): void;
    getError(code?: number): [ClientPath | undefined, Record<string, string>];
}
declare class TabPath extends BasePath<typeof content<{}>> {
}
declare class miniStormy extends MainStorage<TabPath> {
    setRoute(path: string, _doc: typeof content<{}>): void;
    getRoute(path: string, error?: number): content<{}>;
    setWss(path: string): void;
    getWss(path: string): void;
    setError(code: number, _doc: typeof content<{}>): void;
    getError(code?: number): [TabPath | undefined, Record<string, string>];
}

declare class minElements$1 extends HtmlHead {
    id: string;
    data: obj<any>;
    path: Stateful<string>;
    protected _root: Stateful<any[]>;
    constructor();
    A(a: aAttr, ...ctx: ctx[]): Promise<DOM>;
    protected _main?: ((root: Stateful<any[]>) => maybePromise<dom>) | undefined;
    protected getMain(_class?: string | string[]): Promise<DOM>;
}

declare class Router extends minElements$1 {
    protected pushHistory: boolean;
    storage: Stormy;
    protected base: string;
    constructor(base?: string, index?: string, pushHistory?: boolean);
    /** --------------------
     * string | int | float | file | uuid
     * - /url/\<string:hell>
     */
    route<Q extends typeof doc<{}>>(path: string): (f: Q) => Q;
    error<Q extends typeof doc<{}>>(...codes: number[]): (f: Q) => Q;
    /** --------------------
     * string | int | float | file | uuid
     * - /url/\<string:hell>
     */
    wss<Q extends typeof websocket>(path: string): (f: Q) => Q;
}

interface mtab {
    tab?: string | string[];
}
declare class minElements {
    id: string;
    path: Stateful<string>;
    protected _root: Stateful<any[]>;
    Button(a: buttonAttr & mtab, ...ctx: ctx[]): Promise<DOM>;
}
interface _Tabs {
    path?: Stateful<string>;
}
declare class Tabs extends minElements {
    storage: miniStormy;
    private hasLoaded;
    constructor({ path }?: _Tabs);
    tab<Q extends typeof content<{}>>(path: string): (f: Q) => Q;
    Main(a: attr & {
        tab?: string;
        data?: obj<any>;
    }): Promise<DOM>;
    load(tab: string, data?: obj<any>): Promise<void>;
}

interface renderConfig {
    class?: string | string[];
    id?: string;
    data?: any;
}
interface serverRender {
    path: string;
    error?: number;
    data?: Record<string, any>;
}
interface _Yvee {
    base?: string;
    index?: string;
    history?: boolean;
    isDev?: boolean;
}
declare class Yvee extends Router {
    yvee: Yvee;
    private isDev;
    history: PathHistory;
    constructor({ base, history, index, isDev }?: _Yvee);
    Main(main?: (root: Stateful<any[]>) => maybePromise<dom>): void;
    render(x?: renderConfig): Promise<(() => void) | (({ path, data, error }: serverRender) => Promise<string>)>;
    private init;
}
declare const Routes: <T>(fn: (route: Yvee["route"]) => T) => (route: Yvee["route"]) => T;

export { $, DOM, MetaBuilder, PathHistory, QState, Ref, Routes, State, StateHook, Stateful, Tabs, Yvee, content, cssLoader, doc, dom$1 as dom, frag, renderDom, socket, upsertCSS, useRef, websocket };
export type { $_, Elements, HeadAttributes, _$, aAttr, serverRender };

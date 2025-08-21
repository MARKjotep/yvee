type ModuleLike = {
    [Symbol.toStringTag]: "Module";
    default?: unknown;
    [key: string]: unknown;
};
declare const isFN: (v: any) => v is Function;
declare const isAsync: (v: any) => v is Function;
declare const isPromise: (v: any) => v is Function;
declare const isNumber: (value: any) => boolean;
declare const isObject: (val: any) => val is Record<string, any>;
declare const isPlainObject: (value: any) => boolean;
declare const isModule: (obj: any) => obj is ModuleLike;
declare const isArraybuff: (val: any) => val is string | ArrayBuffer | Uint8Array<ArrayBufferLike>;
declare const isClassOrId: (k: string) => boolean;
declare const isBool: (v: any) => v is boolean;
declare const isStr: (v: any) => v is string;
declare const isArr: (v: any) => v is any[];
declare const isObj: (v: any) => v is object;
declare const isNum: (v: any) => v is number;
declare const isNull: (v: any) => v is null;
declare const isNotNull: <T>(v: T) => v is Exclude<T, null>;
declare const isUndefined: (v: any) => v is undefined;
declare const isDefined: <T>(v: T) => v is Exclude<T, undefined>;
declare const isInt: (str: string) => boolean;
declare const isWindow: boolean;
declare const isNotWindow: boolean;

type is_ModuleLike = ModuleLike;
declare const is_isArr: typeof isArr;
declare const is_isArraybuff: typeof isArraybuff;
declare const is_isAsync: typeof isAsync;
declare const is_isBool: typeof isBool;
declare const is_isClassOrId: typeof isClassOrId;
declare const is_isDefined: typeof isDefined;
declare const is_isFN: typeof isFN;
declare const is_isInt: typeof isInt;
declare const is_isModule: typeof isModule;
declare const is_isNotNull: typeof isNotNull;
declare const is_isNotWindow: typeof isNotWindow;
declare const is_isNull: typeof isNull;
declare const is_isNum: typeof isNum;
declare const is_isNumber: typeof isNumber;
declare const is_isObj: typeof isObj;
declare const is_isObject: typeof isObject;
declare const is_isPlainObject: typeof isPlainObject;
declare const is_isPromise: typeof isPromise;
declare const is_isStr: typeof isStr;
declare const is_isUndefined: typeof isUndefined;
declare const is_isWindow: typeof isWindow;
declare namespace is {
  export { is_isArr as isArr, is_isArraybuff as isArraybuff, is_isAsync as isAsync, is_isBool as isBool, is_isClassOrId as isClassOrId, is_isDefined as isDefined, is_isFN as isFN, is_isInt as isInt, is_isModule as isModule, is_isNotNull as isNotNull, is_isNotWindow as isNotWindow, is_isNull as isNull, is_isNum as isNum, is_isNumber as isNumber, is_isObj as isObj, is_isObject as isObject, is_isPlainObject as isPlainObject, is_isPromise as isPromise, is_isStr as isStr, is_isUndefined as isUndefined, is_isWindow as isWindow };
  export type { is_ModuleLike as ModuleLike };
}

declare const IfClient: <T>(fn: () => T) => T | undefined;

type V = string | number | boolean;
type obj$1<T> = Record<string, T>;
type maybePromise<T> = Promise<T> | T;

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

declare class log {
    static set i(a: any);
    static set e(a: any);
    static set w(a: any);
}

interface metaViewport {
    width?: string;
    height?: string;
    initialScale?: string;
    minimumScale?: string;
    maximumScale?: string;
    userScalable?: string;
    interactiveWidget?: string;
}
interface httpeQuiv {
    contentSecurityPolicy?: string;
    contentType?: string;
    defaultStyle?: string;
    refresh?: string;
    cacheControl?: string;
    xUaCompatible?: string;
}
interface OG {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    card?: "summary" | "summary_large_image" | "app" | "player";
}
type meta$1<T> = {
    charset?: T;
    content?: T;
    "http-equiv"?: T;
    name?: T;
    property?: T;
    media?: T;
    url?: T;
};
declare class Meta {
    metas: Record<string, string>[];
    constructor(description?: string);
    author(name: string): this;
    charset(val: string): this;
    keywords(...keyword: string[]): this;
    viewport(vport: metaViewport): this;
    httpEquiv(httpeQuiv: httpeQuiv): this;
    robots(...robot: ("index" | "noindex" | "follow" | "nofollow")[]): this;
    themeColor(color: string): this;
    openGraph(og: Omit<OG, "card">): this;
    twitter(og: OG): this;
    push(metas: meta$1<string>[]): void;
    private set meta(value);
}

type meta<T> = {
    charset?: T;
    content?: T;
    "http-equiv"?: T;
    name?: T;
    property?: T;
    media?: T;
    url?: T;
};
type link<T> = {
    href?: T;
    hreflang?: T;
    media?: T;
    referrerpolicy?: T;
    rel?: "stylesheet" | "icon" | "manifest" | T;
    sizes?: T;
    title?: T;
    type?: T;
    as?: T;
    crossorigin?: T;
};
type impmap = {
    imports?: obj$1<string>;
    scopes?: obj$1<string>;
    integrity?: obj$1<string>;
};
type script<T> = {
    async?: T;
    crossorigin?: T;
    defer?: T;
    integrity?: T;
    nomodule?: T;
    referrerpolicy?: T;
    src?: T;
    type?: "text/javascript" | T;
    id?: T;
    importmap?: impmap;
    body?: T;
};
type base<T> = {
    href?: T;
    target?: "_blank" | "_parent" | "_self" | "_top";
};
interface headAttr {
    title?: string;
    base?: base<string>[];
    meta?: meta<string>[] | Meta;
    link?: link<string>[];
    script?: script<string | boolean>[];
    css?: string[] | string;
    js?: string[] | string;
    description?: string;
}
declare abstract class head implements headAttr {
    title?: string;
    description?: string;
    css?: string[] | string;
    js?: string[] | string;
    meta?: meta<string>[] | Meta;
    link?: link<string>[];
    script?: script<string | boolean>[];
}
type CSSinT = {
    [P in keyof CSSStyleDeclaration]?: V;
} & {
    [key: string]: V;
};
type headType = Mapper<keyof headAttr, any>;
interface hHeadCFG {
    initial?: headType;
    mark?: boolean;
    push?: obj$1<any>;
}
declare class htmlHead {
    lang: string;
    htmlHead: headType;
    head: (heads?: Omit<headAttr, "base">) => void;
    constructor({ mark, push }?: hHeadCFG);
}
declare const cssLoader: (vv: link<string>) => Promise<HTMLLinkElement | undefined>;
declare function addCSS(selector: string, rules?: CSSinT): void;

declare class MinStorage {
    readonly path: string;
    readonly parsed: string[];
    readonly args: string[];
    constructor(path: string);
}

/** --------------------
 * string | int | float | file | uuid
 * - /path/\<string:hell>
 */
declare class Storage<T extends MinStorage> {
    private _storage;
    private CC;
    constructor();
    set(min: T): void;
    get(path: string): [T | undefined, Record<string, string>];
    keys(): MapIterator<string>;
}

declare class Time {
    date: Date;
    constructor(dateMS?: number);
    delta(date2?: number | null, _Date?: boolean): number | Date;
    timed(time?: {
        year?: number;
        month?: number;
        day?: number;
        hour?: number;
        minute?: number;
        second?: number;
    }): Date;
    static delta(date1: number, date2?: number | null): number;
    static local(date: number): string;
    static get now(): number;
}

declare class __ {
    static rand(min?: number, max?: number): number;
    static fill(count: number, fill?: any): any[];
    static new({ dom, id, inner, }: {
        dom: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
        id?: string;
        inner?: any;
    }): HTMLElement;
    static randFrom(arr: any[] | Object): any;
    static randArray<T>(arr?: T[], length?: number, unique?: boolean): T[];
    static randomAZ: () => string;
    static makeID: (length: number) => string;
    static class(a: obj$1<any>, ...classes: string[]): void;
    static get O(): {
        vals: {
            <T>(o: {
                [s: string]: T;
            } | ArrayLike<T>): T[];
            (o: {}): any[];
        };
        keys: {
            (o: object): string[];
            (o: {}): string[];
        };
        items: {
            <T>(o: {
                [s: string]: T;
            } | ArrayLike<T>): [string, T][];
            (o: {}): [string, any][];
        };
        has: (o: object, v: PropertyKey) => boolean;
        ass: {
            <T extends {}, U>(target: T, source: U): T & U;
            <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
            <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
            (target: object, ...sources: any[]): any;
        };
        len: (obj?: {}) => number;
    };
    static get is(): typeof is;
    static get return(): typeof returner;
    static sleep: (ms?: number) => Promise<unknown>;
    static get screen(): "xs" | "sm" | "smd" | "md" | "lg" | "xl" | "xxl" | undefined;
    bytes(bytes: number): string;
    static format(val: any): Formatteer;
}
declare class returner {
    static arr<T = string>(val?: any): T[];
    static num(val: any, iferr?: any): number;
    static str(val: any): string;
    static arr2obj(val: any[], switched?: boolean): any;
}
declare class Formatteer {
    val: any;
    constructor(val: any);
    get px(): string;
    get rem(): string;
    get pr(): string;
}

type hookFN<T extends any[]> = (...args: statefulValue<T>) => maybePromise<void>;
interface stateCFG {
    id?: string;
    init?: boolean;
}
declare function StateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: Stateful<T[K]>;
}], { id, init }?: stateCFG): Promise<() => void>;

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
type KFType = (CSSStyle | obj$1<V>)[] | CSSStyle | obj$1<V>;
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
    query?: string | undefined;
    constructor(e: T, query?: string | undefined);
    get a(): anim;
    get all(): T[];
    get attr(): {
        has: (attr: string) => boolean;
        get: (attr: string) => string | null;
        del: (attr: string) => Eget<T>;
        set: (attrs: obj$1<any>) => Eget<T>;
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
        set: (style: CSSStyle | obj$1<V | null>, delayOrFN?: number | ((e?: any) => void)) => Elem<HTMLElement>;
        get: (prop: keyof CSSStyleDeclaration | string) => string;
        del: (...props: (keyof CSSStyleDeclaration | string)[]) => void;
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
    constructor(e: T, query?: string);
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
}

type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | SVGElementTagNameMap[keyof SVGElementTagNameMap];
interface CLI {
    id?: string;
    class?: string;
}
declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: CLI, parent?: P): Elem<T> | undefined;
declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: string, parent?: P): Elem<T> | undefined;
declare function $<T extends Elements = HTMLElement>(element: T): Elem<T>;
type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
type $E<T extends Elements = HTMLElement> = Elem<T>;
declare class Ref<T extends Elements = HTMLElement> {
    state: Stateful<_$<T>>;
    constructor();
    get element(): T | undefined;
    set element(elem: T | undefined);
    get $(): _$<T>;
}
declare const useRef: <T extends Elements = HTMLElement>() => Ref<T>;

declare class Dom {
    tag: string;
    attr: attr;
    ctx: ctx[];
    constructor(tag: string, attr: attr, ctx: ctx[]);
}
declare function dom(tag: string | ((attr: attr, ...ctx: ctx[]) => Dom), attr?: attr | null, ...ctx: ctx[]): Dom;
declare const frag: (attr: attr, ...ctx: Dom[]) => Dom;
declare global {
    type events<T extends Elements = HTMLElement> = {
        [P in keyof GlobalEventHandlersEventMap]?: (this: T, e: GlobalEventHandlersEventMap[P]) => void;
    } & c_events<T>;
    type DVal<T = V | V[]> = T | Stateful<T> | undefined;
    type dom = Dom;
    type ctx<T = DVal | dom> = T | Stateful<T> | ctx[];
    type obj<T> = Record<string, T>;
    type DomFN<T = {}> = (a: attr & T, ...D: ctx[]) => dom;
    type attr = EAttr;
    namespace JSX {
        type Element = dom;
        interface IntrinsicElements extends ElementAttributes, SVGAttributes {
        }
    }
}

interface docObj {
    args?: obj<any>;
    data?: obj<any>;
}
declare class doc<T extends docObj = obj<obj<any>>> extends head {
    path: string;
    data: T["data"];
    args: T["args"];
    importArgs: any[];
    fetch?(): maybePromise<obj<any>>;
    head?(): maybePromise<void>;
    body?(): maybePromise<any>;
}

type ExtraState = Record<string, unknown>;
type HistoryData<S extends ExtraState = ExtraState> = (S & {
    path: string;
}) | null;
type ChangeHandler<S extends ExtraState> = (path: string, state: HistoryData<S>) => void;
declare class PathHistory<S extends ExtraState = ExtraState> {
    private onChange?;
    private popListener?;
    constructor(path?: Stateful<string>, onChange?: ChangeHandler<S>);
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
    private assertClient;
}

interface contentObj {
    args?: obj<any>;
    data?: obj<any>;
}
declare class content<T extends contentObj = obj<obj<string>>> {
    path: string;
    data: T["data"];
    args: T["args"];
    body?(): maybePromise<any>;
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
    setWss(path: string): void;
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
    setError(code: number, _doc: typeof doc<{}>): void;
    getError(code?: number): [TabPath | undefined, Record<string, string>];
}

declare class Router extends htmlHead {
    storage: Stormy;
    protected base: string;
    constructor(base?: string, index?: string);
    route<Q extends typeof doc<{}>>(path: string): (f: Q) => Q;
}

interface mtab {
    tab: string;
}
declare class minElements$1 {
    id: string;
    path: Stateful<string>;
    _root: Stateful<any[]>;
    Main(a: attr): Dom;
    Button(a: attr & mtab, ...ctx: ctx[]): Dom;
}
declare class Tabs extends minElements$1 {
    storage: miniStormy;
    constructor();
    tab<Q extends typeof content<{}>>(path: string): (f: Q) => Q;
    load(tab: string, data?: obj<string>): Promise<void>;
}

interface renderConfig {
    class?: string | string[];
    id?: string;
    data?: any;
    isDev?: boolean;
}
interface _Yvee {
    base?: string;
    index?: string;
    history?: boolean;
}
declare class minElements extends Router {
    protected pushHistory: boolean;
    id: string;
    data: obj<any>;
    path: Stateful<string>;
    protected _root: Stateful<any[]>;
    constructor(base?: string, index?: string, pushHistory?: boolean);
    Main(a: attr): Dom;
    A(a: aAttr, ...ctx: ctx[]): Dom;
}
interface serverRender {
    path: string;
    error?: number;
    data?: Record<string, any>;
}
declare class Yvee extends minElements {
    yvee: Yvee;
    constructor({ base, history, index }?: _Yvee);
    render(x?: renderConfig): Promise<(() => void) | (({ path, data, error }: serverRender) => Promise<string>)>;
    private init;
}
declare const Routes: (fn: (route: Yvee["route"]) => void) => (route: Yvee["route"]) => void;

export { $, IfClient, Meta, PathHistory, QState, Ref, Routes, State, StateHook, Stateful, Tabs, Time, Yvee, __, addCSS, content, cssLoader, doc, dom, frag, log, socket, useRef, websocket };
export type { $E, Elements, _$, aAttr, headAttr, maybePromise, serverRender };

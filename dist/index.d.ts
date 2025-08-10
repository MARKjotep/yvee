declare const isFN: (v: any) => v is Function;
declare const isAsync: (v: any) => v is Function;
declare const isPromise: (v: any) => v is Function;
declare const isNumber: (value: any) => boolean;
declare const isObject: (val: any) => val is Record<string, any>;
declare const isPlainObject: (value: any) => boolean;
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

declare const is_isArr: typeof isArr;
declare const is_isArraybuff: typeof isArraybuff;
declare const is_isAsync: typeof isAsync;
declare const is_isBool: typeof isBool;
declare const is_isClassOrId: typeof isClassOrId;
declare const is_isDefined: typeof isDefined;
declare const is_isFN: typeof isFN;
declare const is_isInt: typeof isInt;
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
  export {
    is_isArr as isArr,
    is_isArraybuff as isArraybuff,
    is_isAsync as isAsync,
    is_isBool as isBool,
    is_isClassOrId as isClassOrId,
    is_isDefined as isDefined,
    is_isFN as isFN,
    is_isInt as isInt,
    is_isNotNull as isNotNull,
    is_isNotWindow as isNotWindow,
    is_isNull as isNull,
    is_isNum as isNum,
    is_isNumber as isNumber,
    is_isObj as isObj,
    is_isObject as isObject,
    is_isPlainObject as isPlainObject,
    is_isPromise as isPromise,
    is_isStr as isStr,
    is_isUndefined as isUndefined,
    is_isWindow as isWindow,
  };
}

type V = string | number | boolean;
type obj$1<T> = Record<string, T>;

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
declare class idm {
    _c: number;
    _id: string;
    constructor(mid?: string);
    get id(): string;
    get mid(): string;
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
    description?: string;
}
declare class head implements headAttr {
    title?: string;
    description?: string;
    base?: base<string>[];
    meta?: meta<string>[] | Meta;
    link?: link<string>[];
    script?: script<string | boolean>[];
    css?: string[] | string;
}
type CSSinT$1 = {
    [P in keyof CSSStyleDeclaration]?: V;
} & {
    [key: string]: V;
};
type headType = Mapper<keyof head, any>;
declare class htmlHead {
    lang: string;
    htmlHead: headType;
    head: (heads?: headAttr) => void;
    constructor();
}
declare const cssLoader: (vv: link<string>) => Promise<unknown> | undefined;
declare function addCSS(selector: string, rules?: CSSinT$1): void;

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
declare class Storage$1<T extends MinStorage> {
    private _storage;
    private CC;
    constructor();
    set(min: T): void;
    get(path: string): [T | undefined, Record<string, string>];
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

declare class CATT {
    xid: string;
    IDM: idm;
    map: Mapper<string, string[]>;
    states: ((id: string) => () => void)[];
    events: Mapper<string, (...arg: any) => any>;
    OZ: OZ;
    constructor(xid: string, IDM?: idm, _OZ?: OZ);
    attr_push(key: string, val: any, pre?: string): void;
    get attr(): string;
    set id(id: string);
    get id(): string | undefined;
}

declare class OZ {
    private events;
    private states;
    private winStates;
    private windowEvents;
    private resetST;
    private resetEV;
    constructor();
    get keys(): string[];
    set(catt: CATT): this;
    push(_OZ: this): this;
    get stage(): this;
    get processWindowEvents(): this;
    reset(id: string[]): this;
    RPS(oz?: this): this;
}

declare class ATTR {
    attr: attr;
    constructor(attr?: attr);
    get(catt: CATT, attr?: attr, pre?: string): void;
    unload<T>(x: string): T | undefined;
}

declare class eStream {
    stream: EventSource;
    url: string;
    constructor(eurl: string, withCredentials: boolean);
    on(event: obj$1<(a: MessageEvent) => void>): this;
}
declare function eventStream(url: string, withCredentials?: boolean): eStream;

declare class __I {
    value: any;
    constructor(value: any);
    get str(): string | null;
    get int(): number | null;
    get float(): number | null;
    get bool(): boolean | null;
    get json(): any | null;
}
type storeValTypes = keyof __I;
declare class storageInterface<T> {
    key: string;
    state: Stateful<T> | null;
    storage: Storage;
    constructor(item: obj$1<Stateful<T>> | string, _type?: "local" | "session", init?: storeValTypes);
    get as(): __I;
    get value(): string | null;
    set set(val: any);
    get remove(): void;
}

/**
 * Local Storage
 */
declare const local: {
    get: <T>(item: obj$1<Stateful<T>> | string) => storageInterface<T>;
    init: <T>(item: obj$1<Stateful<T>>, as: storeValTypes) => storageInterface<T>;
};

/**
 * Session Storage
 */
declare const session: {
    get: <T>(item: obj$1<Stateful<T>> | string) => storageInterface<T>;
};

type kf = KeyframeAnimationOptions;
type KFType = (CSSinT | obj$1<V>)[] | CSSinT | obj$1<V>;
declare class anim {
    private e;
    opt: kf;
    constructor(e: Elem);
    animate(keyframes: CSSinT[] | CSSinT, options?: kf): Elem<HTMLElement>;
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
        set: (style: CSSinT | obj$1<V | null>, delayOrFN?: number | ((e?: any) => void)) => Elem<HTMLElement>;
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

declare class doc<T extends {
    args?: Record<string, any>;
    data?: Record<string, any>;
} = Record<string, any>> extends head {
    path: string;
    args: T["args"];
    id: string;
    status: number;
    lang?: string;
    import?: any;
    _data: T["data"];
    static route: string;
    constructor(path: string, args: T["args"] | undefined, id: string, status?: number);
    fetch?(): Promise<Record<string, any>>;
    head?(): Promise<void> | void;
    body?(): Promise<Dom> | Dom;
    loader(): Promise<any[]>;
    getHeadAttr(head?: headAttr, ...toMap: headType[]): headType;
    set data(data: obj$1<any>);
    get data(): T["data"];
}

declare class websocket<T = Record<string, any>> {
    path: string;
    protected args: T;
    ws: WebSocket;
    static route: string;
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
    protected yvee: Pager;
    constructor(yvee: Pager);
    load(_path: string): Promise<websocket<{}> | undefined>;
    unload(_path: string): void;
}

declare class Pager extends minClient {
    protected config: routerCfg;
    protected hook?: () => void;
    protected root: Stateful<ctx[]>;
    socket: socket;
    id: string;
    path: Stateful<string>;
    lastPath: Stateful<string>;
    loading: Stateful<boolean>;
    mainElement?: HTMLElement;
    A: (a: attr & {
        href: string;
        topRef?: Stateful<_$>;
        top?: number | (() => number);
    }, ...D: ctx[]) => Dom;
    Main: (a: attr) => Dom;
    load: (path?: string, data?: obj<string>) => Promise<this>;
    matchPath: (str: string) => boolean;
    protected isYvee: boolean;
    constructor(config?: routerCfg, events?: events);
    protected hooker(): void;
    protected class(this: Pager, _path: string, _error: number, isError?: boolean): Promise<doc<{}>>;
    protected fetch(CL?: doc<{}>): Promise<void>;
    protected processHead(CL?: doc<{}>, head?: headAttr): Promise<headType>;
    private processClassHead;
    private processDefaultHead;
    render(_path: string, _error?: number, data?: obj<string>, head?: headAttr, isClient?: boolean, isError?: boolean): Promise<{
        lang: string;
        heads: headType;
        done: boolean;
    }>;
}

declare function pushHistory(path?: string, title?: string): void;

interface routerCfg {
    classes?: string | string[];
    id?: string;
    base?: string;
}
interface yveeCfg extends routerCfg {
    pushState?: boolean;
}
declare class Yvee extends Pager {
    protected config: yveeCfg;
    protected isYvee: boolean;
    protected unload: boolean;
    constructor(config?: yveeCfg, events?: events);
}
declare const Routes: (fn: (Yvee: Yvee) => void) => (Yvee: Yvee) => void;
interface headAttrPlus {
    route?: string;
    base?: string;
    index?: string;
    id?: string;
    bodyattr?: obj$1<V>;
    data?: Record<string, any> | (() => Promise<Record<string, any>> | Record<string, any>);
}
type headFN<T = Record<string, any>> = (a: renderConfig & T) => Promise<headAttr> | headAttr;
type ND<T = Record<string, any>> = (a: renderConfig & T) => Dom | Promise<Dom>;
declare function Render<T = Record<string, any>>(DOM: ND<T>, head?: headAttr | headFN<T>, cfg?: headAttrPlus): Promise<({ path, data, status }: serverRender) => Promise<string>>;
declare function Render<T = Record<string, any>>(DOM: ND<T>, App: Yvee): Promise<({ path, data, status }: serverRender) => Promise<string>>;

declare class ClientPath extends MinStorage {
    id: string;
    cls: typeof doc<{}>;
    constructor(path: string, id: string, cls: typeof doc<{}>);
}
declare class SocketPath extends MinStorage {
    id: string;
    cls: typeof websocket<{}>;
    constructor(path: string, id: string, cls: typeof websocket<{}>);
}
declare class minClient extends htmlHead {
    protected storage: Storage$1<ClientPath>;
    protected errorStorage: Storage$1<ClientPath>;
    protected wssStorage: Storage$1<SocketPath>;
    /** --------------------
     * string | int | float | file | uuid
     * - /url/\<string:hell>
     */
    route: (path: string) => <Q extends typeof doc<{}>>(f: Q) => Q;
    error: (...codes: number[]) => <Q extends typeof doc<{}>>(f: Q) => Q;
    wss: (path: string) => <Q extends typeof websocket<{}>>(f: Q) => Q;
    base: string;
    constructor(base?: string);
    protected _base(str: string): string;
    protected getPath(path: string): Promise<[ClientPath | undefined, Record<string, string>]>;
    protected loadError(code: number): Promise<[ClientPath | undefined, Record<string, string>]>;
    protected loadWSS(path: string): Promise<[SocketPath | undefined, Record<string, string>]>;
}

type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | SVGElementTagNameMap[keyof SVGElementTagNameMap];

type hookFN<T extends any[]> = (...args: statefulValue<T>) => void;
interface stateCFG {
    id?: string;
    init?: boolean;
}
declare function StateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: Stateful<T[K]>;
}], { id, init }?: stateCFG): () => void;

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

type X2 = V | V[];
type X3 = X2 | Stateful<X2> | null | undefined;
type CSSinT = {
    [P in keyof CSSStyleDeclaration]?: X3;
} & {
    [key: string]: X3;
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
type XU4 = V | undefined | XU4[];
interface baseAttr {
    style?: CSSinT | string;
    on?: events<any>;
    id?: string;
    class?: XU4 | Stateful<X2>;
    ref?: Ref<any>;
}
declare class Dom {
    tag: string;
    attr: ATTR;
    private ctx;
    constructor(tag: string, attr?: attr, ...ctx: ctx[]);
    __(pid?: idm): {
        ctx: string;
        oz: OZ;
        id: string | undefined;
    };
}
declare function dom(tag: string | ((attr: attr, ...ctx: ctx[]) => Dom), attr?: attr | null, ...ctx: ctx[]): Dom;
declare const frag: (attr: attr, ...dom: Dom[]) => Dom[];

declare global {
    type events<T extends Elements = HTMLElement> = {
        [P in keyof GlobalEventHandlersEventMap]?: (this: T, e: GlobalEventHandlersEventMap[P]) => void;
    } & c_events<T>;
    type attr = baseAttr | obj<X3>;
    type ctx = V | Dom | Stateful<V | Dom> | ctx[];
    type obj<T> = Record<string, T>;
    type dom = Dom;
    type DomFN<T = {}> = (a: attr & T, ...D: ctx[]) => Dom;
    const BASE_STRING: string;
    namespace JSX {
        type Element = Dom;
        interface IntrinsicElements {
            link: attr;
            base: attr;
            meta: attr;
            p: attr;
            br: attr;
            hr: attr;
            h: attr;
            cmnt: attr;
            root: attr;
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
            noscript: attr;
            object: attr;
            param: attr;
            script: attr;
            a: attr;
            nav: attr;
            style: attr;
            audio: attr;
            video: attr;
            source: attr;
            track: attr;
            img: attr;
            map: attr;
            area: attr;
            canvas: attr;
            figcaption: attr;
            figure: attr;
            picture: attr;
            iframe: attr;
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
declare const resolvePath: (base: string, relative: string) => string;
interface renderConfig {
    path: string;
    status: number;
    base: string;
}
interface serverRender {
    path: string;
    data?: Record<string, any>;
    status?: number;
}
declare const IfClient: <T>(fn: () => T) => T | undefined;

export { $, Dom, IfClient, Meta, Pager, QState, Ref, Render, Routes, State, StateHook, Stateful, Time, Yvee, __, addCSS, cssLoader, doc, dom, eventStream, frag, local, log, pushHistory, resolvePath, session, useRef, websocket };
export type { $E, Elements, _$, headAttr, renderConfig, serverRender };

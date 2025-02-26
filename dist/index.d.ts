type V = string | number | boolean;
type obj<T> = Record<string, T>;

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

declare class $$ {
    static set p(a: any);
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
    and(metas: meta$1<string>[]): this;
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
    imports?: obj<string>;
    scopes?: obj<string>;
    integrity?: obj<string>;
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
    protected htmlHead: headType;
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
    set(min: T): void;
    get(path: string): [T | undefined, Record<string, string>];
}

declare class __ {
    static rand(min?: number, max?: number): number;
    static fill(count: number, fill?: any): any[];
    static new({ dom, id, inner, }: {
        dom: keyof HTMLElementTagNameMap;
        id?: string;
        inner?: any;
    }): HTMLElement;
    static randFrom(arr: any[] | Object): any;
    static makeID: (length: number) => string;
    static reClass: (a: obj<any>, classes: string[]) => any[];
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

declare class eStream {
    stream: EventSource;
    url: string;
    constructor(eurl: string, withCredentials: boolean);
    on(event: obj<(a: MessageEvent) => void>): this;
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
declare class storageInterface {
    key: string;
    func: (() => any) | null;
    storage: Storage;
    constructor(item: obj<() => any> | string, _type?: "local" | "session");
    get as(): __I;
    get value(): string | null;
    get save(): void;
    set set(val: any);
    get remove(): void;
}

/**
 * Local Storage
 */
declare const local: {
    get: (item: obj<() => any> | string) => storageInterface;
};

/**
 * Session Storage
 */
declare const session: {
    get: (item: obj<() => any> | string) => storageInterface;
};

declare class doc<T = Record<string, string>> extends head {
    path: string;
    args: T;
    id: string;
    status: number;
    lang?: string;
    import?: any;
    _data: T;
    constructor(path: string, args: T | undefined, id: string, status?: number);
    fetch?(): Promise<Record<string, string>>;
    head?(): Promise<void> | void;
    body?(): Promise<Dom> | Dom;
    loader(): Promise<any[]>;
    getHeadAttr(head?: headAttr, ...toMap: headType[]): headType;
    set data(data: obj<any>);
    get data(): T;
}

declare class websocket<T = Record<string, string>> {
    path: string;
    args: T;
    ws: WebSocket;
    isConnected: Stateful<boolean>;
    data: T;
    constructor(path: string, args?: T);
    open(event: Event): Promise<void> | void;
    message(event: MessageEvent): Promise<void> | void;
    close(event: CloseEvent): Promise<void> | void;
    error(event: Event): Promise<void> | void;
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
    private yra;
    constructor(yra: Router);
    load(_path: string): Promise<websocket<{}> | undefined>;
    unload(_path: string): void;
}

interface yveeCfg {
    pushState?: boolean;
    classes?: string | string[];
}
declare class Router extends minClient {
    private isYRA;
    protected unload: boolean;
    protected hook?: () => void;
    protected root: Stateful<ctx[]>;
    protected socket: socket;
    id: string;
    path: Stateful<string>;
    A: (a: attr & {
        href: string;
    }, ...D: ctx[]) => Dom;
    Main: (a: attr & {
        load?: string;
    }) => Dom;
    load: (path?: string, data?: obj<string>) => Promise<this>;
    constructor(ImportMeta: ImportMeta, config?: yveeCfg, isYRA?: boolean);
    protected hooker(): void;
    protected class(this: Router, _path: string, _error: number, isError?: boolean): Promise<doc<{}>>;
    protected fetch(CL?: doc<{}>): Promise<void>;
    protected processHead(CL?: doc<{}>, head?: headAttr): Promise<headType>;
    private processClassHead;
    private processDefaultHead;
    protected render(_path: string, _error?: number, data?: obj<string>, head?: headAttr, isClient?: boolean, isError?: boolean): Promise<{
        lang: string;
        heads: headType;
        done: boolean;
    }>;
}
declare class Yvee extends Router {
    protected unload: boolean;
    constructor(ImportMeta: ImportMeta, { classes, pushState }?: yveeCfg);
    html({ path, data, status, attr, }: {
        path: string;
        data?: Record<string, string>;
        status?: number;
        attr?: string;
    }): Promise<string>;
}
type RouteType = (path: string) => <Q extends typeof doc<{}>>(f: Q) => Q;
declare const Routes: (fn: (route: RouteType) => void) => (route: RouteType) => void;
type ErrorType = (...codes: number[]) => <Q extends typeof doc<{}>>(f: Q) => Q;
declare const Errors: (fn: (error: ErrorType) => void) => (error: ErrorType) => void;

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
    protected ImportMeta: ImportMeta;
    protected config: yveeCfg;
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
    constructor(ImportMeta: ImportMeta, config: yveeCfg);
    protected getPath(path: string): Promise<[ClientPath | undefined, Record<string, string>]>;
    protected loadError(code: number): Promise<[ClientPath | undefined, Record<string, string>]>;
    protected loadWSS(path: string): Promise<[SocketPath | undefined, Record<string, string>]>;
}

type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap];

type hookFN<T extends any[]> = (...args: statefulValue<T>) => void;
interface stateCFG {
    id?: string;
    init?: boolean;
}
declare function stateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: Stateful<T[K]>;
}], { id, init }?: stateCFG): () => void;

type statefulValue<T extends any[]> = {
    [K in keyof T]: T[K] extends Stateful<infer U> ? U : T[K];
};
declare class Stateful<T> extends EventTarget {
    private options?;
    private hooks;
    private states;
    private _value;
    private listening;
    private end?;
    constructor(value: T, options?: AddEventListenerOptions | undefined);
    get value(): T;
    set value(newValue: T);
    get listen(): () => void;
    call<Q>(callback: (this: Elements, arg: T) => Q, entry: string): (id: string) => () => void;
    hook<T extends any[]>(callback: hookFN<T>): (id: string) => () => void;
}
declare function State<T>(value: T): Stateful<T>;

type X2 = V | V[];
type X3 = X2 | Stateful<X2>;
type CSSinT = {
    [P in keyof CSSStyleDeclaration]?: X3;
} & {
    [key: string]: X3;
};
interface c_events {
    watch?: (this: Elements, e: Elements) => [(...args: any[]) => void, Stateful<any> | Stateful<any>[], boolean?];
    ready?: (this: Elements, e: Elements) => void;
    resize?: (this: Elements, e: UIEvent) => void;
    beforeunload?: (this: Elements, e: BeforeUnloadEvent) => void;
    popstate?: (this: Elements, e: PopStateEvent) => void;
    winscroll?: (this: Elements, e: Event) => void;
    winload?: (this: Elements, e: Event) => void;
    winfocus?: (this: Elements, e: Event) => void;
    winblur?: (this: Elements, e: Event) => void;
}
interface baseAttr {
    style?: CSSinT;
    on?: events;
    id?: string;
    class?: X3;
}
declare class Dom {
    tag: string;
    private attr;
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

type kf = KeyframeAnimationOptions;
type KFType = (CSSinT | obj<V>)[] | CSSinT | obj<V>;
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

declare class Eget<T extends TElem = HTMLElement> {
    e: T;
    query?: string | undefined;
    constructor(e: T, query?: string | undefined);
    get a(): anim;
    get all(): T[];
    get attr(): {
        has: (attr: string) => boolean;
        get: (attr: string) => string | null;
        del: (attr: string) => Eget;
        set: (attrs: obj<any>) => Eget;
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
    get path(): string;
    get rect(): DOMRect;
    get remove_element(): this;
    get style(): {
        set: (style: CSSinT | obj<V | null>, delayOrFN?: number | ((e?: any) => void)) => Elem<HTMLElement>;
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

type TElem = HTMLElement & InstanceType<typeof Element>;
type fn<E, T> = (e?: E) => T;
declare class Elem<T extends TElem = HTMLElement> extends Eget {
    constructor(e: T, query?: string);
    add(...className: string[]): this;
    remove(...className: string[]): this;
    toggle(className: string | fn<any, string>, force?: boolean): this;
    has(e: any | null): boolean;
    insert(position: InsertPosition): {
        HTML: (...text: string[]) => Elem;
        element: (...elem: HTMLElement[]) => Elem;
        text: (this: Elem, ...text: string[]) => Elem;
    };
    is(tp: {
        dom?: string;
        class?: string | string[];
    }): boolean;
    on(event: keyof events, handler: (e?: any) => void, useCapture?: boolean): this;
    remove_on(event: keyof DocumentEventMap, handler: EventListenerOrEventListenerObject, useCapture?: boolean): this;
    timed(fn: (ee?: Elem) => void, timeout?: number): this;
    animate(keyframes: KFType, options?: kf, onComplete?: fn<any, void>): this;
    animate(keyframes: KFType, onComplete?: fn<any, void>): this;
}

declare function $<T extends TElem = HTMLElement>(query: string): Elem<T> | undefined;
declare function $<T extends TElem = HTMLElement>(element: T): Elem<T>;
type _$ = Elem | undefined;

declare class ColorScheme {
    state: Stateful<boolean>;
    body?: HTMLElement;
    click: () => void;
    constructor({ toggle, initialState, }?: {
        toggle?: string[];
        initialState?: boolean;
    });
    private loader;
    get isMatchMediaSupported(): boolean;
    get isDark(): boolean;
    toggle(clist: DOMTokenList, isDark: boolean, toggles: string[]): void;
}

declare global {
    type events = {
        [P in keyof GlobalEventHandlersEventMap]?: (this: Elements, e: GlobalEventHandlersEventMap[P]) => void;
    } & c_events;
    type attr = baseAttr | obj<X3>;
    type ctx = V | Dom | Stateful<V | Dom> | ctx[];
    type obj<T> = Record<string, T>;
    type DomFN<T extends {}> = (a: attr & T, ...D: ctx[]) => Dom;
    namespace JSX {
        type Element = Dom;
        interface IntrinsicElements {
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

export { $, $$, ColorScheme, Dom, Errors, Meta, Router, Routes, State, Stateful, Yvee, type _$, __, addCSS, cssLoader, doc, dom, eventStream, frag, type headAttr, local, resolvePath, session, stateHook, websocket };

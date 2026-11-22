/// <reference path="./assets.d.ts" />
type V$1 = string | number | boolean;
type CSSStyle$1 = Record<string, V$1 | null | undefined | {
    readonly value: unknown;
}>;

type kf = KeyframeAnimationOptions;
type KFType = (CSSStyle$1 | Record<string, V$1>)[] | CSSStyle$1 | Record<string, V$1>;
declare class anim {
    private e;
    opt: kf;
    constructor(e: Elem);
    animate(keyframes: CSSStyle$1[] | CSSStyle$1, options?: kf): Animation;
    get slide(): {
        left: (options?: kf) => anim;
        right: (options?: kf) => anim;
        up: (options?: kf) => anim;
        down: (options?: kf) => anim;
    };
    fade(options?: kf): this;
    shake(XorY?: "X" | "Y", opt?: kf): this;
    color(c?: string | string[], opt?: kf): this;
    bg(c?: string | string[], opt?: kf): this;
    bounce(sVal?: number, opt?: kf): this;
}

declare class Eget<T extends Elements = HTMLElement> {
    e: T;
    protected _query?: string | undefined;
    constructor(e: T, _query?: string | undefined);
    get a(): anim;
    get all(): T[];
    get attr(): {
        has: (attr: string) => boolean;
        get: (attr: string) => string | null;
        del: (attr: string) => Eget<T>;
        set: (attrs: Record<string, unknown>) => Eget<T>;
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
        set: (style: CSSStyle$1 | Record<string, V$1 | null | undefined>, delayOrFN?: number | ((e?: any) => void)) => Elem<T>;
        get: (prop: keyof CSSStyleDeclaration | string) => string;
        del: (...props: (keyof CSSStyleDeclaration | string)[]) => Elem<T>;
    };
    get submit(): boolean;
    get tag(): string;
    get value(): any;
    get unload(): () => void;
    private updateContent;
    set append(val: any);
    set appendfirst(val: any);
    set inner(val: any);
    set disabled(vl: boolean);
    set id(did: string);
    set value(vl: any);
}

type fn<E, T> = (e?: E) => T;
type ElementEventName = keyof GlobalEventHandlersEventMap | "state" | "states" | "ready" | "beforeunload" | "popstate" | "DOMContentLoaded" | "winscroll" | "winload" | "winfocus" | "winblur" | "winkeydown" | "winkeypress" | "winkeyup";
declare class Elem<T extends Elements = HTMLElement> extends Eget<T> {
    add(...className: string[]): () => void;
    remove(...className: string[]): this;
    toggle(className: string | fn<any, string>, force?: boolean): boolean;
    /**
     * Boolean toggle
     * @param className
     * @param force
     * @returns
     */
    toggled(bool: boolean, className: string): this;
    clear(): this;
    hasNode(e: Node): boolean;
    has(...classes: string[]): boolean;
    insert(position: InsertPosition): {
        /** Trusted application-authored HTML only. Use text or rendered content for data. */
        HTML: (...text: string[]) => Elem<T>;
        element: (...elem: Element[]) => Elem<T>;
        text: (...text: string[]) => Elem<T>;
    };
    is(tp: {
        dom?: string;
        class?: string | string[];
    }): boolean;
    on(event: ElementEventName, handler: (e?: any) => void, useCapture?: boolean): this;
    remove_on(event: keyof DocumentEventMap, handler: EventListenerOrEventListenerObject, useCapture?: boolean): this;
    timed(fn: (ee?: Elem<T>) => void, timeout?: number): this;
    animate(keyframes: KFType, options?: kf, onComplete?: fn<any, void>): this;
    animate(keyframes: KFType, onComplete?: fn<any, void>): this;
    query(query: string): T | null;
    queryAll(query: string): T[];
    newChild<P>(element: keyof HTMLElementTagNameMap, props?: Record<string, P>): Elem<HTMLElement | HTMLObjectElement | HTMLMapElement | HTMLDataElement | HTMLScriptElement | HTMLStyleElement | HTMLHtmlElement | HTMLAnchorElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataListElement | HTMLModElement | HTMLDetailsElement | HTMLDialogElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFormElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLPictureElement | HTMLPreElement | HTMLProgressElement | HTMLSelectElement | HTMLSlotElement | HTMLSourceElement | HTMLSpanElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement>;
    newChildNS<P>(element: keyof SVGElementTagNameMap, props?: Record<string, P>): Elem<SVGSymbolElement | SVGFilterElement | SVGScriptElement | SVGStyleElement | SVGAElement | SVGTitleElement | SVGAnimateElement | SVGAnimateMotionElement | SVGAnimateTransformElement | SVGCircleElement | SVGClipPathElement | SVGDefsElement | SVGDescElement | SVGEllipseElement | SVGFEBlendElement | SVGFEColorMatrixElement | SVGFEComponentTransferElement | SVGFECompositeElement | SVGFEConvolveMatrixElement | SVGFEDiffuseLightingElement | SVGFEDisplacementMapElement | SVGFEDistantLightElement | SVGFEDropShadowElement | SVGFEFloodElement | SVGFEFuncAElement | SVGFEFuncBElement | SVGFEFuncGElement | SVGFEFuncRElement | SVGFEGaussianBlurElement | SVGFEImageElement | SVGFEMergeElement | SVGFEMergeNodeElement | SVGFEMorphologyElement | SVGFEOffsetElement | SVGFEPointLightElement | SVGFESpecularLightingElement | SVGFESpotLightElement | SVGFETileElement | SVGFETurbulenceElement | SVGForeignObjectElement | SVGGElement | SVGImageElement | SVGLineElement | SVGLinearGradientElement | SVGMarkerElement | SVGMaskElement | SVGMetadataElement | SVGMPathElement | SVGPathElement | SVGPatternElement | SVGPolygonElement | SVGPolylineElement | SVGRadialGradientElement | SVGRectElement | SVGSetElement | SVGStopElement | SVGSVGElement | SVGSwitchElement | SVGTextElement | SVGTextPathElement | SVGTSpanElement | SVGUseElement | SVGViewElement>;
    get<K extends keyof T>(property: K): T[K];
    get(property: string): unknown;
}

type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | SVGElementTagNameMap[keyof SVGElementTagNameMap];
type TagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
declare const getElementById: (key: string) => Elements | undefined;
declare function IDNotConnected(): string[];
interface CLI {
    id?: string;
    class?: string;
}
declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: CLI, parent?: P): Elem<T> | undefined;
declare function $<T extends Elements = HTMLElement, P extends Elements = HTMLElement>(query: string, parent?: P): Elem<T> | undefined;
declare function $<T extends Elements = HTMLElement>(element: T): Elem<T>;
type _$<T extends Elements = HTMLElement> = Elem<T> | undefined;
type $_<T extends Elements = HTMLElement> = Elem<T>;

/** Selects one of two values using a boolean condition. */
declare function Toggled<T>(bool: boolean, value: T): T | undefined;
declare function Toggled<T, U>(bool: boolean, value: T, otherwise: U): T | U;

interface RenderedContent {
    html: string;
    commit?: () => void | Promise<void>;
}
type ContentRenderer = (value: unknown, parentId?: string) => RenderedContent | Promise<RenderedContent>;
declare const setContentRenderer: (next: ContentRenderer) => () => void;
declare const renderContent: (value: unknown, parentId?: string) => Promise<RenderedContent>;

/** Holds a mutable value and emits an `updated` event when it changes. */
declare class RefState<T> extends EventTarget {
    private current;
    constructor(current: T);
    get value(): T;
    get clone(): T;
    set value(value: T);
}
declare class Ref<T extends Element = HTMLElement> {
    readonly state: RefState<T | undefined>;
    get element(): T | undefined;
    set element(element: T | undefined);
    get $(): T | undefined;
}
declare const useRef: <T extends Element = HTMLElement>() => Ref<T>;

/** Synchronous, nestable batching. Values change immediately; subscribers see the final values. */
declare function batch<T>(callback: () => T): T;

type Equality<T> = (previous: T, next: T) => boolean;
/** Compares own enumerable keys of records/arrays, using Object.is for values. */
declare function shallowEqual<T>(previous: T, next: T): boolean;

type Cleanup = () => void;
type Disposable = {
    dispose(): void;
} | {
    close(): void;
};
/** Synchronous resource ownership. Disposal is idempotent and attempts every cleanup. */
declare class DisposalScope {
    private readonly controller;
    private readonly cleanups;
    get signal(): AbortSignal;
    get disposed(): boolean;
    defer(cleanup: Cleanup): Cleanup;
    own<T extends Disposable>(resource: T): T;
    listen(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Cleanup;
    timeout(callback: () => void, ms: number): Cleanup;
    dispose(): void;
}

type V = string | number | boolean;
type maybePromise<T> = T | Promise<T>;
declare class Mapper<K, V> extends Map<K, V> {
    obj(value?: object | null): this;
    init(key: K, value: V): V;
}

type hookFN<T extends any[]> = (...args: statefulValue<T>) => maybePromise<void>;
interface StateHookOptions {
    id?: string;
    init?: boolean;
    signal?: AbortSignal;
    scope?: DisposalScope;
}
declare function StateHook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], { id, init, signal, scope }?: StateHookOptions): Promise<() => void>;
declare function StateLoaded<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], { id, init, signal, scope }?: StateHookOptions): Promise<() => void>;
declare function hook<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], init?: boolean): [hookFN<T>, [...{
    [K in keyof T]: IStateful<T[K]>;
}], boolean, boolean];
declare function loaded<T extends any[]>(callback: hookFN<T>, statefuls: [...{
    [K in keyof T]: IStateful<T[K]>;
}], init?: boolean): [hookFN<T>, [...{
    [K in keyof T]: IStateful<T[K]>;
}], boolean, boolean];
/** Cooperative async effects: a newer update or disposal aborts the previous context. */
declare function StateEffect<T extends any[]>(callback: (update: StateUpdate, ...values: statefulValue<T>) => maybePromise<void>, states: [...{
    [K in keyof T]: IStateful<T[K]>;
}], options?: StateHookOptions): Promise<() => void>;

interface StateOptions<T> extends AddEventListenerOptions {
    /** false emits on every assignment; otherwise true means unchanged. */
    equals?: Equality<T> | false;
    /** Errors are also retained until flush() observes them. */
    onError?: (error: unknown) => void;
}

type statefulValue<T extends any[]> = {
    [K in keyof T]: T[K] extends IStateful<infer U> ? U : T[K];
};
interface StateUpdate {
    readonly signal: AbortSignal;
    isCurrent(): boolean;
}
declare class Stateful<T> extends EventTarget {
    private options;
    private hooks;
    private loads;
    private states;
    protected _value: T;
    private listening;
    private controller;
    private readonly pending;
    private readonly failures;
    private readonly emit;
    private end?;
    constructor(value: T, options?: StateOptions<T>);
    get value(): T;
    get clone(): T;
    set value(newValue: T);
    /** Wait for current framework hooks, DOM bindings and loaded hooks; reject observed errors once. */
    flush(): Promise<void>;
    private report;
    private update;
    listen(): () => void;
    private stopListeningWhenUnused;
    call<Q>(callback: (this: Elements, arg: T, update: StateUpdate) => Q, entry: string): (id: string) => Promise<() => void>;
    hook(callback: (update: StateUpdate) => unknown): (id: string) => Promise<() => void>;
    loaded<T extends any[]>(callback: hookFN<T>): (id: string) => () => void;
    protected dispatch(): void;
}
declare class SetStateful<T extends unknown> extends Stateful<Set<T>> {
    constructor(vals: T[], options?: AddEventListenerOptions);
    add(val: T): void;
    delete(val: T): void;
    has(val: T): boolean;
    clear(): void;
}
declare class RecStateful<T extends {}> extends Stateful<T> {
    constructor(val: T, options?: AddEventListenerOptions);
    set<X extends keyof T>(t: X, value: T[X]): void;
    delete(t: keyof T): void;
    entries(): [string, unknown][];
}
type IRecStateful<T extends {}> = IStateful<T> & {
    set: RecStateful<T>["set"];
    delete: RecStateful<T>["delete"];
    entries: RecStateful<T>["entries"];
};
type ISetStateful<T extends unknown> = IStateful<Set<T>> & {
    add: SetStateful<T>["add"];
    delete: SetStateful<T>["delete"];
    has: SetStateful<T>["has"];
    clear: SetStateful<T>["clear"];
};
type IStateful<T> = {
    value: Stateful<T>["value"];
    clone: Stateful<T>["clone"];
    flush: Stateful<T>["flush"];
};
declare function State<T>(value: T, options?: StateOptions<T>): IStateful<T>;
declare function SetState<T extends unknown>(value: T[], options?: AddEventListenerOptions): ISetStateful<T>;
declare function RecState<T extends {}>(value: T, options?: AddEventListenerOptions): IRecStateful<T>;
/**
 * @deprecated Prefer State(value, { equals: false }).
 * Legacy convenience: by default emit on every assignment. Prefer State with equals: false.
 */
declare function QState<T>(value: T, verify?: boolean): IStateful<T>;

type ScopeConfig = Record<string, object>;

interface ScopeSet<C extends ScopeConfig> {
    use<Name extends keyof C & string>(name: Name): C[Name];
}
/** Shared named objects, exposed through the static register/use interface. */
declare class _Scope {
    private constructor();
    /** An independent container. It never publishes values to global Scope/Field. */
    static create<C extends ScopeConfig>(config: C): ScopeSet<C>;
    static register<C extends ScopeConfig>(config: C): ScopeSet<C>;
    /** Prefer the typed handle returned by register when it is available. */
    static use<TValue extends object>(name: string): TValue;
}
/** Describes the static interface of the Scope class. */
interface ScopeStatic {
    create<C extends ScopeConfig>(config: C): ScopeSet<C>;
    register<Config extends Record<string, Record<string, any>>>(data: Config): ScopeSet<Config>;
    use<T extends Record<string, any>>(name: string): T;
}
type Scope = _Scope;
declare const Scope: ScopeStatic;

type ScopeDecorator<V> = <This>(value: undefined, context: ClassFieldDecoratorContext<This, V>) => (this: This, initialValue: V) => V;
type ScopeProxy<T extends object> = {
    readonly [K in keyof T]: ScopeDecorator<T[K]>;
};
interface FieldScopeSet<C extends ScopeConfig> {
    use<Name extends keyof C & string>(name: Name): ScopeProxy<C[Name]>;
}
/** Standard class-field decorators backed by the same registry as Scope. */
declare class _FieldScope {
    static register<C extends ScopeConfig>(config: C): FieldScopeSet<C>;
    static use<T extends object>(name: string): ScopeProxy<T>;
}
/**
 * Describes the static interface of the Field class
 */
interface FieldScopeStatic {
    register<Config extends Record<string, Record<string, any>>>(data: Config): FieldScopeSet<Config>;
    use<T extends Record<string, any>>(name: string): ScopeProxy<T>;
}
type Field = _FieldScope;
declare const Field: FieldScopeStatic;

declare class Stored<T extends Record<PropertyKey, unknown>> {
    private readonly state;
    private readonly dev;
    constructor(initial: T, options?: {
        dev?: boolean;
    });
    get __(): T;
    bind(values: Partial<T>): void;
    set<K extends keyof T, P extends keyof T[K]>(key: K, prop: P, value: T[K][P]): void;
    fn<R>(fn: (state: T) => R): () => R;
    safe<K extends keyof T>(key: K): NonNullable<T[K]>;
}

type successStatus<T extends Record<string, unknown> = {}> = {
    success: boolean;
    data: T;
    message?: string;
};
type errorStatus = {
    success: boolean;
    error: {
        message: string;
        code: string;
    } & Record<string, unknown>;
};

type EventHandler = (event: MessageEvent) => void;
type EventMap = Record<string, EventHandler>;
declare class EventStream {
    readonly url: string;
    readonly stream: EventSource;
    private readonly handlers;
    private closed;
    constructor(url: string, withCredentials?: boolean);
    on(events: EventMap): this;
    off(eventName?: string, handler?: EventHandler): this;
    close(): void;
}
/** @deprecated Prefer dedicated eventStreams(); retain EventStream when sharing a connection intentionally. */
declare function eventStream(url: string, withCredentials?: boolean): EventStream;

type ColumnType = "text" | "integer" | "number" | "boolean" | "date" | "json";
/** Validation and index metadata; IndexedDB itself is schemaless. */
declare class Column {
    readonly type: ColumnType;
    primaryKey: boolean;
    required: boolean;
    isUnique: boolean;
    indexed: boolean;
    autoIncrement: boolean;
    hasDefault: boolean;
    private defaultValue;
    constructor(type: ColumnType);
    get primary(): this;
    get notNull(): this;
    get index(): this;
    get unique(): this;
    get defaultNow(): this;
    default(value: unknown | (() => unknown)): this;
    value(): unknown;
    validate(name: string, value: unknown): void;
}
declare const t: {
    text: () => Column;
    int: () => Column;
    number: () => Column;
    boolean: () => Column;
    timestamp: () => Column;
    json: () => Column;
    serial: () => Column;
};

declare class Schema<T extends object> {
    readonly table: string;
    private readonly definitions;
    readonly keyPath: string;
    readonly autoIncrement: boolean;
    constructor(table: string, definitions: Record<keyof T, Column>);
    entries(): Array<[string, Column]>;
    prepare(input: Partial<T>): T;
    /** Call only within an IndexedDB versionchange transaction. */
    upgrade(db: IDBDatabase, transaction: IDBTransaction): void;
}

declare class DbRepository<T extends object> {
    private readonly db;
    readonly schema: Schema<T>;
    constructor(db: IDBDatabase, schema: Schema<T>);
    insert(input: Partial<T>): Promise<IDBValidKey>;
    /** Replaces the whole record, or inserts it when its key does not exist. */
    put(input: Partial<T>): Promise<IDBValidKey>;
    find(key: IDBValidKey): Promise<T | undefined>;
    findAll(query?: IDBValidKey | IDBKeyRange, limit?: number): Promise<T[]>;
    findByIndex(name: keyof T & string, query?: IDBValidKey | IDBKeyRange, limit?: number): Promise<T[]>;
    private readAll;
    /** Reads and patches the record in the same atomic transaction. */
    update(key: IDBValidKey, changes: Partial<T>): Promise<T | undefined>;
    count(query?: IDBValidKey | IDBKeyRange): Promise<number>;
    delete(key: IDBValidKey | IDBKeyRange): Promise<void>;
    clear(): Promise<void>;
}

type StoreSchema = Pick<Schema<object>, "table" | "keyPath" | "autoIncrement" | "entries" | "upgrade">;
interface OpenOptions {
    /** Useful for tests or a worker-specific factory. Defaults to globalThis.indexedDB. */
    factory?: IDBFactory;
    /** Ask other tabs to close their connections. The open request remains pending. */
    onBlocked?: (event: IDBVersionChangeEvent) => void;
    /** Runs after declared stores/indexes are created. Queue IDB requests synchronously. */
    upgrade?: (db: IDBDatabase, transaction: IDBTransaction, oldVersion: number, newVersion: number) => void;
}
declare class IndexedDatabase {
    readonly connection: IDBDatabase;
    private readonly schemas;
    private constructor();
    static open(name: string, version: number, schemas: readonly StoreSchema[], options?: OpenOptions): Promise<IndexedDatabase>;
    repository<T extends object>(schema: Schema<T>): DbRepository<T>;
    close(): void;
}

type DerivedValue<T> = Readonly<IStateful<T>> & {
    dispose(): void;
};
interface DerivedOptions<T> extends StateOptions<T> {
    scope?: DisposalScope;
}
/** Explicit dependencies; await installation before changing inputs. Calculations are synchronous. */
declare function Derived<T extends unknown[], R>(states: [...{
    [K in keyof T]: IStateful<T[K]>;
}], compute: (...values: T) => R extends PromiseLike<unknown> ? never : R, options?: DerivedOptions<R>): Promise<DerivedValue<R>>;

type DVal<T = V | V[]> = T | IStateful<T> | undefined;

type CSSStyleProperty = {
    [P in keyof CSSStyleDeclaration]: CSSStyleDeclaration[P] extends (...args: any[]) => any ? never : P;
}[keyof CSSStyleDeclaration];
type CSSStyle = {
    [P in CSSStyleProperty]?: DVal;
} & {
    [key: `--${string}`]: DVal;
};

interface c_events<T extends Elements = HTMLElement> {
    state?: (this: T, e: T) => maybePromise<[
        (...args: any[]) => void,
        IStateful<any>[],
        boolean?,
        boolean?
    ]>;
    states?: (this: T, e: T) => maybePromise<[
        (...args: any[]) => void,
        IStateful<any>[],
        boolean?,
        boolean?
    ]>[];
    ready?: (this: T, e: T) => maybePromise<void | (() => void)>;
    resize?: (this: T, e: UIEvent) => void;
    beforeunload?: (this: T, e: BeforeUnloadEvent) => void;
    popstate?: (this: T, e: PopStateEvent) => void;
    DOMContentLoaded?: (this: T, e: Event) => void;
    winscroll?: (this: T, e: Event) => void;
    winload?: (this: T, e: Event) => void;
    winfocus?: (this: T, e: Event) => void;
    winblur?: (this: T, e: Event) => void;
    winkeydown?: (this: T, e: KeyboardEvent) => void;
    winkeypress?: (this: T, e: KeyboardEvent) => void;
    winkeyup?: (this: T, e: KeyboardEvent) => void;
}
type DOMEvents<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?: (this: T, event: GlobalEventHandlersEventMap[P]) => void;
} & c_events<T>;

interface EAttr<T = DVal> {
    [key: string]: any;
    [key: `data-${string}`]: T | any;
    accesskey?: T;
    autocapitalize?: T;
    class?: T | T[];
    on?: DOMEvents<any>;
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

type DOMAttr = EAttr;
type DOMValue<T = V | V[]> = DVal<T>;
type DOMRenderable = string | number | boolean | null | undefined | DOM | DOMRenderable[] | IStateful<unknown> | object | (() => maybePromise<DOMRenderable>);
type DOMContext = maybePromise<DOMRenderable>;
type DOMComponentProps<T extends object = {}> = DOMAttr & T;
type DOMComponent<T extends object = {}> = (attributes: DOMComponentProps<T>, ...children: DOMContext[]) => maybePromise<DOM>;
type DOMNode = DOM;

declare class DOM {
    tag: string;
    attr: DOMAttr;
    ctx: DOMContext[];
    constructor(tag: string, attr: DOMAttr, ctx: DOMContext[]);
}
declare function dom(tag: string | DOMComponent, attr?: DOMAttr | null, ...ctx: DOMContext[]): Promise<DOM>;
declare const frag: (_attr: DOMAttr, ...ctx: DOMContext[]) => Promise<DOM>;

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
interface embedAttr<T = DVal> extends EAttr {
    height?: T;
    src?: T;
    type?: T;
    width?: T;
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
interface outputAttr<T = DVal> extends EAttr {
    for?: T;
    form?: T;
    name?: T;
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
interface thAttr<T = DVal> extends EAttr<T> {
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
interface contenteditableAttr<T = DVal> extends EAttr {
    enterkeyhint?: T;
    inputmode?: T;
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
    output: outputAttr;
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
    svg: svgAttr & {
        viewBox?: DVal;
    };
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
interface svgAttr<T = DVal> extends EAttr<T> {
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
interface svgEAttr<T = DVal> extends svgAttr<T> {
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
interface svgETextAttr<T = DVal> extends svgEAttr<T> {
    fontSize?: T;
    fontFamily?: T;
    fontWeight?: T;
    textAnchor?: T;
    dominantBaseline?: T;
}

declare global {
    type events<T extends Elements = HTMLElement> = {
        [P in keyof GlobalEventHandlersEventMap]?: (this: T, e: GlobalEventHandlersEventMap[P]) => void;
    } & c_events<T>;
    namespace JSX {
        type Element = maybePromise<DOM>;
        interface IntrinsicElements extends ElementAttributes, SVGAttributes {
        }
    }
}

/** Generates a sequence of hierarchical DOM IDs for rendered nodes. */
declare class Idm {
    readonly nonce?: string | undefined;
    private counter;
    private readonly baseId;
    constructor(seed?: string, counter?: number, nonce?: string | undefined);
    /** Resumes the sequence from an ID previously generated by this class. */
    static fromId(id: string, nonce?: string): Idm;
    get id(): string;
    get nextId(): string;
    get childId(): Idm;
    append(prefix?: string): Idm;
}

declare class CATT {
    xid: string;
    IDM: Idm;
    map: Mapper<string, string[]>;
    states: ((id: string) => Promise<() => void>)[];
    events: Mapper<string, (...arg: any) => any>;
    OZ: OZ;
    private internalId?;
    constructor(xid: string, IDM?: Idm, _OZ?: OZ);
    attr_push(key: string, val: any, pre?: string): void;
    get attr(): string;
    set id(id: string);
    get id(): string | undefined;
    setId(id: string): void;
}

declare class OZ {
    private readonly tokens;
    private events;
    private states;
    private windowEvents;
    private documentEvents;
    private resetST;
    private resetEV;
    get keys(): string[];
    set(catt: CATT): this;
    push(_OZ: this): this;
    stage(isCurrent?: () => boolean): Promise<this>;
    get processWindowEvents(): this;
    get processDocumentEvents(): this;
    reset(id: string[]): this;
    resetScope(prefix: string): this;
    RPS(oz?: this, isCurrent?: () => boolean): Promise<this>;
}

/** Converts an attribute value for inclusion in generated HTML. */
declare const attr_value: (value: unknown) => string;

declare class ATTR {
    attr: EAttr;
    constructor(attr?: EAttr);
    get(catt: CATT, attr?: EAttr, pre?: string): void;
    unload<T>(x: string): T | undefined;
}

interface RenderedDOM {
    ctx: string;
    oz: OZ;
    id: string | undefined;
}
type renderedDom = RenderedDOM;
declare function renderDom(node: maybePromise<DOM>, pid?: Idm | string): Promise<RenderedDOM>;

interface YveeURL {
    path: string;
    search: string;
    hash: string;
    params: URLSearchParams;
}
declare const normalizePath: (input: string) => string;
declare const toURL: (input: string | URL) => YveeURL;

type HeadConfig = {
    base?: Record<string, string | boolean>[];
    title?: string;
    style?: string;
    description?: string;
    meta?: Record<string, string | boolean>[];
    link?: Record<string, string | boolean>[];
    script?: (Record<string, string | boolean> & {
        body?: string;
    })[];
    css?: string | string[];
    js?: string | string[];
    /** DOM-rendered head elements, useful for reactive text and attributes. */
    elements?: DOM[];
};
type HeadResult = HeadConfig | DOM | string | void;
declare class HeadDefaults {
    readonly values: HeadConfig;
    head(value: HeadResult): void;
}

type HeadCleanup = (() => void) & {
    ready: Promise<void>;
    activate(): Promise<void>;
    cancel(): void;
};
declare function applyHead(config: HeadConfig, owner: string, options?: {
    keepExisting?: boolean;
    deferTitle?: boolean;
    idSeed?: string;
    nonce?: string;
}): HeadCleanup;

declare class Page<TData extends Record<string, unknown> = Record<string, unknown>> {
    readonly resources: DisposalScope;
    url: YveeURL;
    path: string;
    params: Record<string, string>;
    data: TData;
    error?: unknown;
    status: number;
    fetch?(context: PageFetchContext<TData>): Partial<TData> | Promise<Partial<TData>>;
    head?(): HeadResult | Promise<HeadResult>;
    body?(): unknown | Promise<unknown>;
}
interface PageFetchContext<TData extends Record<string, unknown>> {
    url: YveeURL;
    params: Readonly<Record<string, string>>;
    data: TData;
    signal: AbortSignal;
    resources: DisposalScope;
}
declare class MissingPage extends Page {
    body(): JSX.Element;
}
declare class FailurePage extends Page {
    status: number;
    body(): JSX.Element;
}

type Constructor<T = object> = new (...args: any[]) => T;
type Transport = "page" | "socket";
interface RouteEntry<T = unknown> {
    path: string;
    transport: Transport;
    expression: RegExp;
    names: string[];
    controller: Constructor<T>;
}
interface RouteMatch<T> {
    entry: RouteEntry<T>;
    params: Record<string, string>;
}
declare function error(status: number): <T extends Constructor<Page>>(controller: T) => T;
declare const page: (path?: string) => <T extends Constructor>(controller: T) => T;
declare const route: (path?: string) => <T extends Constructor>(controller: T) => T;
declare const socketRoute: (path?: string) => <T extends Constructor>(controller: T) => T;
declare class RouteBook<T = unknown> {
    private readonly base;
    private readonly entries;
    constructor(base?: string);
    add(path: string, controller: Constructor<T>, transport?: Transport): {
        controller: Constructor<T>;
        transport: Transport;
        path: string;
        expression: RegExp;
        names: string[];
    };
    find(path: string, transport?: Transport): RouteMatch<T> | undefined;
    all(transport?: Transport): RouteEntry<T>[];
}
declare const interpolate: (pattern: string, values: Record<string, unknown> | unknown[]) => string;

interface GuardApp<TData extends Record<string, unknown>> {
    data: TData;
    url: IStateful<YveeURL>;
}
type GuardResult = void | {
    kind: "allow";
} | {
    kind: "stop";
} | {
    kind: "redirect";
    to: string;
    replace?: boolean;
};
interface GuardContext<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> {
    app: TApp;
    page: TPage;
    url: YveeURL;
    params: Readonly<Record<string, string>>;
    data: TData;
    signal: AbortSignal;
}
type Guard<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> = (context: GuardContext<TApp, TPage, TData>) => GuardResult | Promise<GuardResult>;
type GuardFactory<Args extends unknown[] = [], TContext = GuardContext> = (...args: Args) => (context: TContext) => GuardResult | Promise<GuardResult>;
declare const createGuard: <Args extends unknown[], TContext = GuardContext>(factory: GuardFactory<Args, TContext>) => GuardFactory<Args, TContext>;
declare const use: (...guards: Guard<any, any, any>[]) => <T extends Constructor>(controller: T) => T;

type ContextGuard<C = GuardContext> = (context: C) => GuardResult | Promise<GuardResult>;
type GuardPredicate<C = GuardContext> = (context: C) => boolean | Promise<boolean>;
type GuardRejection = Exclude<GuardResult, void | {
    kind: "allow";
}>;
type GuardFallback<C = GuardContext> = GuardRejection | ((context: C) => GuardRejection | Promise<GuardRejection>);
/** Requires a condition; use a context-derived fallback for redirects. */
declare function requireGuard<C = GuardContext>(predicate: GuardPredicate<C>, fallback?: GuardFallback<C>): ContextGuard<C>;
/** Evaluates guards in order and returns the first stop/redirect decision. */
declare function allGuards<C extends GuardContext<any, any, any> = GuardContext>(...guards: ContextGuard<C>[]): ContextGuard<C>;
/** Runs a guard only when its condition holds. */
declare function whenGuard<C = GuardContext>(predicate: GuardPredicate<C>, guard: ContextGuard<C>): ContextGuard<C>;
/** Validates route parameters before page fetch/render. */
declare function paramsGuard<C extends GuardContext<any, any, any> = GuardContext>(validators: Record<string, (value: string, context: C) => boolean | Promise<boolean>>, fallback?: GuardFallback<C>): ContextGuard<C>;

type Layout = (content: IStateful<unknown[]>) => maybePromise<DOMContext>;

interface ServerRequest<TData> {
    /** URL used to select the page for this render. */
    url: string | URL | YveeURL;
    /** Request data exposed to the page and its fetch method. */
    data?: TData;
    /** Error status to render through the registered error page. */
    error?: number;
    /** Unique per response; pass the same value to the client mount. */
    nonce?: string;
    /** Abort signal for request-bound page loading and data creation. */
    signal?: AbortSignal;
}
/** HTML and the HTTP status produced by a server render. */
interface ServerStatusResult {
    html: string;
    status: number;
    /** Present only when a guard stopped the requested page; currently `"guard-stop"`. */
    reason?: string;
}
interface ServerDataContext<TData> extends ServerRequest<TData> {
    signal: AbortSignal;
    /** Register resources acquired by dataFactory; runs on success, failure or abort. */
    onDispose(cleanup: () => void | Promise<void>): void;
}
interface ServerOptions<TData extends Record<string, unknown>> {
    id?: string;
    class?: string | string[];
    data?: TData;
    /** Return fresh request-owned mutable data/services. Plain data inputs are frozen snapshots. */
    dataFactory?: (context: ServerDataContext<TData>) => TData | Promise<TData>;
}
interface ServerRenderer<TData extends Record<string, unknown>> {
    /** Render a request and return its HTML document. */
    (request: ServerRequest<TData>): Promise<string>;
    withStatus(request: ServerRequest<TData>): Promise<ServerStatusResult>;
}

interface SocketRouteSource {
    routes: RouteBook;
}
type MessageFailure = 'parse' | 'validation' | 'handler';
interface JsonMessageOptions<T> {
    validate?: (value: unknown) => value is T;
    onError?: (error: unknown, phase: MessageFailure, event: MessageEvent) => void;
}
interface SocketLoadOptions {
    signal?: AbortSignal;
    /** No retries by default. Attempts are a total budget per load, including after successful opens. */
    retry?: {
        attempts: number;
        delay?: number;
        maxDelay?: number;
    };
}
declare class SocketController {
    connection?: WebSocket;
    path: string;
    params: Record<string, string>;
    open(_event: Event): void;
    message(_event: MessageEvent): void | Promise<void>;
    close(_event: CloseEvent): void;
    error(_event: Event): void;
    messageError(error: unknown, phase: MessageFailure, _event: MessageEvent): void;
    sendJson(value: unknown): void;
    onMessage<T = unknown>(handler: (value: T, event: MessageEvent) => void | Promise<void>, options?: JsonMessageOptions<T>): this;
}
declare class SocketHub {
    private readonly app;
    private readonly connections;
    constructor(app: SocketRouteSource);
    load(path: string, options?: SocketLoadOptions): SocketController;
    unload(path: string): void;
    closeAll(): void;
}

interface YveeOptions {
    base?: string;
    history?: boolean;
    id?: string;
    /** Browser entry directory or JavaScript file URL. Defaults to `.`, which resolves to `./index.js` relative to the app's base URL. */
    client?: string;
    index?: string;
}
interface MountOptions<T> {
    id?: string;
    data?: T;
    class?: string | string[];
    hydrate?: boolean;
    nonce?: string;
}
/**
 * The value returned by `render()` can be called on a server to create HTML.
 * In a browser it also behaves like the mount promise for backwards-compatible
 * client startup (`app.render().then(...)`).
 */
type RenderResult<T extends Record<string, unknown>> = ServerRenderer<T> & Promise<() => void> & {
    /**
     * The Yvee instance that produced this renderer; call `listPaths()` or
     * `listRoutes()` on it from built bundles, tests, and static-export tooling.
     */
    readonly app: Yvee<T>;
};

declare class Yvee<T extends Record<string, unknown> = Record<string, unknown>> extends HeadDefaults {
    readonly id: string;
    readonly routes: RouteBook;
    readonly url: IStateful<YveeURL>;
    readonly loading: IStateful<boolean>;
    readonly socket: SocketHub;
    readonly history: {
        navigate: (path: string | YveeURL, state?: Record<string, unknown>) => void;
        replace: (path: string | YveeURL, state?: Record<string, unknown>) => void;
        back: () => void;
        forward: () => void;
    };
    data: T;
    resources: DisposalScope;
    private readonly root;
    private readonly pageErrors;
    private readonly globalGuards;
    private readonly client;
    private layout;
    onError?: (error: unknown, url: YveeURL) => void;
    constructor(options?: YveeOptions);
    Main(layout?: Layout): this;
    use(...guards: Guard<Yvee<T>, Page<T>, T>[]): this;
    head(value: HeadResult): this;
    route(path: string): <C extends Constructor<Page>>(controller: C) => C;
    error(code: number, controller: Constructor<Page>): this;
    register(...controllers: Constructor[]): this;
    listRoutes(transport?: Transport): RouteEntry<unknown>[];
    /** Page paths including the base, with parameter names used as sample values. */
    listPaths(): string[];
    /** Render a concrete route URL to a complete HTML document without mounting. */
    renderHTML(url: ServerRequest<T>["url"], options?: Omit<ServerRequest<T>, "url">): Promise<string>;
    render(options?: MountOptions<T>): RenderResult<T>;
    dispose(): void;
    server(options?: ServerOptions<T>): ServerRenderer<T>;
    private load;
}

type StoreName = "localStorage" | "sessionStorage";

interface StorageSchema<T> {
    version: number;
    validate: (value: unknown) => value is T;
    fallback: () => T;
    /** Destination version -> migration from the preceding version. */
    migrations?: Readonly<Record<number, (value: unknown) => unknown>>;
}
interface StorageChange {
    key: string | null;
    oldValue: string | null;
    newValue: string | null;
}
interface StorageWatchOptions {
    signal?: AbortSignal;
    scope?: DisposalScope;
}
declare class VersionedValue<T> {
    private readonly store;
    private readonly base;
    private readonly schema;
    readonly key: string;
    constructor(store: BrowserStore, base: string, schema: StorageSchema<T>);
    get(): T;
    set(value: T): this;
    remove(): this;
    watch(callback: (change: StorageChange) => void, options?: StorageWatchOptions): Cleanup;
    private check;
}
declare class StoredValue<T = unknown> {
    private readonly storeName;
    readonly key: string;
    private current;
    constructor(storeName: StoreName, key: string, current: T);
    get value(): T;
    set value(value: T);
    set(value: T): this;
    save(): this;
    remove(): this;
    as: {
        str: () => string;
        int: () => number;
        float: () => number;
        bool: () => boolean;
        json: <R = unknown>() => R;
    };
    private storage;
}
declare class BrowserStore {
    private readonly storeName;
    constructor(storeName: StoreName);
    versioned<T>(key: string, schema: StorageSchema<T>): VersionedValue<T>;
    /** Native storage events from other documents; same-document writes do not notify. */
    watch(key: string, callback: (change: StorageChange) => void, { signal, scope }?: StorageWatchOptions): Cleanup;
    get<T = unknown>(key: string, fallback?: T): StoredValue<T | undefined>;
    /** Writes immediately; storage/serialization failures propagate to the caller. */
    set<T>(key: string, value: T): StoredValue<T>;
    remove(key: string): this;
    has(key: string): boolean;
    private storage;
}
declare const local: BrowserStore;
declare const session: BrowserStore;

declare class HTTPError extends Error {
    readonly response: Response;
    constructor(response: Response);
}
interface RequestRetry {
    /** Additional attempts, from 0 to 5. Only GET, HEAD and OPTIONS may retry. */
    attempts: number;
    delayMs?: number;
}
interface JSONRequestOptions<T> extends RequestInit {
    validate: (value: unknown) => value is T;
    retry?: RequestRetry;
    fetch?: typeof globalThis.fetch;
}
/** HTTP/status failures are distinct from JSON parsing and caller validation failures. */
declare function requestJSON<T>(input: RequestInfo | URL, options: JSONRequestOptions<T>): Promise<T>;

interface StreamHandlers {
    open?: (event: Event) => void;
    error?: (event: Event) => void;
    message?: (event: MessageEvent) => void;
    [name: string]: ((event: MessageEvent) => void) | ((event: Event) => void) | undefined;
}
interface StreamOptions extends EventSourceInit {
    signal?: AbortSignal;
}
/** Dedicated EventSource; native SSE reconnection continues until close/abort. */
declare function eventStreams(url: string, handlers?: StreamHandlers, options?: StreamOptions): EventSource;

/** JSON data only: rejects undefined roots, cycles and unsupported JSON values. */
declare function serializePayload(value: unknown): string;
declare function renderJSONScript(value: unknown, options: {
    id: string;
    nonce?: string;
}): string;

export { $, ATTR, BrowserStore, Column, DOM, DbRepository, Derived, DisposalScope, Elem, EventStream, FailurePage, Field, HTTPError, HeadDefaults, IDNotConnected, IndexedDatabase, MissingPage, Page, QState, RecState, RecStateful, Ref, RefState, RouteBook, Schema, Scope, SetState, SetStateful, SocketController, SocketHub, State, StateEffect, StateHook, StateLoaded, Stateful, Stored, StoredValue, Toggled, VersionedValue, Yvee, allGuards, applyHead, attr_value, batch, createGuard, dom, error, eventStream, eventStreams, frag, getElementById, hook, interpolate, loaded, local, normalizePath, page, paramsGuard, renderContent, renderDom, renderJSONScript, requestJSON, requireGuard, route, serializePayload, session, setContentRenderer, shallowEqual, socketRoute, t, toURL, use, useRef, whenGuard };
export type { $_, CSSStyle, Cleanup, ColumnType, Constructor, ContentRenderer, ContextGuard, DOMAttr, DOMComponent, DOMComponentProps, DOMContext, DOMEvents, DOMNode, DOMRenderable, DOMValue, DVal, DerivedOptions, DerivedValue, Disposable, EAttr, ElementAttributes, Elements, Equality, EventMap, FieldScopeSet, Guard, GuardApp, GuardContext, GuardFactory, GuardFallback, GuardPredicate, GuardRejection, GuardResult, HeadConfig, HeadResult, IRecStateful, ISetStateful, IStateful, JSONRequestOptions, JsonMessageOptions, Layout, MessageFailure, MountOptions, OpenOptions, PageFetchContext, RenderResult, RenderedContent, RenderedDOM, RequestRetry, RouteEntry, SVGAttributes, ScopeDecorator, ScopeProxy, ScopeSet, ServerDataContext, ServerOptions, ServerRenderer, ServerRequest, ServerStatusResult, SocketLoadOptions, StateHookOptions, StateOptions, StateUpdate, StorageChange, StorageSchema, StorageWatchOptions, StreamHandlers, StreamOptions, TagNames, Transport, YveeOptions, YveeURL, _$, aAttr, areaAttr, audioAttr, baseAttr, blockquoteAttr, buttonAttr, c_events, canvasAttr, colAttr, colgroupAttr, contenteditableAttr, dataAttr, delAttr, detailsAttr, dialogAttr, embedAttr, errorStatus, fieldsetAttr, formAttr, iframeAttr, imgAttr, inputAttr, insAttr, labelAttr, liAttr, linkAttr, mapAttr, menuAttr, metaAttr, meterAttr, objectAttr, olAttr, optgroupAttr, optionAttr, outputAttr, paramAttr, progressAttr, qAttr, renderedDom, scriptAttr, selectAttr, sourceAttr, statefulValue, styleAttr, successStatus, svgAttr, svgEAttr, svgETextAttr, tdAttr, textareaAttr, thAttr, timeAttr, trackAttr, videoAttr };

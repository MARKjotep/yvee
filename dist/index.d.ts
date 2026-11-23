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
    state?: ((this: T, e: T) => maybePromise<[
        (...args: any[]) => void,
        IStateful<any>[],
        boolean?,
        boolean?
    ]>) | undefined;
    states?: ((this: T, e: T) => maybePromise<[
        (...args: any[]) => void,
        IStateful<any>[],
        boolean?,
        boolean?
    ]>[]) | undefined;
    ready?: ((this: T, e: T) => maybePromise<void | (() => void)>) | undefined;
    resize?: ((this: T, e: UIEvent) => void) | undefined;
    beforeunload?: ((this: T, e: BeforeUnloadEvent) => void) | undefined;
    popstate?: ((this: T, e: PopStateEvent) => void) | undefined;
    DOMContentLoaded?: ((this: T, e: Event) => void) | undefined;
    winscroll?: ((this: T, e: Event) => void) | undefined;
    winload?: ((this: T, e: Event) => void) | undefined;
    winfocus?: ((this: T, e: Event) => void) | undefined;
    winblur?: ((this: T, e: Event) => void) | undefined;
    winkeydown?: ((this: T, e: KeyboardEvent) => void) | undefined;
    winkeypress?: ((this: T, e: KeyboardEvent) => void) | undefined;
    winkeyup?: ((this: T, e: KeyboardEvent) => void) | undefined;
}
/**
 * Event handler map accepted by `on`. Every handler is optional and may be
 * explicitly `undefined`; the renderer skips absent handlers.
 */
type DOMEvents<T extends Elements = HTMLElement> = {
    [P in keyof GlobalEventHandlersEventMap]?: ((this: T, event: GlobalEventHandlersEventMap[P]) => void) | undefined;
} & c_events<T>;

/**
 * Attributes accepted by every Yvee element. Optional attributes are declared
 * as `?: T | undefined` so a conditionally-present value
 * (`disabled={props.disabled}`) type-checks under `exactOptionalPropertyTypes`;
 * an explicitly `undefined` attribute is dropped during render.
 */
interface EAttr<T = DVal> {
    [key: string]: any;
    [key: `data-${string}`]: T | any;
    accesskey?: T | undefined;
    autocapitalize?: T | undefined;
    class?: T | T[] | undefined;
    on?: DOMEvents<any> | undefined;
    ref?: Ref<any> | undefined;
    contenteditable?: T | undefined;
    dir?: T | undefined;
    draggable?: T | undefined;
    hidden?: T | undefined;
    id?: T | undefined;
    itemprop?: T | undefined;
    lang?: T | undefined;
    role?: T | undefined;
    slot?: T | undefined;
    spellcheck?: T | undefined;
    style?: CSSStyle | string | undefined;
    tabindex?: T | undefined;
    title?: T | undefined;
    translate?: T | undefined;
}

/**
 * Attribute/event shape accepted by renderer nodes and JSX intrinsics.
 *
 * Optional attributes accept an explicitly `undefined` value
 * (`disabled?: T | undefined`) and are omitted from the rendered markup.
 */
type DOMAttr = EAttr;
type DOMValue<T = V | V[]> = DVal<T>;
type DOMRenderable = string | number | boolean | null | undefined | DOM | DOMRenderable[] | IStateful<unknown> | object | (() => maybePromise<DOMRenderable>);
type DOMContext = maybePromise<DOMRenderable>;
/**
 * Attributes passed to a Yvee function component: {@link DOMAttr} plus the
 * component's own props.
 *
 * JSX children are **not** part of this object. `dom` forwards them as rest
 * arguments, so `props.children` is always `undefined`; declare components as
 * `(props: P, ...children: DOMContext[])` and render `{children}`.
 */
type DOMComponentProps<T extends object = {}> = DOMAttr & T;
/**
 * Type of a Yvee function component.
 *
 * The first parameter carries attributes/props; JSX children arrive as the
 * remaining rest parameters (they are never placed on the props object).
 *
 * ```tsx
 * function Card(props: { title: string }, ...children: DOMContext[]) {
 *   return <section><h2>{props.title}</h2>{children}</section>;
 * }
 * ```
 */
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
interface areaAttr<T = DVal> extends EAttr {
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
interface audioAttr<T = DVal> extends EAttr {
    autoplay?: T | undefined;
    controls?: T | undefined;
    crossorigin?: T | undefined;
    loop?: T | undefined;
    muted?: T | undefined;
    preload?: T | undefined;
    src?: T | undefined;
}
interface baseAttr<T = DVal> extends EAttr {
    href?: T | undefined;
    target?: T | undefined;
}
interface blockquoteAttr<T = DVal> extends EAttr {
    cite?: T | undefined;
}
interface buttonAttr<T = DVal> extends EAttr {
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
interface canvasAttr<T = DVal> extends EAttr {
    height?: T | undefined;
    width?: T | undefined;
}
interface colAttr<T = DVal> extends EAttr {
    span?: T | undefined;
}
interface colgroupAttr<T = DVal> extends EAttr {
    span?: T | undefined;
}
interface dataAttr<T = DVal> extends EAttr {
    value?: T | undefined;
}
interface delAttr<T = DVal> extends EAttr {
    cite?: T | undefined;
    datetime?: T | undefined;
}
interface detailsAttr<T = DVal> extends EAttr {
    open?: T | undefined;
}
interface dialogAttr<T = DVal> extends EAttr {
    open?: T | undefined;
}
interface embedAttr<T = DVal> extends EAttr {
    height?: T | undefined;
    src?: T | undefined;
    type?: T | undefined;
    width?: T | undefined;
}
interface fieldsetAttr<T = DVal> extends EAttr {
    disabled?: T | undefined;
    form?: T | undefined;
    name?: T | undefined;
}
interface formAttr<T = DVal> extends EAttr {
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
interface iframeAttr<T = DVal> extends EAttr {
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
interface imgAttr<T = DVal> extends EAttr {
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
interface inputAttr<T = DVal> extends EAttr {
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
interface insAttr<T = DVal> extends EAttr {
    cite?: T | undefined;
    datetime?: T | undefined;
}
interface labelAttr<T = DVal> extends EAttr {
    for?: T | undefined;
    form?: T | undefined;
}
interface liAttr<T = DVal> extends EAttr {
    value?: T | undefined;
}
interface linkAttr<T = DVal> extends EAttr {
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
interface mapAttr<T = DVal> extends EAttr {
    name?: T | undefined;
}
interface menuAttr<T = DVal> extends EAttr {
    type?: T | undefined;
}
interface metaAttr<T = DVal> extends EAttr {
    charset?: T | undefined;
    content?: T | undefined;
    "http-equiv"?: T | undefined;
    name?: T | undefined;
}
interface meterAttr<T = DVal> extends EAttr {
    form?: T | undefined;
    high?: T | undefined;
    low?: T | undefined;
    max?: T | undefined;
    min?: T | undefined;
    optimum?: T | undefined;
    value?: T | undefined;
}
interface objectAttr<T = DVal> extends EAttr {
    data?: T | undefined;
    form?: T | undefined;
    name?: T | undefined;
    height?: T | undefined;
    type?: T | undefined;
    usemap?: T | undefined;
    width?: T | undefined;
}
interface olAttr<T = DVal> extends EAttr {
    reversed?: T | undefined;
    start?: T | undefined;
    type?: T | undefined;
}
interface optgroupAttr<T = DVal> extends EAttr {
    disabled?: T | undefined;
    label?: T | undefined;
}
interface optionAttr<T = DVal> extends EAttr {
    disabled?: T | undefined;
    label?: T | undefined;
    selected?: T | undefined;
    value?: T | undefined;
}
interface outputAttr<T = DVal> extends EAttr {
    for?: T | undefined;
    form?: T | undefined;
    name?: T | undefined;
}
interface paramAttr<T = DVal> extends EAttr {
    name?: T | undefined;
    value?: T | undefined;
}
interface progressAttr<T = DVal> extends EAttr {
    form?: T | undefined;
    max?: T | undefined;
    value?: T | undefined;
}
interface qAttr<T = DVal> extends EAttr {
    cite?: T | undefined;
}
interface scriptAttr<T = DVal> extends EAttr {
    async?: T | undefined;
    crossorigin?: T | undefined;
    defer?: T | undefined;
    integrity?: T | undefined;
    referrerpolicy?: T | undefined;
    src?: T | undefined;
    type?: T | undefined;
}
interface selectAttr<T = DVal> extends EAttr {
    autocomplete?: T | undefined;
    disabled?: T | undefined;
    form?: T | undefined;
    multiple?: T | undefined;
    name?: T | undefined;
    required?: T | undefined;
    size?: T | undefined;
}
interface sourceAttr<T = DVal> extends EAttr {
    media?: T | undefined;
    sizes?: T | undefined;
    src?: T | undefined;
    srcset?: T | undefined;
    type?: T | undefined;
}
interface styleAttr<T = DVal> extends EAttr {
    media?: T | undefined;
    type?: T | undefined;
}
interface tdAttr<T = DVal> extends EAttr {
    colspan?: T | undefined;
    headers?: T | undefined;
    rowspan?: T | undefined;
}
interface textareaAttr<T = DVal> extends EAttr {
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
interface thAttr<T = DVal> extends EAttr<T> {
    colspan?: T | undefined;
    headers?: T | undefined;
    rowspan?: T | undefined;
    scope?: T | undefined;
}
interface timeAttr<T = DVal> extends EAttr {
    datetime?: T | undefined;
}
interface trackAttr<T = DVal> extends EAttr {
    default?: T | undefined;
    kind?: T | undefined;
    label?: T | undefined;
    src?: T | undefined;
    srclang?: T | undefined;
}
interface videoAttr<T = DVal> extends EAttr {
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
interface contenteditableAttr<T = DVal> extends EAttr {
    enterkeyhint?: T | undefined;
    inputmode?: T | undefined;
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
        viewBox?: DVal | undefined;
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
interface svgEAttr<T = DVal> extends svgAttr<T> {
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
interface svgETextAttr<T = DVal> extends svgEAttr<T> {
    fontSize?: T | undefined;
    fontFamily?: T | undefined;
    fontWeight?: T | undefined;
    textAnchor?: T | undefined;
    dominantBaseline?: T | undefined;
}

declare global {
    type events<T extends Elements = HTMLElement> = {
        [P in keyof GlobalEventHandlersEventMap]?: ((this: T, e: GlobalEventHandlersEventMap[P]) => void) | undefined;
    } & c_events<T>;
    /**
     * Yvee JSX namespace.
     *
     * Function components receive their attributes as the first argument and JSX
     * children as **rest arguments**: declare them as
     * `(props: P, ...children: DOMContext[])` and render `{children}`.
     * Children are never placed on `props`, and `props.children` is always
     * `undefined`.
     */
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

/**
 * State retained for a region between renders. `get` returns the value stored
 * by the previous render of the same region (or `undefined`), and `set` keeps
 * `value` for its next render. The runtime owns storage: values are plain data
 * that dies with the page, and they are only retained on pages that set
 * `Page.keepAlive`.
 */
interface RegionCache {
    /** Value retained by the previous render of this region, or `undefined`. */
    get(): unknown;
    /** Store `value` for this region's next render. */
    set(value: unknown): void;
}
/** A lazily imported in-page region view, using the same `default` contract as `body()`. */
interface RegionModule {
    /**
     * Render the region view. `cache` is always provided: it is a working
     * read/write store on `keepAlive` pages and a no-op store everywhere else,
     * so modules stay portable.
     */
    default: (context: {
        page: Page;
        cache: RegionCache;
    }) => unknown | Promise<unknown>;
    /**
     * Head contributed while this region is displayed. Accepts the same values
     * as a body module `head`; the runtime recombines it with the page head on
     * region changes without a route transition.
     */
    head?: HeadResult | ((context: {
        page: Page;
    }) => HeadResult | Promise<HeadResult>);
}
/** Context passed to `Page.regionWillLeave` before a region changes. */
interface RegionLeaveContext<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Region currently displayed. */
    from: string;
    /** Region the navigation wants to display. */
    to: string;
    /** Target URL; the navigation is not committed when the hook runs. */
    url: YveeURL;
    /** Route parameters of the current page. */
    params: Record<string, string>;
    /** Mutable page data, including any data merged by earlier region refreshes. */
    data: TData;
    /** Page-lifetime abort signal; aborts when the page is left. */
    signal: AbortSignal;
}
/** Context passed to `Page.regionDidEnter` after a region view has settled. */
interface RegionEnterContext {
    /** Region that is now displayed. */
    region: string;
}
/** Imports one region view module; the runtime caches the promise per page and region. */
type RegionLoader = () => Promise<RegionModule>;
declare class Page<TData extends Record<string, unknown> = Record<string, unknown>> {
    #private;
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
    /**
     * Query parameter that selects the active region, for example `"tab"`.
     * Set it together with `regions`; without either value regions stay inactive.
     */
    regionParam?: string;
    /** Region shown when the URL omits the region parameter or names an unknown region. */
    defaultRegion?: string;
    /**
     * Remember the region the user last opened on this page's path and reopen it
     * when a later in-app navigation omits the region parameter. Explicit region
     * parameters always win, and fresh document loads keep rendering the URL's
     * region. Requires `regions` and `regionParam`.
     */
    rememberRegion?: boolean;
    /**
     * Lazily imported region views keyed by region id. Switching regions updates
     * the URL query parameter without a page transition, so the page shell stays
     * mounted while only `regionContent` changes.
     */
    regions?: Record<string, RegionLoader>;
    /**
     * Retain plain state per region between renders on this page (off by
     * default). `true` keeps the five most recently rendered regions, and a
     * number sets that bound. Retained values are handed back through the
     * `cache` context member on the next render of the same region, which lets
     * form data, selections or fetched lists survive tab round-trips; the DOM is
     * rebuilt every time, so effects and subscriptions still belong to
     * `regionResources`. Requires `regions` and `regionParam`.
     */
    keepAlive?: number | true;
    /**
     * Guards that run when a region becomes active, keyed by region id. They run
     * before the region is imported and rendered, before `regionWillLeave`, and
     * before any history write, scroll capture or view change.
     *
     * On the initial load the resolved region's guards run after region
     * resolution (an unknown id resolves to `defaultRegion` first, and
     * `strictRegions` still 404s before them): `redirect` returns to the normal
     * server/client redirect loop, while `stop` leaves the request without a
     * page. Because a first-load `stop` has no client render path, login-style
     * gates should return `redirect` with `returnTo` instead.
     *
     * During an in-page swap a `stop` changes nothing at all, and a `redirect`
     * re-enters navigation at the redirect target. A history move that is denied
     * restores the previous URL. Guards are not run when the target region is
     * already displayed.
     */
    regionGuards?: Record<string, RegionGuard<any, any, any>[]>;
    /**
     * Re-run `fetch` in the incoming region's scope on every in-page region
     * change, so a region can load its own data without a full page load. The
     * result merges into `page.data` before the region view renders. Ignored
     * without `regions` or `fetch`, and the initial document load keeps using the
     * normal `fetch` pass.
     */
    refreshOnRegionChange?: boolean;
    /**
     * Reject region ids the page does not declare. On the initial load an unknown
     * id renders the 404 error page; an in-app navigation or history move to an
     * unknown id is denied and the previous URL is restored instead of falling
     * back to `defaultRegion`. Off by default, which keeps the canonicalizing
     * default-region fallback.
     */
    strictRegions?: boolean;
    /**
     * Runs before an in-page region change writes history or swaps the view.
     * Throwing (or rejecting) cancels the navigation: the URL, history entry and
     * displayed region stay untouched and the error is reported through
     * `onError`. Not called when the target region is already displayed.
     */
    regionWillLeave?(context: RegionLeaveContext<TData>): void | Promise<void>;
    /**
     * Runs after an in-page region swap or region history move has settled.
     * Errors are reported through `onError` after the swap has committed. The
     * initial document load does not call this hook.
     */
    regionDidEnter?(context: RegionEnterContext): void | Promise<void>;
    /**
     * Id of the displayed region. The runtime owns this value: it writes the id
     * after resolving the URL, so views should only read it (for example to mark
     * the active tab). Do not assign to it from a view.
     */
    readonly region: IStateful<string>;
    /**
     * Outlet content for the active region. Render this state inside the page
     * view; the runtime replaces its value during region switches. Treat it as
     * read-only from application code.
     */
    readonly regionContent: IStateful<unknown>;
    /**
     * Resources owned by the active region. Each activation starts a fresh scope
     * and the previous scope is disposed before the next region renders. Page
     * `resources` are independent and only close when the page is left.
     */
    regionResources: DisposalScope;
    /**
     * Read the server-seeded data for this document at most once.
     *
     * During SSR (no `document`) it returns `this.data` on every call, so server
     * renders are deterministic. In the browser it returns the hydrated payload
     * for the first call of the initial mount and `undefined` for later calls,
     * re-renders and client-side navigations. `page.data` is never modified.
     */
    ssrData<T extends Record<string, unknown> = TData>(): T | undefined;
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
/** A guard redirect decision. */
type GuardRedirect = {
    kind: "redirect";
    /** Destination path, optionally carrying its own query and hash. */
    to: string;
    /** Keep the current history entry instead of pushing a new one. */
    replace?: boolean;
    /**
     * Preserves the URL that was rejected as a `returnTo` query parameter on
     * `to`. `true` appends the current request URL (`path + search + hash`);
     * a string appends that explicit value instead. Omit it for a bare redirect.
     */
    returnTo?: boolean | string;
};
type GuardResult = void | {
    kind: "allow";
} | {
    kind: "stop";
} | GuardRedirect;
interface GuardContext<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> {
    app: TApp;
    page: TPage;
    url: YveeURL;
    params: Readonly<Record<string, string>>;
    data: TData;
    signal: AbortSignal;
    /**
     * `true` while guards run without a browser `window` (server rendering or
     * Bun), `false` for client-side navigation. Always populated by the guard
     * runner, so guard code can branch without touching globals.
     */
    readonly server: boolean;
}
/**
 * Guard context accepted by the runner before the environment flag is filled
 * in. Existing call sites may omit `server`; `checkGuards` normalizes it to a
 * full `GuardContext` for every guard.
 */
type GuardContextInput<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> = Omit<GuardContext<TApp, TPage, TData>, "server"> & {
    readonly server?: boolean;
};
type Guard<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> = (context: GuardContext<TApp, TPage, TData>) => GuardResult | Promise<GuardResult>;
/**
 * Guard context for a region becoming active. It is a `GuardContext` with the
 * region transition itself added, so the same guards, decisions and helpers
 * work for pages and regions.
 */
interface RegionGuardContext<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> extends GuardContext<TApp, TPage, TData> {
    /** Region id the navigation wants to display. */
    region: string;
    /** Region that was displayed before the change; `undefined` on the initial load. */
    from: string | undefined;
}
/**
 * A guard that runs when its region becomes active. Declare guards per region
 * through `Page.regionGuards`; `stop` keeps the previous region (and URL) and a
 * `redirect` re-enters navigation with the redirect target.
 */
type RegionGuard<TApp = unknown, TPage = unknown, TData extends Record<string, unknown> = Record<string, unknown>> = (context: RegionGuardContext<TApp, TPage, TData>) => GuardResult | Promise<GuardResult>;
type GuardFactory<Args extends unknown[] = [], TContext = GuardContext> = (...args: Args) => (context: TContext) => GuardResult | Promise<GuardResult>;
declare const createGuard: <Args extends unknown[], TContext = GuardContext>(factory: GuardFactory<Args, TContext>) => GuardFactory<Args, TContext>;
declare const use: (...guards: Guard<any, any, any>[]) => <T extends Constructor>(controller: T) => T;
/**
 * Returns `to` with the request URL (`path + search + hash`) appended as an
 * encoded `returnTo` query parameter. Guards can set `returnTo: true` instead;
 * this helper is for building a redirect target by hand.
 */
declare function buildReturnTo(url: YveeURL, to: string): string;
/**
 * Reads and decodes a `returnTo` query parameter from a redirect target, a
 * `URL`, or a parsed `YveeURL`. Returns `undefined` when the parameter is
 * absent, so a login view can fall back to its default destination.
 */
declare function readReturnTo(url: string | URL | YveeURL): string | undefined;

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
/** Lifecycle of a socket connection: waiting to connect or retry, open, or closed/disposed. */
type SocketConnectionState = 'connecting' | 'open' | 'closed';
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
    /**
     * Reactive connection state, bindable from a view like `app.loading`.
     * Starts as `"connecting"`, becomes `"open"` once the native socket opens and
     * queued frames flush, and `"closed"` when the socket closes or the hub
     * disposes the controller. Retries cycle `"closed"` back to `"connecting"`.
     */
    readonly state: IStateful<SocketConnectionState>;
    private queue;
    private disposed;
    open(_event: Event): void;
    message(_event: MessageEvent): void | Promise<void>;
    close(_event: CloseEvent): void;
    error(_event: Event): void;
    messageError(error: unknown, phase: MessageFailure, _event: MessageEvent): void;
    /**
     * Sends a JSON frame, queueing it in FIFO order while the socket is missing
     * or not open. Queued frames flush once when the connection opens, including
     * after a retry reconnect. Frames sent to a disposed controller are dropped.
     * The queue is unbounded while waiting, so senders should avoid producing
     * frames faster than the connection can open. Never throws: serialization
     * and native send failures are logged and the frame is skipped.
     *
     * Unlike `sendJson`, this does not drop frames sent before the socket opens.
     */
    send(value: unknown): void;
    /** Fire-and-forget: silently drops the frame unless the socket is open now. */
    sendJson(value: unknown): void;
    /** @internal Binds the native socket and enters `"connecting"`. */
    attach(socket: WebSocket): void;
    /** @internal Enters `"open"`; the hub flushes queued frames after the `open` hook. */
    opened(): void;
    /** @internal Sends queued frames in FIFO order if the socket is open. */
    flush(): void;
    /** @internal Enters `"closed"`; queued frames survive for a retry reconnect. */
    closed(): void;
    /** @internal Disposes the controller: clears queued frames and enters `"closed"`. */
    dispose(): void;
    private transmit;
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

/**
 * `true` when the module is evaluated in a browser (a global `window` exists).
 *
 * Evaluated once at module scope with `typeof window`, so importing this module
 * during server rendering or in Bun never throws. Use it in guards, pages and
 * auth helpers instead of repeating `typeof window === "undefined"` checks.
 */
declare const isClient: boolean;

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
    /**
     * Validated read: parses the stored JSON and returns its value only when it
     * passes `validate`; otherwise `.value` is `undefined`. Invalid entries are
     * left in storage, so call `.remove()` to discard them. A function argument
     * is always treated as a validator.
     */
    get<T>(key: string, validate: (value: unknown) => value is T): StoredValue<T | undefined>;
    get<T = unknown>(key: string, fallback?: T): StoredValue<T | undefined>;
    /** Writes immediately; storage/serialization failures propagate to the caller. */
    set<T>(key: string, value: T): StoredValue<T>;
    remove(key: string): this;
    has(key: string): boolean;
    private storage;
}
declare const local: BrowserStore;
declare const session: BrowserStore;

/**
 * Non-success HTTP response. `body` holds the parsed JSON error body when one
 * was readable. The message is the explicit `message` argument, then a string
 * `error` or `message` field on `body`, then `HTTP <status> <statusText>`.
 */
declare class HTTPError extends Error {
    readonly response: Response;
    /** Parsed JSON body of the response, or `undefined` when it was not JSON. */
    readonly body?: unknown;
    constructor(response: Response, message?: string, body?: unknown);
    /**
     * Builds an `HTTPError` after cloning the response and parsing its JSON body.
     * The clone is taken first, so `response` stays readable for other callers.
     * Parse failures leave `body` undefined.
     */
    static fromResponse(response: Response, message?: string): Promise<HTTPError>;
}
interface RequestRetry {
    /** Additional attempts, from 0 to 5. Only GET, HEAD and OPTIONS may retry. */
    attempts: number;
    delayMs?: number;
}
interface CsrfOptions {
    /** Header carrying the token. Defaults to `x-csrf-token`. */
    header?: string;
    /** JSON body field carrying the token. Defaults to `csrfToken`. */
    field?: string;
    /** Token minting endpoint. Defaults to `/csrf`; `false` disables minting. */
    endpoint?: string | false;
}
interface JSONRequestOptions<T> extends RequestInit {
    validate: (value: unknown) => value is T;
    retry?: RequestRetry;
    fetch?: typeof globalThis.fetch;
    /**
     * Attaches a CSRF token to the request header and, for a JSON body, a body
     * field. `true` uses the `x-csrf-token` header, the `csrfToken` field, the
     * `csrf_token` cookie, a `meta[name="csrf-token"]` tag, then a cached or
     * freshly minted token from `GET /csrf`. Existing body fields are never
     * overwritten.
     */
    csrf?: boolean | CsrfOptions;
}
/** HTTP/status failures are distinct from JSON parsing and caller validation failures. */
declare function requestJSON<T>(input: RequestInfo | URL, options: JSONRequestOptions<T>): Promise<T>;
interface FormRequestOptions<T> extends Omit<RequestInit, "body"> {
    /** JSON payload, serialized as the request body. Ignored when `body` is set. */
    data?: unknown;
    /** Raw body such as `FormData`; takes precedence over `data`. */
    body?: BodyInit | null;
    /** Optional validator for the parsed JSON success payload. */
    validate?: (value: unknown) => value is T;
    /** CSRF options forwarded to `requestJSON`. */
    csrf?: boolean | CsrfOptions;
    fetch?: typeof globalThis.fetch;
}
interface FormResult<T> {
    ok: boolean;
    /** HTTP status, or `0` when no response was received. */
    status: number;
    data?: T | undefined;
    /** Server error text when available, otherwise the failure message. */
    error?: string | undefined;
}
/**
 * Submits a JSON or `FormData` body without throwing.
 * HTTP and network failures resolve to `{ ok: false, status, error }`; a
 * missing response reports status `0`. A 204/205 success has no `data`.
 */
declare function requestForm<T = unknown>(url: string | URL, options?: FormRequestOptions<T>): Promise<FormResult<T>>;

/**
 * Reads a cookie from `document.cookie` in the browser.
 * Returns `undefined` without a `document` or when the cookie is absent.
 * Values are decoded once; a malformed percent-encoding returns the raw value.
 */
declare function readCookie(name: string): string | undefined;

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

export { $, ATTR, BrowserStore, Column, DOM, DbRepository, Derived, DisposalScope, Elem, EventStream, FailurePage, Field, HTTPError, HeadDefaults, IDNotConnected, IndexedDatabase, MissingPage, Page, QState, RecState, RecStateful, Ref, RefState, RouteBook, Schema, Scope, SetState, SetStateful, SocketController, SocketHub, State, StateEffect, StateHook, StateLoaded, Stateful, Stored, StoredValue, Toggled, VersionedValue, Yvee, allGuards, applyHead, attr_value, batch, buildReturnTo, createGuard, dom, error, eventStream, eventStreams, frag, getElementById, hook, interpolate, isClient, loaded, local, normalizePath, page, paramsGuard, readCookie, readReturnTo, renderContent, renderDom, renderJSONScript, requestForm, requestJSON, requireGuard, route, serializePayload, session, setContentRenderer, shallowEqual, socketRoute, t, toURL, use, useRef, whenGuard };
export type { $_, CSSStyle, Cleanup, ColumnType, Constructor, ContentRenderer, ContextGuard, CsrfOptions, DOMAttr, DOMComponent, DOMComponentProps, DOMContext, DOMEvents, DOMNode, DOMRenderable, DOMValue, DVal, DerivedOptions, DerivedValue, Disposable, EAttr, ElementAttributes, Elements, Equality, EventMap, FieldScopeSet, FormRequestOptions, FormResult, Guard, GuardApp, GuardContext, GuardContextInput, GuardFactory, GuardFallback, GuardPredicate, GuardRedirect, GuardRejection, GuardResult, HeadConfig, HeadResult, IRecStateful, ISetStateful, IStateful, JSONRequestOptions, JsonMessageOptions, Layout, MessageFailure, MountOptions, OpenOptions, PageFetchContext, RegionCache, RegionEnterContext, RegionGuard, RegionGuardContext, RegionLeaveContext, RegionLoader, RegionModule, RenderResult, RenderedContent, RenderedDOM, RequestRetry, RouteEntry, SVGAttributes, ScopeDecorator, ScopeProxy, ScopeSet, ServerDataContext, ServerOptions, ServerRenderer, ServerRequest, ServerStatusResult, SocketConnectionState, SocketLoadOptions, StateHookOptions, StateOptions, StateUpdate, StorageChange, StorageSchema, StorageWatchOptions, StreamHandlers, StreamOptions, TagNames, Transport, YveeOptions, YveeURL, _$, aAttr, areaAttr, audioAttr, baseAttr, blockquoteAttr, buttonAttr, c_events, canvasAttr, colAttr, colgroupAttr, contenteditableAttr, dataAttr, delAttr, detailsAttr, dialogAttr, embedAttr, errorStatus, fieldsetAttr, formAttr, iframeAttr, imgAttr, inputAttr, insAttr, labelAttr, liAttr, linkAttr, mapAttr, menuAttr, metaAttr, meterAttr, objectAttr, olAttr, optgroupAttr, optionAttr, outputAttr, paramAttr, progressAttr, qAttr, renderedDom, scriptAttr, selectAttr, sourceAttr, statefulValue, styleAttr, successStatus, svgAttr, svgEAttr, svgETextAttr, tdAttr, textareaAttr, thAttr, timeAttr, trackAttr, videoAttr };

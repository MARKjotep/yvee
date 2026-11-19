export type ColumnType = "text" | "integer" | "number" | "boolean" | "date" | "json";
/** Validation and index metadata; IndexedDB itself is schemaless. */
export declare class Column {
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
export declare const t: {
    text: () => Column;
    int: () => Column;
    number: () => Column;
    boolean: () => Column;
    timestamp: () => Column;
    json: () => Column;
    serial: () => Column;
};

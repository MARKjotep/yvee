import type { Column } from "./column";
export declare class Schema<T extends object> {
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

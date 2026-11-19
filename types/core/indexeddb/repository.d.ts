import type { Schema } from "./schema";
export declare class DbRepository<T extends object> {
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

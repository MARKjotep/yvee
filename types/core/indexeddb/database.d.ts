import { DbRepository } from "./repository";
import type { Schema } from "./schema";
type StoreSchema = Pick<Schema<object>, "table" | "keyPath" | "autoIncrement" | "entries" | "upgrade">;
export interface OpenOptions {
    /** Useful for tests or a worker-specific factory. Defaults to globalThis.indexedDB. */
    factory?: IDBFactory;
    /** Ask other tabs to close their connections. The open request remains pending. */
    onBlocked?: (event: IDBVersionChangeEvent) => void;
    /** Runs after declared stores/indexes are created. Queue IDB requests synchronously. */
    upgrade?: (db: IDBDatabase, transaction: IDBTransaction, oldVersion: number, newVersion: number) => void;
}
export declare class IndexedDatabase {
    readonly connection: IDBDatabase;
    private readonly schemas;
    private constructor();
    static open(name: string, version: number, schemas: readonly StoreSchema[], options?: OpenOptions): Promise<IndexedDatabase>;
    repository<T extends object>(schema: Schema<T>): DbRepository<T>;
    close(): void;
}
export {};

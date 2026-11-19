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

export class IndexedDatabase {
  private constructor(readonly connection: IDBDatabase, private readonly schemas: ReadonlySet<StoreSchema>) {}

  static open(name: string, version: number, schemas: readonly StoreSchema[], options: OpenOptions = {}): Promise<IndexedDatabase> {
    if (!name || !Number.isSafeInteger(version) || version < 1) {
      return Promise.reject(new TypeError("A database name and positive integer version are required."));
    }
    if (new Set(schemas.map(schema => schema.table)).size !== schemas.length) {
      return Promise.reject(new TypeError("Object store names must be unique."));
    }
    const factory = options.factory ?? globalThis.indexedDB;
    if (!factory) return Promise.reject(new Error("IndexedDB is unavailable in this environment."));
    return new Promise((resolve, reject) => {
      const request = factory.open(name, version);
      let upgradeError: unknown;
      request.onblocked = event => options.onBlocked?.(event);
      request.onerror = () => reject(upgradeError ?? request.error);
      request.onupgradeneeded = event => {
        const transaction = request.transaction!;
        try {
          for (const schema of schemas) schema.upgrade(request.result, transaction);
          options.upgrade?.(request.result, transaction, event.oldVersion, event.newVersion!);
        } catch (error) {
          upgradeError = error;
          transaction.abort();
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        try {
          // Detect missing stores/indexes even if the caller forgot a version bump.
          for (const schema of schemas) {
            const transaction = db.transaction(schema.table, "readonly");
            const store = transaction.objectStore(schema.table);
            if (store.keyPath !== schema.keyPath || store.autoIncrement !== schema.autoIncrement) {
              throw new Error(`Schema '${schema.table}' changed; increase the database version.`);
            }
            for (const [name, column] of schema.entries()) {
              if (!column.indexed || column.primaryKey) continue;
              if (!store.indexNames.contains(name) || store.index(name).unique !== column.isUnique
                || store.index(name).keyPath !== name || store.index(name).multiEntry) {
                throw new Error(`Index '${schema.table}.${name}' changed; increase the database version.`);
              }
            }
          }
          resolve(new IndexedDatabase(db, new Set(schemas)));
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  }

  repository<T extends object>(schema: Schema<T>): DbRepository<T> {
    if (!this.schemas.has(schema)) throw new Error(`Schema '${schema.table}' was not registered when opening this database.`);
    return new DbRepository(this.connection, schema);
  }

  close(): void { this.connection.close(); }
}

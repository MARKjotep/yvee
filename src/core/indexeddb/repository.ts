import type { Schema } from "./schema";

/** Resolves after the transaction commits, including for write requests. */
function run<R>(db: IDBDatabase, table: string, mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, result: (value: R) => void, abort: (error: unknown) => void) => void): Promise<R> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(table, mode);
    let value: R;
    let failure: unknown;
    transaction.oncomplete = () => resolve(value);
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("IndexedDB transaction aborted."));
    const abort = (error: unknown) => {
      failure = error;
      transaction.abort();
    };
    try {
      operation(transaction.objectStore(table), result => { value = result; }, abort);
    } catch (error) { abort(error); }
  });
}

export class DbRepository<T extends object> {
  constructor(private readonly db: IDBDatabase, readonly schema: Schema<T>) {}

  insert(input: Partial<T>): Promise<IDBValidKey> {
    const row = this.schema.prepare(input);
    return run(this.db, this.schema.table, "readwrite", (store, done) => {
      store.add(row).onsuccess = event => done((event.target as IDBRequest<IDBValidKey>).result);
    });
  }

  /** Replaces the whole record, or inserts it when its key does not exist. */
  put(input: Partial<T>): Promise<IDBValidKey> {
    const row = this.schema.prepare(input);
    return run(this.db, this.schema.table, "readwrite", (store, done) => {
      const request = store.put(row);
      request.onsuccess = () => done(request.result);
    });
  }

  find(key: IDBValidKey): Promise<T | undefined> {
    return run(this.db, this.schema.table, "readonly", (store, done) => {
      const request = store.get(key);
      request.onsuccess = () => done(request.result as T | undefined);
    });
  }

  findAll(query?: IDBValidKey | IDBKeyRange, limit?: number): Promise<T[]> {
    return this.readAll(undefined, query, limit);
  }

  findByIndex(name: keyof T & string, query?: IDBValidKey | IDBKeyRange, limit?: number): Promise<T[]> {
    return this.readAll(name, query, limit);
  }

  private readAll(index: string | undefined, query?: IDBValidKey | IDBKeyRange, limit?: number): Promise<T[]> {
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 0xffffffff)) {
      throw new RangeError("Limit must be an integer between 1 and 4294967295.");
    }
    return run(this.db, this.schema.table, "readonly", (store, done) => {
      const request = (index === undefined ? store : store.index(index)).getAll(query, limit);
      request.onsuccess = () => done(request.result as T[]);
    });
  }

  /** Reads and patches the record in the same atomic transaction. */
  update(key: IDBValidKey, changes: Partial<T>): Promise<T | undefined> {
    if (Object.hasOwn(changes, this.schema.keyPath)) throw new TypeError("Updates cannot change the primary key.");
    return run(this.db, this.schema.table, "readwrite", (store, done, abort) => {
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result === undefined) { done(undefined); return; }
        try {
          const row = this.schema.prepare({ ...request.result, ...changes });
          store.put(row).onsuccess = () => done(row);
        } catch (error) {
          abort(error);
        }
      };
    });
  }

  count(query?: IDBValidKey | IDBKeyRange): Promise<number> {
    return run(this.db, this.schema.table, "readonly", (store, done) => {
      const request = store.count(query);
      request.onsuccess = () => done(request.result);
    });
  }

  delete(key: IDBValidKey | IDBKeyRange): Promise<void> {
    return run(this.db, this.schema.table, "readwrite", (store, done) => {
      store.delete(key).onsuccess = () => done(undefined);
    });
  }

  clear(): Promise<void> {
    return run(this.db, this.schema.table, "readwrite", (store, done) => {
      store.clear().onsuccess = () => done(undefined);
    });
  }
}

import type { Column } from "./column";

export class Schema<T extends object> {
  readonly keyPath: string;
  readonly autoIncrement: boolean;

  constructor(readonly table: string, private readonly definitions: Record<keyof T, Column>) {
    if (!table) throw new TypeError("An object store name is required.");
    const primary = this.entries().filter(([, column]) => column.primaryKey);
    if (primary.length !== 1) throw new TypeError(`Store '${table}' requires exactly one primary column.`);
    const [name, column] = primary[0]!;
    this.keyPath = name;
    this.autoIncrement = column.autoIncrement;
    for (const [field, definition] of this.entries()) {
      if (!/^[A-Za-z_$][\w$]*$/.test(field)) throw new TypeError(`Invalid field name '${field}'.`);
      if (definition.autoIncrement && !definition.primaryKey) {
        throw new TypeError(`Serial column '${field}' must be the primary key.`);
      }
      if ((definition.primaryKey || definition.indexed)
        && !["text", "integer", "number", "date"].includes(definition.type)) {
        throw new TypeError(`Column '${field}' cannot be an IndexedDB key or index.`);
      }
    }
  }

  entries(): Array<[string, Column]> {
    return Object.entries(this.definitions) as Array<[string, Column]>;
  }

  prepare(input: Partial<T>): T {
    const row = { ...input } as Record<string, unknown>;
    for (const [name, column] of this.entries()) {
      if (row[name] === undefined && column.hasDefault) row[name] = column.value();
      // A missing inline key lets IndexedDB generate the serial value.
      if (column.autoIncrement && row[name] === undefined) { delete row[name]; continue; }
      column.validate(name, row[name]);
    }
    return row as T;
  }

  /** Call only within an IndexedDB versionchange transaction. */
  upgrade(db: IDBDatabase, transaction: IDBTransaction): void {
    const store = db.objectStoreNames.contains(this.table)
      ? transaction.objectStore(this.table)
      : db.createObjectStore(this.table, { keyPath: this.keyPath, autoIncrement: this.autoIncrement });
    if (store.keyPath !== this.keyPath || store.autoIncrement !== this.autoIncrement) {
      throw new Error(`Changing the primary key of '${this.table}' requires an explicit data migration.`);
    }
    for (const [name, column] of this.entries()) {
      if (!column.indexed || column.primaryKey) continue;
      if (store.indexNames.contains(name)) {
        const index = store.index(name);
        if (index.keyPath === name && index.unique === column.isUnique && !index.multiEntry) continue;
        store.deleteIndex(name);
      }
      store.createIndex(name, name, { unique: column.isUnique });
    }
  }
}

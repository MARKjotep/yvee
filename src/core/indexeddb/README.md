# Yvee IndexedDB

Browser storage for structured records, drafts, temporary caches and offline data.
The module lives in `src/core/indexeddb` and is exported from `yvee`, alongside
`IndexedDatabase`, `Schema`, `t` and `DbRepository`. It has no runtime dependencies
or Bun/server imports and does not open a connection during module loading.

For small JSON preferences, the existing `local` and `session` BrowserStore
instances remain available from `yvee`. IndexedDB provides asynchronous indexed
queries, structured clones and transactions for larger records.

## Example

```ts
import { IndexedDatabase, Schema, t } from "yvee";

interface Note {
  id: number;
  title: string;
  category: string;
  done: boolean;
  createdAt: Date;
}

const schema = new Schema<Note>("notes", {
  id: t.serial().primary,
  title: t.text().notNull,
  category: t.text().index,
  done: t.boolean().default(false),
  createdAt: t.timestamp().defaultNow,
});

const db = await IndexedDatabase.open("client-app", 1, [schema], {
  onBlocked: () => console.info("Close older tabs to finish updating local storage."),
});
const notes = db.repository(schema);

const id = await notes.insert({ title: "First note", category: "work" });
const note = await notes.find(id); // Note | undefined; includes the generated id
await notes.update(id, { done: true });
const work = await notes.findByIndex("category", "work");
const page = await notes.findAll(undefined, 20); // Primary key order; at most 20
const count = await notes.count();
await notes.delete(id);
db.close();
```

Open the database during client initialization, not during server rendering.

## Columns and queries

Builders: `t.text()`, `t.int()` (safe integer), `t.number()` (finite number),
`t.boolean()`, `t.timestamp()` (`Date`), `t.json()` (structured-cloneable value),
and `t.serial()` (generated numeric key).

Modifiers: `.primary`, `.notNull`, `.index`, `.unique`, `.default(value)`,
`.default(() => value)`, and `.defaultNow` for timestamps. Mutable defaults are
cloned for each write. Each store needs exactly one primary column; serial
columns must be primary. Only text, numeric, and date columns support keys and
indexes. Compound keys and multi-entry indexes are not exposed by the builder.

These definitions validate writes through this helper. IndexedDB itself does
not enforce field types or required values. `Schema<T>` checks field names at
compile time; runtime column builders validate values. `Partial<T>` writes let
you omit defaults and generated keys; missing required fields fail at runtime.
Optional columns accept `null` or `undefined`. `t.json()` does not serialize to
JSON; IndexedDB stores structured clones and rejects unsupported values.

- `insert(input)` adds a record and returns its primary key. Duplicate keys fail.
- `put(input)` replaces the entire record or adds it; omitted fields use defaults.
- `find(key)` returns a record or `undefined`.
- `findAll(query?, limit?)` and `findByIndex(column, query?, limit?)` accept an
  exact key or `IDBKeyRange`, e.g. `IDBKeyRange.bound("a", "m")`.
- `update(key, changes)` atomically patches a record and returns it, or
  `undefined` when absent. Primary keys cannot be patched.
- `count(query?)`, `delete(keyOrRange)`, and `clear()` operate on the store.

Each operation uses its own transaction; writes resolve after commit. Native
errors such as `ConstraintError`, `DataCloneError`, and `QuotaExceededError`
reach callers. SQL conditions and arbitrary field filters are not supported;
add an index to query a field efficiently. Unbounded `findAll()` loads every
matching record into memory.

## Schema upgrades

Increase the version passed to `open()` when adding stores or changing indexes.
Declared stores and indexes are created during the upgrade. Existing records,
undeclared stores, and indexes removed from definitions are retained. Changing
an index's uniqueness rebuilds it; duplicate data aborts the upgrade. A primary
key change is rejected rather than deleting records. Changes to validation and
defaults affect future writes; they do not backfill existing rows.

Use the optional `upgrade` callback for explicit migrations, including removing
an obsolete index:

```ts
const db = await IndexedDatabase.open("client-app", 2, [schema], {
  upgrade(_connection, transaction, oldVersion) {
    if (oldVersion < 2) {
      const store = transaction.objectStore("notes");
      if (store.indexNames.contains("obsolete")) store.deleteIndex("obsolete");
      // Queue cursors/requests here to migrate records if needed.
    }
  },
});
```

The callback runs after schema creation. Queue IndexedDB requests synchronously
or from their request callbacks; do not await network calls or timers inside a
transaction. Connections opened by this helper close on `versionchange` so
another tab can upgrade. Other connections can block an upgrade; `onBlocked`
reports that state while `open()` waits for them to close. See the
[IndexedDB transaction guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB).

## Temporary data and ownership

IndexedDB survives reloads and browser sessions. “Temporary” means your
application explicitly expires or deletes the records; closing a connection
releases resources without deleting data. Use an expiry timestamp and an index
when building a time-limited cache, delete individual records with
`repository.delete(key)`, or clear an application-owned temporary store with
`repository.clear()`. Keep cache data separate from durable user records.

Open the database during client initialization and register ownership:

```ts
const db = app.resources.own(await IndexedDatabase.open("draft-cache", 1, [schema]));
const drafts = db.repository(schema);
await drafts.put({ id: 1, title: "Unsaved note", category: "draft" });
// After successful submission:
await drafts.delete(1);
```

For values that should disappear with the tab, use `session` instead.

## Storage limits

IndexedDB has browser-managed storage quotas shared with other storage for the
same origin, rather than one fixed small limit. Use
`await navigator.storage.estimate()` to inspect estimated usage/quota and
`await navigator.storage.persist()` to request persistent storage. Writes can
fail when the quota is exhausted, and best-effort data may be evicted under
storage pressure. See [browser quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## Checks

From the repository root:

```sh
bun test indexeddb
bun build ./src/core/indexeddb/index.ts --target browser --outfile /tmp/yvee-indexeddb.js
```

Tests live in `test/storage/indexeddb.test.ts` and use `fake-indexeddb` as a development dependency. They exercise request and
transaction behavior in memory; browser quota, eviction, and permission behavior
still need testing in your target browser.

import { describe, expect, test } from "bun:test";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { IndexedDatabase, Schema, t } from "../../src/core/indexeddb";

interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
  preferences: { theme: string };
}

function users(index = false) {
  return new Schema<User>("users", {
    id: t.serial().primary,
    name: index ? t.text().notNull.index : t.text().notNull,
    email: t.text().unique,
    active: t.boolean().default(true),
    createdAt: t.timestamp().defaultNow,
    preferences: t.json().default({ theme: "light" }),
  });
}

async function fixture() {
  const schema = users();
  const database = await IndexedDatabase.open("test", 1, [schema], { factory: new IDBFactory() });
  return { schema, database, rows: database.repository(schema) };
}

describe("client IndexedDB", () => {
  test("generates keys and clones defaults without changing input", async () => {
    const { rows, database } = await fixture();
    try {
      const input = { name: "Rosa", email: "rosa@example.com" };
      const key = await rows.insert(input);
      const row = await rows.find(key);
      expect(row).toMatchObject({ id: 1, ...input, active: true, preferences: { theme: "light" } });
      expect(row?.createdAt).toBeInstanceOf(Date);
      expect(input).not.toHaveProperty("id");
      const first = users().prepare(input);
      const second = users().prepare(input);
      first.preferences.theme = "dark";
      expect(second.preferences.theme).toBe("light");
    } finally { database.close(); }
  });

  test("queries indexes, counts, patches, replaces and deletes", async () => {
    const { rows, database } = await fixture();
    try {
      const key = await rows.insert({ name: "Rosa", email: "a@example.com" });
      await rows.insert({ name: "Mark", email: "b@example.com" });
      expect(await rows.count()).toBe(2);
      expect(await rows.findByIndex("email", "a@example.com")).toHaveLength(1);
      expect(await rows.findByIndex("email", IDBKeyRange.bound("a", "b"))).toHaveLength(1);
      expect(await rows.findAll(undefined, 1)).toHaveLength(1);
      expect(await rows.update(key, { name: "Rose" })).toMatchObject({ name: "Rose", email: "a@example.com" });
      expect(await rows.update(999, { name: "Missing" })).toBeUndefined();
      await rows.put({ id: key as number, name: "Replacement", email: "c@example.com" });
      expect(await rows.count()).toBe(2);
      await rows.delete(key);
      expect(await rows.find(key)).toBeUndefined();
      await rows.clear();
      expect(await rows.findAll()).toEqual([]);
    } finally { database.close(); }
  });

  test("unique constraints reject committed writes and leave existing records intact", async () => {
    const { rows, database } = await fixture();
    try {
      await rows.insert({ name: "First", email: "a@example.com" });
      const key = await rows.insert({ name: "Second", email: "b@example.com" });
      await expect(rows.insert({ name: "Duplicate", email: "a@example.com" })).rejects.toHaveProperty("name", "ConstraintError");
      await expect(rows.update(key, { email: "a@example.com" })).rejects.toHaveProperty("name", "ConstraintError");
      expect(await rows.count()).toBe(2);
      expect(await rows.find(key)).toMatchObject({ email: "b@example.com" });
    } finally { database.close(); }
  });

  test("validation errors roll back updates, and invalid inputs fail clearly", async () => {
    const { rows, database } = await fixture();
    try {
      expect(() => rows.insert({})).toThrow("required");
      expect(() => rows.insert({ name: "Bad", active: "yes" as unknown as boolean })).toThrow("boolean");
      expect(() => rows.findAll(undefined, 0)).toThrow("Limit");
      const key = await rows.insert({ name: "Rosa" });
      expect(() => rows.update(key, { id: 20 })).toThrow("primary key");
      await expect(rows.update(key, { name: null as unknown as string })).rejects.toThrow("required");
      expect(await rows.find(key)).toMatchObject({ name: "Rosa" });
      await expect(rows.findByIndex("name", "Rosa")).rejects.toHaveProperty("name", "NotFoundError");
    } finally { database.close(); }
  });

  test("schema definitions reject unsupported keys and missing primary keys", () => {
    expect(() => new Schema("bad", { name: t.text() })).toThrow("exactly one");
    expect(() => new Schema("bad", { a: t.text().primary, b: t.int().primary })).toThrow("exactly one");
    expect(() => new Schema("bad", { id: t.boolean().primary })).toThrow("cannot be");
    expect(() => new Schema("bad", { id: t.serial().primary, flag: t.boolean().index })).toThrow("cannot be");
    expect(() => new Schema("bad", { id: t.serial().primary, count: t.serial() })).toThrow("must be the primary");
    expect(() => t.text().defaultNow).toThrow("timestamp");
  });

  test("version upgrades preserve rows, add indexes, and close older connections", async () => {
    const factory = new IDBFactory();
    const old = users();
    const first = await IndexedDatabase.open("upgrade", 1, [old], { factory });
    await first.repository(old).insert({ name: "Rosa" });
    const next = users(true);
    const second = await IndexedDatabase.open("upgrade", 2, [next], { factory });
    try {
      expect(await second.repository(next).findByIndex("name", "Rosa")).toHaveLength(1);
      await expect(first.repository(old).count()).rejects.toHaveProperty("name", "InvalidStateError");
    } finally { first.close(); second.close(); }
  });

  test("changed indexes require a version bump", async () => {
    const factory = new IDBFactory();
    const first = await IndexedDatabase.open("versions", 1, [users()], { factory });
    first.close();
    await expect(IndexedDatabase.open("versions", 1, [users(true)], { factory })).rejects.toThrow("increase the database version");
  });

  test("failed unique-index upgrade rolls back and preserves data", async () => {
    const factory = new IDBFactory();
    const before = new Schema<{ id: number; name: string }>("items", { id: t.serial().primary, name: t.text() });
    const first = await IndexedDatabase.open("rollback", 1, [before], { factory });
    await first.repository(before).insert({ name: "same" });
    await first.repository(before).insert({ name: "same" });
    first.close();
    const after = new Schema<{ id: number; name: string }>("items", { id: t.serial().primary, name: t.text().unique });
    await expect(IndexedDatabase.open("rollback", 2, [after], { factory })).rejects.toBeDefined();
    const restored = await IndexedDatabase.open("rollback", 1, [before], { factory });
    try { expect(await restored.repository(before).count()).toBe(2); }
    finally { restored.close(); }
  });

  test("primary key changes abort upgrades instead of deleting the store", async () => {
    const factory = new IDBFactory();
    const old = new Schema("items", { id: t.serial().primary });
    const first = await IndexedDatabase.open("keys", 1, [old], { factory });
    await first.repository(old).insert({});
    first.close();
    await expect(IndexedDatabase.open("keys", 2, [new Schema("items", { key: t.text().primary })], { factory }))
      .rejects.toThrow("explicit data migration");
    const restored = await IndexedDatabase.open("keys", 1, [old], { factory });
    try { expect(await restored.repository(old).count()).toBe(1); }
    finally { restored.close(); }
  });

  test("supports explicit migrations and text primary keys", async () => {
    const factory = new IDBFactory();
    const schema = new Schema<{ id: string; value: string }>("settings", { id: t.text().primary, value: t.text() });
    const database = await IndexedDatabase.open("migrate", 1, [schema], {
      factory,
      upgrade: (_db, tx, oldVersion, newVersion) => {
        expect([oldVersion, newVersion]).toEqual([0, 1]);
        tx.objectStore("settings").add({ id: "theme", value: "dark" });
      },
    });
    try { expect(await database.repository(schema).find("theme")).toEqual({ id: "theme", value: "dark" }); }
    finally { database.close(); }
  });

  test("validates versions and duplicate stores before opening", async () => {
    await expect(IndexedDatabase.open("invalid", 0, [])).rejects.toThrow("positive integer");
    await expect(IndexedDatabase.open("duplicate", 1, [users(), users()])).rejects.toThrow("unique");
  });
});

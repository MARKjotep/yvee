import { test, expect } from "@playwright/test";

declare global { interface Window { storageNotices: (string | null)[]; storageBarrier: Promise<void>; } }

test("core IndexedDB stores temporary drafts and explicitly clears them", async ({ page }) => {
  await page.goto("/a");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "yes");
  const result = await page.evaluate(async () => {
    const { IndexedDatabase, Schema, t } = window.fixture.storage;
    const schema = new Schema<{ id: number; title: string }>("drafts", { id: t.serial().primary, title: t.text().notNull });
    const name = `temporary-${crypto.randomUUID()}`;
    const db = window.fixture.app.resources.own(await IndexedDatabase.open(name, 1, [schema]));
    const rows = db.repository(schema);
    const id = await rows.insert({ title: "Unsaved draft" });
    const draft = await rows.find(id);
    await rows.clear();
    const remaining = await rows.count();
    db.close();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
    });
    return { draft, remaining };
  });
  expect(result).toEqual({ draft: { id: 1, title: "Unsaved draft" }, remaining: 0 });
});

test("local storage migrates and notifies other tabs while session storage stays with its tab", async ({ page, context }) => {
  await page.goto("/a");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "yes");
  await page.evaluate(() => {
    window.storageNotices = [];
    const { local, session } = window.fixture.storage;
    local.watch("preference:v2", event => window.storageNotices.push(event.newValue), { scope: window.fixture.app.resources });
    session.set("draft", "first tab");
  });
  const other = await context.newPage();
  await other.goto("/a");
  await expect(other.locator("html")).toHaveAttribute("data-ready", "yes");
  await other.evaluate(() => {
    const { local, session } = window.fixture.storage;
    local.set("preference:v1", "dark");
    local.versioned("preference", {
      version: 2, validate: (value): value is boolean => typeof value === "boolean",
      fallback: () => false, migrations: { 2: value => value === "dark" },
    }).get();
    session.set("draft", "other tab");
  });
  await expect.poll(() => page.evaluate(() => window.storageNotices)).toEqual(["true"]);
  expect(await page.evaluate(() => window.fixture.storage.session.get("draft").value)).toBe("first tab");
  await page.evaluate(() => {
    window.fixture.dispose();
    window.storageBarrier = new Promise<void>(resolve => {
      const done = (event: StorageEvent) => { if (event.key === "barrier") { window.removeEventListener("storage", done); resolve(); } };
      window.addEventListener("storage", done);
    });
  });
  await other.evaluate(() => {
    window.fixture.storage.local.set("preference:v2", false);
    window.fixture.storage.local.set("barrier", true);
  });
  await page.evaluate(() => window.storageBarrier);
  expect(await page.evaluate(() => window.storageNotices)).toEqual(["true"]);
});

import { test, expect, type Page } from '@playwright/test';
import type { createApp, metrics, counter, reactiveText, reactiveURL, stateErrors, largeItems, replaceLargeItems, largeFineRows, replaceFineItem } from './fixture/app';

declare global {
  interface Window {
    coarseFirst?: Element;
    fineFirst?: Element;
    fineTarget?: Element;
    priority3Start?: number;
    fixture: {
      storage: Pick<typeof import('../src'), 'IndexedDatabase' | 'Schema' | 't' | 'local' | 'session'>;
      app: ReturnType<typeof createApp>; metrics: typeof metrics; counter: typeof counter;
      reactiveText: typeof reactiveText; reactiveURL: typeof reactiveURL; stateErrors: typeof stateErrors;
      largeItems: typeof largeItems; replaceLargeItems: typeof replaceLargeItems;
      largeFineRows: typeof largeFineRows; replaceFineItem: typeof replaceFineItem;
      reused: boolean; dispose(): void; remount(): Promise<void>;
      secondary(): Promise<{ other: ReturnType<typeof createApp>; stop(): void }>;
    };
  }
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  Object.assign(page, { fixtureErrors: errors });
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { fixtureErrors: string[] }).fixtureErrors).toEqual([]);
});
async function ready(page: Page, path = '/a') {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'yes');
}
async function settled(page: Page, name: string) {
  await expect(page.locator('h1').first()).toHaveText(name, { timeout: 12_000 });
  await expect(page).toHaveTitle(`Route ${name}`);
  await expect.poll(() => page.evaluate(() => window.fixture.app.loading.value)).toBe(false);
}

test('hydrates existing nodes and binds once; replaces mismatched markup', async ({ page }) => {
  await ready(page);
  expect(await page.evaluate(() => window.fixture.reused)).toBe(true);
  await page.getByRole('button').click();
  await expect(page.getByRole('button')).toHaveText('1');
  expect(await page.evaluate(() => window.fixture.metrics.clicks)).toBe(1);
  await ready(page, '/a?mismatch');
  expect(await page.evaluate(() => window.fixture.reused)).toBe(false);
});

test('latest navigation owns body, head and stylesheet after a slow load', async ({ page }) => {
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  let started!: () => void;
  const waiting = new Promise<void>(resolve => { started = resolve; });
  await page.route('**/gate', async route => { started(); await blocked; await route.fulfill({ body: 'ok' }); });
  await ready(page);
  await page.evaluate(() => window.fixture.app.history.navigate('/slow'));
  await waiting;
  await page.evaluate(() => window.fixture.app.history.navigate('/c'));
  await settled(page, 'c');
  release();
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', 'c');
  await expect(page.locator('link[rel=stylesheet]')).toHaveAttribute('href', '/style/c.css');
});

test('Back and Forward restore repeated URL entries and scroll', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.getByRole('link', { name: 'Go B', exact: true }).evaluate((node: HTMLAnchorElement) => node.click());
  await settled(page, 'b');
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.evaluate(() => window.fixture.app.history.navigate('/a'));
  await settled(page, 'a');
  await page.goBack(); await settled(page, 'b');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  await page.goBack(); await settled(page, 'a');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(400);
  await page.goForward(); await settled(page, 'b');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  await page.evaluate(() => window.fixture.app.history.navigate('/c#fixture-anchor'));
  await settled(page, 'c');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
});

test('failed and stalled stylesheets settle without retaining cancelled styles', async ({ page }) => {
  await page.route('**/style/b.css', route => route.abort());
  await ready(page);
  await page.getByText('Go B', { exact: true }).click(); await settled(page, 'b');
  await page.route('**/style/c.css', () => {});
  await page.evaluate(() => window.fixture.app.history.navigate('/c'));
  await settled(page, 'c');
  await expect(page.locator('link[rel=stylesheet]')).toHaveCount(1);
});

test('keyboard links navigate and special links retain native handling', async ({ page }) => {
  await ready(page);
  await page.getByText('Go B', { exact: true }).focus(); await page.keyboard.press('Enter');
  await settled(page, 'b');
  const prevented = await page.evaluate(() => {
    const result: boolean[] = [];
    for (const label of ['Target', 'Download', 'External', 'Go C']) {
      const anchor = Array.from(document.querySelectorAll('a')).find(a => a.textContent === label)!;
      document.addEventListener('click', event => { result.push(event.defaultPrevented); event.preventDefault(); }, { once: true });
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: label === 'Go C' }));
    }
    return result;
  });
  expect(prevented).toEqual([false, false, false, false]);
});

test('repeated disposal removes bindings and global handlers', async ({ page }) => {
  await ready(page);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.fixture.dispose());
    expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(0);
    await expect(page.locator('[data-yv]')).toHaveCount(0);
    const before = await page.getByRole('button').textContent();
    await page.evaluate(() => { window.fixture.counter.value++; window.dispatchEvent(new Event('resize')); });
    await expect(page.getByRole('button')).toHaveText(before!);
    expect(await page.evaluate(() => window.fixture.metrics.globalEvents)).toBe(0);
    await page.evaluate(() => window.fixture.remount());
    expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(1);
  }
  await page.getByRole('button').click();
  expect(await page.evaluate(() => window.fixture.metrics.clicks)).toBe(1);
});

test('disposal during pending load prevents a late commit', async ({ page }) => {
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/gate', async route => { await blocked; await route.fulfill({ body: 'ok' }); });
  await ready(page);
  await page.evaluate(() => { window.fixture.app.history.navigate('/slow'); window.fixture.dispose(); });
  release();
  await expect(page.locator('h1')).toHaveText('a');
  await expect(page.locator('[data-yv]')).toHaveCount(0);
  expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(0);
});

test('disposing a secondary app preserves the primary bindings', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => { const { stop } = await window.fixture.secondary(); stop(); document.getElementById('secondary')!.remove(); });
  await page.getByRole('button').click();
  await expect(page.getByRole('button')).toHaveText('1');
  expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(1);
});

test('nested apps own their links and secondary apps leave history to the primary', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const second = await window.fixture.secondary();
    Object.assign(window, { stopSecondary: second.stop });
  });
  await page.locator('#secondary').getByText('Go B', { exact: true }).click();
  await expect(page.locator('#secondary h1')).toHaveText('b');
  await expect.poll(() => page.evaluate(() => window.fixture.app.loading.value)).toBe(false);
  await expect(page.locator('body > main h1')).toHaveText('a');
  await expect(page).toHaveURL(/\/a$/);
  await page.evaluate(() => (window as unknown as { stopSecondary(): void }).stopSecondary());
  await expect(page.locator('meta[name=description][data-yv^=fixture]')).toHaveAttribute('content', 'a');
  await page.locator('body > main').getByText('Go C', { exact: true }).click();
  await settled(page, 'c');
  await expect(page).toHaveURL(/\/c$/);
});

test('cancels a staged stylesheet and reports invalid head input without stale nodes', async ({ page }) => {
  await ready(page);
  await page.route('**/style/slowcss.css', () => {});
  await page.evaluate(() => window.fixture.app.history.navigate('/slowcss'));
  await expect(page.locator('link[href="/style/slowcss.css"]')).toHaveCount(1);
  await page.evaluate(() => window.fixture.app.history.navigate('/c'));
  await settled(page, 'c');
  await expect(page.locator('link[rel=stylesheet]')).toHaveCount(1);
  await page.evaluate(() => {
    const errors: string[] = [];
    window.fixture.app.onError = error => errors.push(String(error));
    Object.assign(window, { transitionErrors: errors });
    window.fixture.app.history.navigate('/badhead');
  });
  await expect.poll(() => page.evaluate(() => (window as unknown as { transitionErrors: string[] }).transitionErrors.length)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.fixture.app.loading.value)).toBe(false);
  await expect(page.locator('h1')).toHaveText('c');
  await expect(page.locator('link[rel=stylesheet]')).toHaveAttribute('href', '/style/c.css');
});

test('a stale mount disposer cannot unmount a replacement mount', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const oldStop = await window.fixture.app.render();
    const currentStop = await window.fixture.app.render();
    oldStop();
    Object.assign(window, { currentStop });
  });
  expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(1);
  await page.getByRole('button').click();
  await expect(page.getByRole('button')).toHaveText('1');
  await page.evaluate(() => (window as unknown as { currentStop(): void }).currentStop());
  expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(0);
});

test('failed body commits restore the committed page and metadata and release page resources', async ({ page }) => {
  await ready(page);
  for (const failure of ['badcommit', 'badready', 'badheadready']) {
    await page.evaluate(path => {
      const errors: string[] = [];
      window.fixture.app.onError = error => errors.push(String(error));
      Object.assign(window, { commitErrors: errors });
      window.fixture.app.history.navigate(path);
    }, `/${failure}`);
    await expect.poll(() => page.evaluate(() => (window as unknown as { commitErrors: string[] }).commitErrors.length)).toBe(1);
    await expect.poll(() => page.evaluate(() => window.fixture.app.loading.value)).toBe(false);
    await expect(page.locator('h1')).toHaveText('a');
    await expect(page).toHaveTitle('Route a');
    await expect(page.locator('link[rel=stylesheet]')).toHaveAttribute('href', '/style/a.css');
    expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(1);
    expect(await page.evaluate(() => window.fixture.metrics.pages)).toBe(1);
  }
  await page.evaluate(() => window.fixture.app.dispose());
  expect(await page.evaluate(() => window.fixture.metrics.pages)).toBe(0);
  await page.evaluate(() => window.dispatchEvent(new Event('page-resource')));
  expect(await page.evaluate(() => window.fixture.metrics.pageEvents)).toBe(0);
});

for (const [name, endpoint] of [['slowcommit', '/commit-gate'], ['slowready', '/ready-gate']] as const) {
  test(`a newer navigation supersedes ${name} without stale content or retained bindings`, async ({ page }) => {
    let release!: () => void, started!: () => void;
    const blocked = new Promise<void>(resolve => { release = resolve; });
    const waiting = new Promise<void>(resolve => { started = resolve; });
    await page.route(`**${endpoint}`, async route => { started(); await blocked; await route.fulfill({ body: 'ok' }); });
    await ready(page);
    await page.evaluate(path => window.fixture.app.history.navigate(path), `/${name}`);
    await waiting;
    await page.evaluate(() => window.fixture.app.history.navigate('/c'));
    await settled(page, 'c');
    release();
    if (name === 'slowready') await expect.poll(() => page.evaluate(() => window.fixture.metrics.lateReadyReturned)).toBe(1);
    await expect(page.locator('h1')).toHaveText('c');
    await expect(page).toHaveTitle('Route c');
    expect(await page.evaluate(() => window.fixture.metrics.pages)).toBe(1);
    expect(await page.evaluate(() => window.fixture.metrics.live)).toBe(1);
    await page.getByRole('button').click();
    await expect(page.getByRole('button')).toHaveText('1');
  });
}

test('app disposal closes owned transports and attempts cleanup after an exception', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(() => {
    const closed: string[] = [];
    window.fixture.app.resources.own({ close() { closed.push('sse'); } });
    window.fixture.app.resources.own({ dispose() { closed.push('socket'); } });
    window.fixture.app.resources.defer(() => { throw new Error('cleanup failure'); });
    let error = '';
    try { window.fixture.app.dispose(); } catch (failure) { error = String(failure); }
    return { closed, error, live: window.fixture.metrics.live, pages: window.fixture.metrics.pages };
  });
  expect(result.closed).toEqual(['socket', 'sse']);
  expect(result.error).toContain('App disposal failed'); expect(result.live).toBe(0); expect(result.pages).toBe(0);
  await expect(page.locator('[data-yv]')).toHaveCount(0);
});

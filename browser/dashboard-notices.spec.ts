import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    __soft?: string;
    __dashboardFailNextSwap?: boolean;
  }
}

const demo = 'http://127.0.0.1:3852';

type Issues = {
  console: string[];
  pageErrors: string[];
  failedRequests: string[];
};

const issues = new WeakMap<Page, Issues>();

function issuesFor(page: Page): Issues {
  const bucket = issues.get(page);
  if (!bucket) throw new Error('Dashboard notice test instrumentation is missing.');
  return bucket;
}

function allowedFunnelLog(text: string) {
  // Chromium keeps the full Error detail here; Firefox collapses it to
  // "Yvee page transition failed Error". The exact notice copy is asserted in
  // the UI scenarios, so the funnel prefix is the stable cross-browser marker.
  return text.startsWith('Yvee page transition failed');
}

const noticeFor = (page: Page) => page.locator('.dashboard-notice');
const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Dashboard' });
const subnav = (page: Page) => page.getByRole('navigation', { name: 'Analytics' });

test.beforeEach(async ({ page }) => {
  const bucket: Issues = { console: [], pageErrors: [], failedRequests: [] };
  issues.set(page, bucket);
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.console.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    bucket.failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`));
});

test.afterEach(async ({ page }) => {
  const bucket = issuesFor(page);
  expect(
    bucket.console.filter((text) => !allowedFunnelLog(text)),
    'only dashboard funnel logs may reach the console',
  ).toEqual([]);
  expect(bucket.pageErrors, 'no uncaught page errors').toEqual([]);
  expect(bucket.failedRequests, 'no failed requests').toEqual([]);
});

async function ready(page: Page, path: string) {
  const response = await page.goto(`${demo}${path}`);
  expect(response?.status(), `SSR status for ${path}`).toBe(200);
  await expect(page.locator('body')).toHaveAttribute('data-yvee-ready', 'true', { timeout: 15_000 });
  await expect(page.locator('.dashboard-layout')).toBeVisible();
  await expect(page.locator('.dashboard-notice')).toHaveCount(1);
}

async function expectDecodedTab(page: Page, value: string) {
  await expect.poll(() =>
    page.evaluate(() => new URL(location.href).searchParams.get('tab')),
  ).toBe(value);
}

async function expectNotice(
  page: Page,
  tone: 'warning' | 'error' | 'success',
  message: string,
) {
  const notice = noticeFor(page);
  await expect(notice).toHaveCount(1);
  await expect(notice).toBeVisible();
  await expect(notice).toHaveClass(new RegExp(`dashboard-notice--${tone}`));
  await expect(notice).toHaveAttribute('role', tone === 'error' ? 'alert' : 'status');
  await expect(notice).toHaveAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  await expect(notice.locator('.dashboard-notice__message')).toHaveText(message);
}

async function expectIdleNotice(page: Page) {
  const notice = noticeFor(page);
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveClass(/dashboard-notice--idle/);
  await expect(notice).toHaveAttribute('hidden', '');
  await expect(notice).toBeHidden();
  await expect(notice.locator('.dashboard-notice__message')).toHaveText('');
}

test('direct load of failing URLs renders the full dashboard', async ({ page }) => {
  for (const path of [
    '/dashboard?tab=analytics/retention&fail=1',
    '/dashboard?tab=analytics/retention#fail',
  ]) {
    await ready(page, path);
    await expect(page.getByRole('heading', { level: 1, name: 'Cohorts that stick around.' })).toBeVisible();
    await expect(page.locator('.dashboard-layout')).toBeVisible();
    await expect(sidebar(page)).toBeVisible();
    await expect(page.locator('.dashboard-panel')).toBeVisible();
    await expect(subnav(page)).toBeVisible();
    await expectIdleNotice(page);

    const bucket = issuesFor(page);
    expect(bucket.console, `console errors for ${path}`).toEqual([]);
    expect(bucket.pageErrors, `page errors for ${path}`).toEqual([]);
    expect(bucket.failedRequests, `failed requests for ${path}`).toEqual([]);
  }
});

test('denial shows warning notice and stays on settings', async ({ page }) => {
  await ready(page, '/dashboard?tab=settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Make the workspace yours.' })).toBeVisible();
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');

  await sidebar(page).getByRole('link', { name: /Overview/ }).click();
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');
  await expectDecodedTab(page, 'settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Make the workspace yours.' })).toBeVisible();
  await expect(sidebar(page).getByRole('link', { name: /Settings/ })).toHaveAttribute('aria-current', 'page');
  await expect(noticeFor(page)).toHaveCount(1);
});

test('denial via history back shows warning and restores url', async ({ page }) => {
  await ready(page, '/dashboard?tab=overview');
  await sidebar(page).getByRole('link', { name: /Settings/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Make the workspace yours.' })).toBeVisible();
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');

  await page.goBack();
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');
  await expectDecodedTab(page, 'settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Make the workspace yours.' })).toBeVisible();
});

test('repeated denials do not stack notices', async ({ page }) => {
  await ready(page, '/dashboard?tab=settings');
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');

  let denials = 0;
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().startsWith('Yvee page transition failed')) denials++;
  });

  const overview = sidebar(page).getByRole('link', { name: /Overview/ });
  for (let index = 1; index <= 3; index++) {
    await overview.click();
    await expect.poll(() => denials).toBe(index);
    await expect(noticeFor(page)).toHaveCount(1);
    await expect(noticeFor(page)).toBeVisible();
  }
  await expect(noticeFor(page)).toHaveClass(/dashboard-notice--warning/);
});

test('no focus steal on denial', async ({ page }) => {
  await ready(page, '/dashboard?tab=settings');
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');

  const overview = sidebar(page).getByRole('link', { name: /Overview/ });
  await overview.focus();
  const before = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  expect(before).toBe('/dashboard?tab=overview');

  await page.keyboard.press('Enter');
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');
  const after = await page.evaluate(() => ({
    href: document.activeElement?.getAttribute('href'),
    insideNotice: Boolean(document.activeElement?.closest('.dashboard-notice')),
  }));
  expect(after.href).toBe(before);
  expect(after.insideNotice).toBe(false);
});

test('save shows success notice, auto-dismisses, then navigation succeeds', async ({ page }) => {
  await ready(page, '/dashboard?tab=settings');
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');
  await sidebar(page).getByRole('link', { name: /Overview/ }).click();
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');

  await page.getByRole('button', { name: 'Save draft' }).click();
  await expectNotice(page, 'success', 'Draft saved — you can switch tabs again.');
  await expect(noticeFor(page)).toBeHidden({ timeout: 7000 });
  await expect(noticeFor(page)).toHaveClass(/dashboard-notice--idle/);
  await expect(noticeFor(page).locator('.dashboard-notice__message')).toHaveText('');

  await sidebar(page).getByRole('link', { name: /Overview/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Operations at a glance.' })).toBeVisible();
  await expectDecodedTab(page, 'overview');
  await expectIdleNotice(page);
});

test('dismiss clears the notice', async ({ page }) => {
  await ready(page, '/dashboard?tab=settings');
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');
  await sidebar(page).getByRole('link', { name: /Overview/ }).click();
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');
  await noticeFor(page).getByRole('button', { name: 'Dismiss' }).click();
  await expectIdleNotice(page);

  await ready(page, '/dashboard?tab=analytics/overview');
  await page.getByRole('link', { name: 'Simulate a failed region swap' }).click();
  await expectNotice(page, 'error', 'Simulated region swap failure.');
  await noticeFor(page).getByRole('button', { name: 'Dismiss' }).click();
  await expectIdleNotice(page);
});

test('failed region swap rolls back and shows error notice', async ({ page }) => {
  await ready(page, '/dashboard?tab=analytics/overview');
  await expect(page.getByRole('heading', { level: 1, name: 'Traffic that pays attention.' })).toBeVisible();

  await page.evaluate(() => {
    window.__soft = 'sentinel';
    document.querySelector<HTMLElement>('.dashboard-layout')!.dataset.softMarker = 'kept';
  });

  let failures = 0;
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().startsWith('Yvee page transition failed')) failures++;
  });

  const failureLink = page.getByRole('link', { name: 'Simulate a failed region swap' });
  const retentionTab = subnav(page).getByRole('link', { name: 'Retention' });
  const overviewTab = subnav(page).getByRole('link', { name: 'Overview' });

  await failureLink.click();
  await expectNotice(page, 'error', 'Simulated region swap failure.');
  await expect.poll(async () => {
    const tab = await page.evaluate(() => new URL(location.href).searchParams.get('tab'));
    return tab === 'analytics' || tab === 'analytics/overview';
  }).toBe(true);
  await expect(page.getByRole('heading', { level: 1, name: 'Traffic that pays attention.' })).toBeVisible();
  await expect(overviewTab).toHaveAttribute('aria-current', 'page');
  await expect(overviewTab).toHaveClass(/dashboard-subnav__tab--active/);
  await expect(retentionTab).toHaveAttribute('aria-current', 'false');
  expect(await page.evaluate(() => window.__soft)).toBe('sentinel');
  expect(await page.locator('.dashboard-layout').getAttribute('data-soft-marker')).toBe('kept');
  expect(await page.evaluate(() => window.__dashboardFailNextSwap)).toBe(false);
  await expect(noticeFor(page)).toHaveCount(1);

  await failureLink.click();
  await expect.poll(() => failures).toBe(2);
  await expectNotice(page, 'error', 'Simulated region swap failure.');
  await expect(noticeFor(page)).toHaveCount(1);
  expect(await page.evaluate(() => window.__dashboardFailNextSwap)).toBe(false);
  expect(await page.evaluate(() => window.__soft)).toBe('sentinel');

  await retentionTab.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Cohorts that stick around.' })).toBeVisible();
  await expectDecodedTab(page, 'analytics/retention');
  await expectIdleNotice(page);
});

test('subnav active scheme regression', async ({ page }) => {
  await ready(page, '/dashboard?tab=analytics');
  let nav = subnav(page);
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveClass(/dashboard-subnav__tab--active/);
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Retention' })).toHaveAttribute('aria-current', 'false');
  await expect(sidebar(page).getByRole('link', { name: /Analytics/ })).toHaveAttribute('aria-current', 'page');
  await expect(sidebar(page).getByRole('link', { name: /Analytics/ })).toHaveClass(/dashboard-nav__tab--active/);

  await ready(page, '/dashboard?tab=analytics%2Fretention');
  nav = subnav(page);
  await expect(nav.getByRole('link', { name: 'Retention' })).toHaveClass(/dashboard-subnav__tab--active/);
  await expect(nav.getByRole('link', { name: 'Retention' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'false');
  await expect(sidebar(page).getByRole('link', { name: /Analytics/ })).toHaveAttribute('aria-current', 'true');
  await expect(sidebar(page).getByRole('link', { name: /Analytics/ })).toHaveClass(/dashboard-nav__tab--active/);
});

test('retention draft and scroll keep-state regression', async ({ page }) => {
  await ready(page, '/dashboard?tab=analytics/retention');
  const draft = page.locator('textarea[name="draft"]');
  await draft.fill('cohort draft');
  const nav = subnav(page);

  await nav.getByRole('link', { name: 'Overview' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Traffic that pays attention.' })).toBeVisible();
  await nav.getByRole('link', { name: 'Retention' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Cohorts that stick around.' })).toBeVisible();
  await expect(draft).toHaveValue('cohort draft');

  await page.getByRole('link', { name: 'Leave Analytics' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Operations at a glance.' })).toBeVisible();
  await sidebar(page).getByRole('link', { name: /Analytics/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Traffic that pays attention.' })).toBeVisible();
  await nav.getByRole('link', { name: 'Retention' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Cohorts that stick around.' })).toBeVisible();
  await expect(draft).toHaveValue('cohort draft');

  await nav.getByRole('link', { name: 'Overview' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Traffic that pays attention.' })).toBeVisible();
  const table = page.locator('[data-scroll-key="analytics-route-table"]');
  await expect(table).toBeVisible();
  await expect.poll(() => table.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await table.evaluate((element) => { element.scrollTop = 180; });
  await expect.poll(() => table.evaluate((element) => element.scrollTop)).toBe(180);

  await nav.getByRole('link', { name: 'Retention' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Cohorts that stick around.' })).toBeVisible();
  await nav.getByRole('link', { name: 'Overview' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Traffic that pays attention.' })).toBeVisible();
  await expect.poll(() => table.evaluate((element) => element.scrollTop), { timeout: 5000 }).toBe(180);
});

test('480px no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await ready(page, '/dashboard?tab=settings');
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');
  await sidebar(page).getByRole('link', { name: /Overview/ }).click();
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');

  const sizes = await page.evaluate(() => {
    const doc = document.documentElement;
    const notice = document.querySelector<HTMLElement>('.dashboard-notice')!;
    return {
      docOverflow: doc.scrollWidth - doc.clientWidth,
      noticeOverflow: notice.scrollWidth - notice.clientWidth,
      noticeWrap: getComputedStyle(notice).flexWrap,
    };
  });
  expect(sizes.docOverflow).toBeLessThanOrEqual(1);
  expect(sizes.noticeOverflow).toBeLessThanOrEqual(1);
  expect(sizes.noticeWrap).toBe('wrap');
});

test('session console and network sweep', async ({ page }) => {
  await ready(page, '/dashboard?tab=settings');
  await page.locator('textarea[name="draft"]').fill('unsaved demo draft');
  await sidebar(page).getByRole('link', { name: /Overview/ }).click();
  await expectNotice(page, 'warning', 'Unsaved draft in Settings — clear it to leave.');
  await noticeFor(page).getByRole('button', { name: 'Dismiss' }).click();

  await page.getByRole('button', { name: 'Save draft' }).click();
  await expectNotice(page, 'success', 'Draft saved — you can switch tabs again.');

  await ready(page, '/dashboard?tab=analytics/overview');
  await page.getByRole('link', { name: 'Simulate a failed region swap' }).click();
  await expectNotice(page, 'error', 'Simulated region swap failure.');

  const bucket = issuesFor(page);
  expect(bucket.console.filter((text) => !allowedFunnelLog(text)), 'only funnel logs').toEqual([]);
  expect(bucket.pageErrors, 'no uncaught page errors').toEqual([]);
  expect(bucket.failedRequests, 'no failed requests').toEqual([]);
});

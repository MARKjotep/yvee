import { test, expect } from '@playwright/test';

test('route commits move focus and announce the new title; reduced motion disables smooth route scrolling', async ({ page }) => {
  await page.goto('/a');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'yes');
  await page.getByText('Go B', { exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('[data-route-status="fixture"]')).toHaveText('Route b');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options?: ScrollIntoViewOptions) {
      Object.assign(window, { routeScrollBehavior: document.documentElement.style.scrollBehavior });
      return original.call(this, options);
    };
    window.fixture.app.history.navigate('/c#fixture-anchor');
  });
  await expect(page.locator('#fixture-anchor')).toBeFocused();
  expect(await page.evaluate(() => (window as Window & { routeScrollBehavior?: string }).routeScrollBehavior)).toBe('auto');
  await expect(page.locator('[data-route-status="fixture"]')).toHaveText('Route c');
});

test('records list rendering and route transition baselines', async ({ page }) => {
  await page.goto('/a');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'yes');

  const routeSamples: number[] = [];
  for (const [path, heading] of [['/large', 'large'], ['/a', 'a'], ['/large', 'large'], ['/a', 'a'], ['/large', 'large']] as const) {
    await page.evaluate(() => { Object.assign(window, { priority3Start: performance.now() }); });
    await page.evaluate(pathname => window.fixture.app.history.navigate(pathname), path);
    await expect(page.locator('h1')).toHaveText(heading);
    await expect.poll(() => page.evaluate(() => window.fixture.app.loading.value)).toBe(false);
    routeSamples.push(await page.evaluate(() => performance.now() - (window as unknown as { priority3Start: number }).priority3Start));
  }

  await expect(page.locator('li')).toHaveCount(500);
  await page.locator('li').first().evaluate(node => Object.assign(window, { coarseFirst: node }));
  const updateMs = await page.evaluate(async () => {
    window.fixture.replaceLargeItems(500, 250);
    const start = performance.now();
    await window.fixture.largeItems.flush();
    return performance.now() - start;
  });
  await expect(page.locator('li')).toHaveCount(500);
  await expect(page.locator('li').nth(250)).toHaveText('Updated item 250');
  const coarseRetained = await page.evaluate(() => window.coarseFirst === document.querySelector('li'));

  await page.evaluate(() => window.fixture.app.history.navigate('/large-fine'));
  await expect(page.locator('h1')).toHaveText('large-fine');
  await expect(page.locator('li')).toHaveCount(500);
  await page.locator('li').first().evaluate(node => Object.assign(window, { fineFirst: node }));
  await page.locator('li').nth(250).evaluate(node => Object.assign(window, { fineTarget: node }));
  const fineUpdateMs = await page.evaluate(async () => {
    window.fixture.replaceFineItem(250);
    const start = performance.now();
    await window.fixture.largeFineRows[250]!.flush();
    return performance.now() - start;
  });
  await expect(page.locator('li').nth(250)).toHaveText('Updated item 250');
  const fineRetained = await page.evaluate(() => ({
    first: window.fineFirst === document.querySelector('li'),
    target: window.fineTarget === document.querySelectorAll('li')[250],
  }));

  const sorted = [...routeSamples].sort((a, b) => a - b);
  const medianRouteMs = sorted[2]!;
  console.log(`Priority 3 baseline (${page.context().browser()?.browserType().name()}): 500-row route median ${medianRouteMs.toFixed(1)}ms; whole-list single-item update ${updateMs.toFixed(1)}ms (unchanged node retained: ${coarseRetained}); per-row binding update ${fineUpdateMs.toFixed(1)}ms (unchanged/updated li retained: ${fineRetained.first}/${fineRetained.target})`);
});

import { test, expect } from '@playwright/test';
import type {} from './lifecycle.spec';

// Each case uses actual SSR HTML and the client update path under a real CSP.
test('hostile data stays text and nonce-authorized scripts/styles work after navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Object.assign(window, { cspViolations: [] });
    document.addEventListener('securitypolicyviolation', event => {
      (window as unknown as { cspViolations: string[] }).cspViolations.push(event.violatedDirective);
    });
  });
  await page.goto('/security?csp');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'yes');
  expect(await page.evaluate(() => window.fixture.reused)).toBe(true);
  await expect(page.locator('.hostile')).toHaveText('<img src=x onerror="globalThis.injected=true"></script>');
  await expect(page.locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(document.getElementById('bootstrap')!.textContent!).text)).toContain('</script>');
  expect(await page.evaluate(() => (window as unknown as { trustedRuns: number }).trustedRuns)).toBeGreaterThan(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fixture-trusted').trim())).toBe('yes');
  await page.evaluate(() => { window.fixture.reactiveText.value = '<img src=x onerror=alert(1)>'; window.fixture.reactiveURL.value = 'https://example.com/safe?a=1&b=2'; });
  await expect(page.locator('.reactive')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('meta[name=reactive]')).toHaveAttribute('content', '<img src=x onerror=alert(1)>');
  await expect(page.locator('.reactive-url')).toHaveAttribute('href', 'https://example.com/safe?a=1&b=2');
  await page.evaluate(() => window.fixture.app.history.navigate('/c'));
  await expect(page.locator('h1')).toHaveText('c');
  await expect.poll(() => page.evaluate(() => window.fixture.app.loading.value)).toBe(false);
  await expect(page.locator('[data-yv]')).not.toHaveCount(0);
  expect(await page.evaluate(() => Array.from(document.querySelectorAll<HTMLStyleElement>('style[data-yv]')).every(node => Boolean(node.nonce)))).toBe(true);
  expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations)).toEqual([]);
  expect(errors).toEqual([]);
});

test('reactive URL rejection leaves the previously safe DOM attribute intact', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/security');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'yes');
  await page.evaluate(() => { window.fixture.reactiveURL.value = 'java\nscript:alert(1)'; });
  await expect.poll(() => page.evaluate(() => window.fixture.stateErrors)).toHaveLength(1);
  expect(await page.evaluate(() => window.fixture.stateErrors[0])).toContain('Unsupported URL scheme');
  const failure = await page.evaluate(() => window.fixture.reactiveURL.flush().then(() => '', error => String(error)));
  expect(failure).toContain('Unsupported URL scheme');
  expect(errors).toEqual([]);
  await expect(page.locator('.reactive-url')).toHaveAttribute('href', '/safe');
  expect(await page.evaluate(() => 'injected' in window)).toBe(false);
});

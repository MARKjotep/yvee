import { test, expect } from '@playwright/test';

test('Bun sample navigates through its persistent navigation links', async ({ page }) => {
  const baseURL = test.info().project.use.baseURL as string;
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-yvee-ready', 'true');
  await expect(page.locator('head script[src="/client/index.js"]')).toHaveCount(1);
  await page.evaluate(() => Object.assign(window, { sampleSession: 'preserved' }));
  for (const [label, path, heading] of [['Features', '/features', 'Features route'], ['Studio', '/studio', 'Make room for better ideas.'], ['SSR data', '/metadata', 'One request, two runtimes.']] as const) {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByText(label, { exact: true }).click();
    await expect(page).toHaveURL(new URL(path, baseURL).href);
    await expect(page.locator('h1')).toContainText(heading, { timeout: 12_000 });
    await expect(page.locator('head script[src="/client/index.js"]')).toHaveCount(1);
    expect(await page.evaluate(() => (window as unknown as { sampleSession?: string }).sampleSession)).toBe('preserved');
  }
  expect(errors).toEqual([]);
});

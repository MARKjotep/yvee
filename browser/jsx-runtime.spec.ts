import { test, expect } from '@playwright/test';

test('automatic JSX renders a component file with no yvee imports in the browser', async ({ page }) => {
  await page.goto('/jsx-runtime');
  await expect(page.locator('body')).toHaveAttribute('data-yvee-ready', 'true');

  const probe = page.locator('article[data-jsx-probe="automatic"]');
  await expect(probe.getByRole('heading', { name: 'automatic' })).toBeVisible();
  await expect(probe.locator('p')).toHaveText('child');

  const items = page.locator('article[data-jsx-probe="automatic"] + ul li');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toHaveText('one');
  await expect(items.nth(1)).toHaveText('two');
});

import { expect, test } from '@playwright/test';

test('home keeps code examples within the viewport and the live demo usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await page.getByRole('button', { name: 'Run checks', exact: true }).click();
  await expect(
    page.getByText('Example run complete. All checks passed.', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Explore component families' })
    .getByRole('link')
    .first()
    .focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/docs\/components\/conversation$/);
});

test('design language is searchable and survives a direct load', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search documentation' }).click();
  await page
    .getByRole('combobox', { name: 'Search components and guides' })
    .fill('Design language');
  await page.getByRole('option', { name: 'Design language' }).click();
  await expect(page).toHaveURL(/\/docs\/design-language$/);
  await page.reload();
  await expect(page).toHaveTitle('Design language · Burtson UI');
  await expect(
    page.getByRole('heading', { name: 'One foundation. Distinct identities.' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

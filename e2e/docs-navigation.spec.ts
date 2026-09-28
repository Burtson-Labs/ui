import { expect, type Page, test } from '@playwright/test';

// Most visual smoke checks disable motion. Keep it enabled here: WebKit can
// interrupt a smooth scroll when a route changes and a modal releases focus.
test.use({ reducedMotion: 'no-preference' });

async function openReference(page: Page) {
  await page.goto('/docs/components/button');
  await page.getByRole('button', { name: 'Get started', exact: true }).waitFor();
  await page.getByRole('link', { name: 'API reference', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'API reference', exact: true })).toBeInViewport();
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).not.toBeInViewport();
}

async function expectPreview(page: Page, title: string) {
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeInViewport();
  await expect(page.getByRole('tabpanel', { name: 'Preview', exact: true })).toBeInViewport({
    ratio: 0.9,
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(new URL(page.url()).hash).toBe('');
}

test('mobile navigation opens the next component at its preview', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the navigation sheet is mobile-only');
  await openReference(page);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).tap();
  const menu = page.getByRole('dialog');
  await menu.getByRole('link', { name: 'Card', exact: true }).tap();
  await expect(menu).toBeHidden();
  await expectPreview(page, 'Card');
});

test('selecting the current component returns from API reference to its preview', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'the navigation sheet is mobile-only');
  await openReference(page);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).tap();
  const menu = page.getByRole('dialog');
  await menu.getByRole('link', { name: 'Button', exact: true }).tap();
  await expect(menu).toBeHidden();
  await expectPreview(page, 'Button');
});

test('search opens a component preview after reading an API reference', async ({ page }) => {
  await openReference(page);
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click();
  const search = page.getByRole('dialog');
  await search.getByRole('combobox').fill('spinner');
  await search.getByRole('option', { name: /^Spinner/ }).click();
  await expect(search).toBeHidden();
  await expectPreview(page, 'Spinner');
});

test('next-component links show the preview instead of retaining a deep scroll', async ({
  page,
}) => {
  await openReference(page);
  await page.getByRole('link', { name: 'Card →', exact: true }).click();
  await expectPreview(page, 'Card');
});

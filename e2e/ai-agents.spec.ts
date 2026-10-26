import { expect, test } from '@playwright/test';

test('the AI agents guide renders and is linked from the docs nav', async ({ page, isMobile }) => {
  await page.goto('/docs/installation');
  if (isMobile) await page.getByRole('button', { name: 'Open navigation', exact: true }).tap();
  await page.getByRole('link', { name: 'Use with AI agents', exact: true }).first().click();
  await expect(page).toHaveURL(/\/docs\/ai-agents$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Use with AI agents' })).toBeVisible();
  await expect(page.getByText('npx shadcn@latest mcp init --client claude')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('llms files and component Markdown are served at the site root', async ({ request }) => {
  const index = await request.get('/llms.txt');
  expect(index.ok()).toBe(true);
  expect(await index.text()).toContain('# Burtson UI');
  const full = await request.get('/llms-full.txt');
  expect(await full.text()).toContain('## Button');
  const md = await request.get('/docs/components/button.md');
  expect(await md.text()).toMatch(/^# Button\n/);
  // vite preview falls back to the root page; nginx serves <route>/index.html.
  const html = await (await request.get('/docs/components/button/index.html')).text();
  expect(html).toContain(
    '<link rel="alternate" type="text/markdown" href="/docs/components/button.md"',
  );
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/docs/ai-agents</loc>');
});

test('a component page copies its docs as Markdown', async ({ page, context, isMobile }) => {
  test.skip(isMobile, 'clipboard permissions are a desktop Chromium check');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/docs/components/button');
  await page.getByRole('button', { name: 'Copy as Markdown' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^# Button\n/);
});

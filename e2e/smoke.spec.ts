import { expect, type Page, test } from '@playwright/test';

import { components } from '../site/src/docs';
import { SECTIONS } from '../site/src/matrix';

/*
 * What the unit tests cannot see: layout, hit areas, real focus and real
 * touch emulation. Runs against the built docs site (see playwright.config).
 */

const CONTROLS =
  'a[href], button, input:not([type=hidden]), select, textarea, [role=checkbox], [role=switch], [role=radio], [role=tab], [role=slider], [role=combobox], [tabindex="0"]';

// Inline text links and desktop-only strips are not touch targets (WCAG 2.5.8
// exempts inline links; the editor tab strip is an IDE component).
const TOUCH_EXEMPT =
  '[data-variant=link], [data-slot=breadcrumb], [data-slot=markdown], [data-slot=error-summary] a, [data-slot=source-citation], [data-slot=source-list] a, [data-slot=editor-tabs], [data-slot=table-container], [data-slot=conversation] [role=log], [data-slot=scroll-area-viewport], [data-slot=tabs-content], [data-slot=resize-handle], [data-slot=data-table] tbody tr';
// Composite containers whose items are the targets (Radix gives the group a
// tabindex that hands focus straight to an item).
const NOT_A_TARGET = '[role=tablist], [role=menubar], [role=toolbar], [role=radiogroup]';
// A control whose hit area is the box around it.
const HOSTED = '[data-slot=number-input], [data-slot=search-input]';

const matrix = (section: string, extra = '') => `/matrix?section=${section}${extra}`;

async function ready(page: Page) {
  await page.waitForSelector('[data-matrix-section]');
  await page.evaluate(() => document.fonts.ready);
}

test.describe('touch targets', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch project only');
  for (const section of SECTIONS) {
    test(`every control in ${section} is at least 44px tall to a touch`, async ({ page }) => {
      await page.goto(matrix(section));
      await ready(page);
      const small = await page.evaluate(
        ({ CONTROLS, TOUCH_EXEMPT, NOT_A_TARGET, HOSTED }) => {
          const out: string[] = [];
          const px = (v: string) => parseFloat(v) || 0;
          for (const el of document.querySelectorAll<HTMLElement>(CONTROLS)) {
            if (el.closest(TOUCH_EXEMPT) || el.matches(NOT_A_TARGET)) continue;
            if (el.matches('[disabled], [aria-disabled="true"]')) continue;
            const r = (el.closest(HOSTED) ?? el).getBoundingClientRect();
            // Visually hidden focus proxies (a toast viewport's) are not targets.
            if (r.width <= 2 || r.height <= 2) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || el.closest('[aria-hidden="true"]')) continue;
            // An invisible hit area (::before / ::after, absolute) counts.
            let { width, height } = r;
            for (const pseudo of ['::before', '::after'] as const) {
              const ps = getComputedStyle(el, pseudo);
              if (ps.position !== 'absolute' || ps.content === 'none') continue;
              const w = px(ps.width);
              const h = px(ps.height);
              if (w && h) {
                width = Math.max(width, w);
                height = Math.max(height, h);
              } else if (ps.inset === '0px' || (ps.top === '0px' && ps.bottom === '0px')) {
                // Covers the positioned ancestor (a card's open button).
                const host = el.offsetParent as HTMLElement | null;
                if (host) {
                  const hr = host.getBoundingClientRect();
                  width = Math.max(width, hr.width);
                  height = Math.max(height, hr.height);
                }
              }
            }
            if (height < 44 || width < 24) {
              const cell = el.closest('[data-matrix-cell]')?.getAttribute('data-matrix-cell');
              out.push(
                `${cell}: <${el.tagName.toLowerCase()} ${el.dataset.slot ?? el.getAttribute('role') ?? ''}> "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 24)}" ${Math.round(width)}×${Math.round(height)}`,
              );
            }
          }
          return out;
        },
        { CONTROLS, TOUCH_EXEMPT, NOT_A_TARGET, HOSTED },
      );
      expect(small, small.join('\n')).toEqual([]);
    });
  }
});

test.describe('focus is visible', () => {
  for (const section of ['actions', 'fields', 'navigation', 'surfaces', 'data', 'chat']) {
    test(`every control in ${section} shows keyboard focus`, async ({ page }) => {
      await page.goto(matrix(section));
      await ready(page);
      // One real keypress puts the page in keyboard modality, so programmatic
      // focus() afterwards counts as :focus-visible.
      await page.keyboard.press('Tab');
      const missing = await page.evaluate((CONTROLS) => {
        const out: string[] = [];
        (document.activeElement as HTMLElement | null)?.blur();
        const HOSTS =
          '[data-slot=command], [data-slot=data-table-card], [data-slot=checkbox-card], [data-slot=radio-card], [data-slot=composer], [data-slot=number-input]';
        const signature = (el: Element) => {
          const cs = getComputedStyle(el);
          return [
            cs.outlineStyle,
            cs.outlineWidth,
            cs.outlineColor,
            cs.boxShadow,
            cs.borderColor,
            cs.backgroundColor,
            cs.color,
          ].join('|');
        };
        for (const el of document.querySelectorAll<HTMLElement>(CONTROLS)) {
          if (el.matches('[disabled], [aria-disabled="true"], [tabindex="-1"]')) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || el.closest('[aria-hidden="true"]')) continue;
          if (el.matches('input[type=range]')) continue; // the thumb draws it; not measurable here
          const host = el.closest<HTMLElement>(HOSTS);
          const before = signature(el);
          const hostBefore = host ? signature(host) : '';
          el.focus({ preventScroll: true });
          if (document.activeElement !== el) continue;
          const changed =
            signature(el) !== before || (host ? signature(host) !== hostBefore : false);
          el.blur();
          if (!changed) {
            const cell = el.closest('[data-matrix-cell]')?.getAttribute('data-matrix-cell');
            out.push(
              `${cell}: <${el.tagName.toLowerCase()} ${el.dataset.slot ?? el.getAttribute('role') ?? ''}> "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 24)}"`,
            );
          }
        }
        return out;
      }, CONTROLS);
      expect(missing, missing.join('\n')).toEqual([]);
    });
  }
});

test.describe('data table', () => {
  test('columns with card slots become cards on a phone; a plain table stays a table', async ({
    page,
    isMobile,
  }) => {
    await page.goto(matrix('data'));
    await ready(page);
    const members = page.locator('[data-matrix-cell="DataTable"] [data-slot=data-table]');
    const numbers = page.locator('[data-matrix-cell="DataTable/numeric"] [data-slot=data-table]');
    await expect(members).toHaveAttribute('data-layout', isMobile ? 'cards' : 'table');
    await expect(numbers).toHaveAttribute('data-layout', 'table');
    if (isMobile) {
      // The numeric table scrolls sideways inside a named region and says so.
      const region = numbers.getByRole('region', { name: 'Run counts' });
      await expect(region).toHaveAttribute('data-overflow', /end|both/);
      await expect(numbers.locator('[data-slot=table-overflow-hint]')).toBeVisible();
      // Paging moves between pages of cards.
      const first = members.getByRole('article').first();
      await expect(first).toHaveAccessibleName('Ada Lovelace');
      await members.getByRole('button', { name: 'Next page' }).click();
      await expect(members.getByRole('article').first()).toHaveAccessibleName('Barbara Liskov');
    } else {
      const header = members.getByRole('button', { name: 'Runs' });
      await header.click();
      await expect(members.getByRole('columnheader', { name: 'Runs' })).toHaveAttribute(
        'aria-sort',
        'ascending',
      );
    }
  });
});

test.describe('overlays on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch project only');
  test('a dialog with mobile="sheet" docks to the bottom edge', async ({ page }) => {
    await page.goto(matrix('overlays', '&open=dialog-sheet'));
    const dialog = page.getByRole('dialog', { name: 'Invite people' });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    const height = await page.evaluate(() => window.innerHeight);
    expect(box!.x).toBe(0);
    expect(box!.width).toBe(390);
    expect(Math.round(box!.y + box!.height)).toBe(height);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
  test('a bottom sheet fills the width with its close button 44px', async ({ page }) => {
    await page.goto(matrix('overlays', '&open=sheet-right'));
    const sheet = page.getByRole('dialog', { name: 'Workspace settings' });
    await expect(sheet).toBeVisible();
    const close = sheet.getByRole('button', { name: 'Close' });
    const box = await close.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('pickers open and take the keyboard', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop project only');
  test('Select opens with Enter, Combobox filters as you type', async ({ page }) => {
    await page.goto(matrix('fields'));
    await ready(page);
    const trigger = page.locator('[data-matrix-cell="Select"] [data-slot=select-trigger]').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(page.getByRole('option', { name: 'gemma4:e4b' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(listbox).toBeHidden();
    await expect(trigger).toHaveText(/qwen3:8b/);

    const combobox = page.getByRole('combobox', { name: 'Pick a person' });
    await combobox.click();
    const search = page.getByPlaceholder('Search…');
    await expect(search).toBeFocused();
    await search.fill('grace');
    await expect(page.getByRole('option', { name: /Grace Hopper/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Ada Lovelace/ })).toBeHidden();
    await page.keyboard.press('Enter');
    await expect(combobox).toHaveText(/Grace Hopper/);
  });
  test('⌘K opens the docs search and Enter goes to the page', async ({ page }) => {
    await page.goto('/docs/components/button');
    await page.keyboard.press('ControlOrMeta+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.type('data table');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/docs\/components\/data-table$/);
  });
});

test.describe('docs pages', () => {
  for (const c of components) {
    test(`${c.name} renders without horizontal overflow or errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      await page.goto(`/docs/components/${c.name}`);
      await page.getByRole('heading', { level: 1, name: c.title }).waitFor();
      await expect(page.getByRole('status', { name: /Loading preview/ })).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - window.innerWidth,
        main: (() => {
          const m = document.getElementById('main');
          return m ? m.scrollWidth - m.clientWidth : 0;
        })(),
      }));
      expect(overflow.doc, 'document scrolls sideways').toBeLessThanOrEqual(0);
      expect(overflow.main, 'main scrolls sideways').toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
  for (const section of SECTIONS) {
    test(`matrix ${section} has no horizontal overflow`, async ({ page }) => {
      await page.goto(matrix(section));
      await ready(page);
      const doc = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(doc).toBeLessThanOrEqual(0);
    });
  }
});

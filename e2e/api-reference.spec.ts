import { expect, test } from '@playwright/test';

/**
 * The API reference tables used min-w-* / max-w-* on their <td>s. In
 * table-layout:auto a cell's min-width raises the whole COLUMN's minimum while
 * its max-width is all but ignored, so those classes pushed the table's
 * intrinsic width past its container: the columns were squeezed and long type
 * signatures and descriptions painted outside their cell, past the card's
 * border. Fixed layout with a colgroup wraps inside the cell instead.
 *
 * Checkbox Card is the page it was reported on — 8 documented props plus 287
 * inherited ones, with descriptions long enough to be the worst case.
 */
const PAGE = '/docs/components/checkbox-card';

async function openApiReference(page: import('@playwright/test').Page) {
  await page.goto(PAGE);
  const section = page.locator('#api-reference');
  await section.scrollIntoViewIfNeeded();
  // Each export is a <details>; open them all so every table has layout.
  for (const d of await section.locator('details').all()) {
    await d.evaluate((el: HTMLDetailsElement) => {
      el.open = true;
    });
  }
  await expect(section.locator('table').first()).toBeVisible();
  return section;
}

test.describe('API reference tables', () => {
  test('no table is wider than the card that holds it', async ({ page }) => {
    const section = await openApiReference(page);
    const bad = await section.evaluate((root) => {
      const out: string[] = [];
      root.querySelectorAll('table').forEach((table, i) => {
        // The bordered, rounded wrapper is the visual card edge.
        const wrap = table.closest('.overflow-x-auto');
        if (!wrap) return;
        // scrollWidth > clientWidth means the wrapper scrolls. That is allowed
        // (it is why overflow-x-auto is there) but only below the table's
        // declared min width; at desktop width it must fit.
        if (table.getBoundingClientRect().width > wrap.clientWidth + 1) {
          out.push(
            `table ${i}: ${Math.round(table.getBoundingClientRect().width)}px in a ${wrap.clientWidth}px wrapper`,
          );
        }
      });
      return out;
    });
    expect(bad, bad.join('\n')).toEqual([]);
  });

  test('no cell paints outside its own column', async ({ page }) => {
    const section = await openApiReference(page);
    const bad = await section.evaluate((root) => {
      const out: string[] = [];
      root.querySelectorAll('table tbody tr').forEach((row, r) => {
        row.querySelectorAll('th, td').forEach((cell, c) => {
          const box = cell.getBoundingClientRect();
          for (const child of Array.from(cell.children)) {
            const cb = child.getBoundingClientRect();
            // 1px of tolerance for subpixel rounding.
            if (cb.right > box.right + 1) {
              out.push(
                `row ${r} cell ${c}: content ends at ${Math.round(cb.right)} but the cell ends at ${Math.round(box.right)} — "${(child.textContent || '').slice(0, 48)}"`,
              );
            }
          }
        });
      });
      return out.slice(0, 10);
    });
    expect(bad, bad.join('\n')).toEqual([]);
  });

  test('the page itself never scrolls sideways', async ({ page }) => {
    await openApiReference(page);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});

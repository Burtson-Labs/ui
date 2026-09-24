// Renders every docs demo: a smoke test that each component mounts with
// realistic props and that interactive ones expose an accessible name.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import { components } from '../site/src/docs';

const demos = import.meta.glob<{ default: ComponentType }>('../site/src/demos/*.tsx', {
  eager: true,
});

describe('docs demos', () => {
  it('has a demo for every documented component, and docs for every demo', () => {
    for (const c of components) expect(demos[`../site/src/demos/${c.name}.tsx`]).toBeDefined();
    const documented = new Set(components.map((c) => c.name));
    for (const path of Object.keys(demos)) {
      expect(documented, path).toContain(path.split('/').pop()?.replace('.tsx', ''));
    }
  });

  for (const [path, mod] of Object.entries(demos)) {
    it(`renders ${path.split('/').pop()}`, () => {
      const { container } = render(<mod.default />);
      expect(container.querySelector('[data-slot]')).not.toBeNull();
      for (const button of screen.queryAllByRole('button')) {
        expect(button.textContent?.trim() || button.getAttribute('aria-label')).toBeTruthy();
      }
    });
  }

  it('opens the dropdown menu demo from the keyboard', async () => {
    const Demo = demos['../site/src/demos/dropdown-menu.tsx']?.default;
    if (!Demo) throw new Error('missing demo');
    render(<Demo />);
    screen.getByRole('button', { name: 'Open menu' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('menuitem', { name: /Profile/ })).toBeTruthy();
  });
});

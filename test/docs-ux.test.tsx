import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AccentSwatches } from '../site/src/accent';
import { ComponentDetails } from '../site/src/component-details';
import { DocsSearch } from '../site/src/search';

describe('documentation interactions', () => {
  it('opens search with the keyboard and filters components', async () => {
    render(<DocsSearch />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: 'Search documentation' })).toBeTruthy();
    await userEvent.type(screen.getByRole('combobox'), 'combobox');
    expect(await screen.findByRole('option', { name: /Combobox/ })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Accordion/ })).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('keeps both accent pickers synchronized and supports arrow keys', async () => {
    document.documentElement.dataset.accent = 'ink';
    render(
      <>
        <AccentSwatches />
        <AccentSwatches />
      </>,
    );
    screen.getAllByRole('radio', { name: 'Ink' })[0]!.focus();
    await userEvent.keyboard('{ArrowRight}');
    for (const radio of screen.getAllByRole('radio', { name: 'Violet (Burtson)' }))
      expect(radio.getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.dataset.accent).toBe('violet');
    document.documentElement.dataset.accent = 'ink';
  });
  it('loads the real source only when it is requested', async () => {
    const { container } = render(<ComponentDetails name="progress" />);
    expect(container.querySelector('#component-source')?.textContent).toBe('');
    await userEvent.click(screen.getByRole('button', { name: 'View component source' }));
    await waitFor(() =>
      expect(container.querySelector('#component-source')?.textContent).toContain(
        'function Progress',
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Hide source' }));
    expect(container.querySelector('#component-source')?.hasAttribute('hidden')).toBe(true);
  });
});

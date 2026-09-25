import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ApiReference } from '../site/src/api-reference';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../src/index';

const root = join(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(join(root, 'vendor-manifest.json'), 'utf8')) as {
  packages: { package: string }[];
};
const expected = JSON.parse(
  readFileSync(join(root, 'audit/upstream-exports.json'), 'utf8'),
) as Record<string, string[]>;
const sources = import.meta.glob('../src/primitives/vendor/radix/*/index.ts');

describe('local primitive contract', () => {
  for (const entry of manifest.packages) {
    it(`preserves published runtime exports for ${entry.package}`, async () => {
      const load =
        sources[`../src/primitives/vendor/radix/${entry.package.split('/')[1]}/index.ts`];
      expect(load).toBeDefined();
      const actual = await load!();
      expect(Object.keys(actual as object).sort()).toEqual(expected[entry.package]);
    });
  }

  it('preserves cmdk exports while resolving its primitives locally', async () => {
    const actual = await import('../src/primitives/vendor/cmdk');
    expect(Object.keys(actual).sort()).toEqual(expected.cmdk);
  });

  it('returns focus correctly from a menu nested in a modal', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open workspace</Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Workspace</DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Rename</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Open workspace' });
    await user.click(trigger);
    const menuTrigger = screen.getByRole('button', { name: 'Actions' });
    await user.click(menuTrigger);
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.activeElement).toBe(menuTrigger));
    expect(screen.getByRole('dialog', { name: 'Workspace' })).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});

describe('generated API reference', () => {
  it('shows public and inherited props without leaving the component page', async () => {
    const user = userEvent.setup();
    render(<ApiReference name="composer" />);
    await waitFor(() => expect(document.getElementById('api-Composer')).toBeTruthy());
    const reference = within(document.getElementById('api-Composer')!);
    expect(reference.getByText('onSubmit')).toBeTruthy();
    expect(reference.getByText('(text: string) => void | Promise<void>')).toBeTruthy();
    await user.click(reference.getByText(/Inherited HTML and React props/));
    expect(await reference.findByText('aria-label')).toBeTruthy();
  });
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  Badge,
  Button,
  buttonVariants,
  Checkbox,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Label,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@burtson-labs/ui';

describe('cn', () => {
  it('lets later Tailwind utilities win', () => {
    const hidden = false;
    expect(cn('px-2 text-sm', 'px-4', hidden && 'hidden')).toBe('text-sm px-4');
  });
});

describe('Button', () => {
  it('renders a button with variant classes and a data-slot', () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.dataset.slot).toBe('button');
    expect(btn.className).toContain('bg-destructive');
  });

  it('merges props onto its child with asChild', () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.className).toContain('bg-primary');
  });

  it('exposes its variants for links styled as buttons', () => {
    expect(buttonVariants({ variant: 'outline', size: 'sm' })).toContain('border-border-strong');
  });
});

describe('form controls', () => {
  it('toggles a checkbox through its label', async () => {
    render(
      <Label>
        <Checkbox /> Scrub env
      </Label>,
    );
    const box = screen.getByRole('checkbox', { name: 'Scrub env' });
    expect(box.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(screen.getByText('Scrub env'));
    expect(box.getAttribute('aria-checked')).toBe('true');
  });

  it('switches on click', async () => {
    render(<Switch aria-label="Sandbox" />);
    const sw = screen.getByRole('switch', { name: 'Sandbox' });
    await userEvent.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });
});

describe('overlays and navigation', () => {
  it('opens a dialog with an accessible name and a close button', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Rename agent</DialogTitle>
          <DialogDescription>Shown in logs.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Rename agent' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('switches tabs with the keyboard', async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    screen.getByRole('tab', { name: 'A' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel B');
  });
});

describe('display', () => {
  it('labels the spinner for screen readers', () => {
    render(<Spinner label="Pulling model" />);
    expect(screen.getByRole('status', { name: 'Pulling model' })).toBeTruthy();
  });

  it('renders badge variants', () => {
    render(<Badge variant="success">Passing</Badge>);
    expect(screen.getByText('Passing').className).toContain('text-success');
  });
});

describe('CommandDialog', () => {
  it('filters items as you type and names the dialog', async () => {
    const { CommandDialog, CommandInput, CommandItem, CommandList } =
      await import('@burtson-labs/ui');
    render(
      <CommandDialog open title="Go to">
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>Loads</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.getByRole('dialog', { name: 'Go to' })).toBeTruthy();
    await userEvent.type(screen.getByPlaceholderText('Search'), 'set');
    expect(screen.queryByText('Loads')).toBeNull();
    expect(screen.getByText('Settings')).toBeTruthy();
  });
});

describe('vNext patterns', () => {
  it('disables a loading button and marks it busy', async () => {
    const { Button: B } = await import('@burtson-labs/ui');
    render(<B loading>Deploy</B>);
    const btn = screen.getByRole('button', { name: 'Deploy' });
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('keeps asChild working while loading', async () => {
    const { Button: B } = await import('@burtson-labs/ui');
    render(
      <B asChild loading>
        <a href="/runs">Runs</a>
      </B>,
    );
    expect(screen.getByRole('link', { name: 'Runs' })).toBeTruthy();
  });

  it('names icon buttons from their label', async () => {
    const { IconButton } = await import('@burtson-labs/ui');
    render(
      <IconButton label="Open terminal">
        <svg />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Open terminal' })).toBeTruthy();
  });

  it('announces field errors', async () => {
    const { Field, FieldError, FieldLabel, Input } = await import('@burtson-labs/ui');
    render(
      <Field>
        <FieldLabel htmlFor="u">URL</FieldLabel>
        <Input id="u" aria-invalid />
        <FieldError>Nothing answered.</FieldError>
      </Field>,
    );
    expect(screen.getByRole('alert').textContent).toBe('Nothing answered.');
    expect(screen.getByLabelText('URL')).toBeTruthy();
  });

  it('marks selected table rows and right-aligns numeric cells', async () => {
    const { Table, TableBody, TableCell, TableRow } = await import('@burtson-labs/ui');
    render(
      <Table density="compact" stickyHeader>
        <TableBody>
          <TableRow selected>
            <TableCell>run-1</TableCell>
            <TableCell numeric>2m 14s</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = screen.getByRole('row');
    expect(row.getAttribute('data-state')).toBe('selected');
    expect(screen.getByText('2m 14s').className).toContain('text-right');
  });

  it('adds new badge variants without dropping secondary', async () => {
    const { badgeVariants } = await import('@burtson-labs/ui');
    expect(badgeVariants({ variant: 'info' })).toContain('text-info');
    expect(badgeVariants({ variant: 'secondary' })).toContain('bg-surface-muted');
  });
});

describe('site components', () => {
  it('opens a navigation menu panel from its trigger', async () => {
    const {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
    } = await import('@burtson-labs/ui');
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/stealth">Bandit Stealth</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Products' }));
    expect(await screen.findByRole('link', { name: 'Bandit Stealth' })).toBeTruthy();
  });

  it('announces an open toast and dismisses it', async () => {
    const { Toast, ToastClose, ToastProvider, ToastTitle, ToastViewport } =
      await import('@burtson-labs/ui');
    function Harness() {
      const [open, setOpen] = React.useState(true);
      return (
        <ToastProvider>
          <Toast open={open} onOpenChange={setOpen}>
            <ToastTitle>Message sent</ToastTitle>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      );
    }
    render(<Harness />);
    expect(screen.getByText('Message sent')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await vi.waitFor(() => expect(screen.queryByText('Message sent')).toBeNull());
  });
});

describe('0.5 components', () => {
  it('computes pagination ranges with ellipses', async () => {
    const { paginationRange } = await import('@burtson-labs/ui');
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(6, 20)).toEqual([1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]);
    expect(paginationRange(1, 20)).toEqual([1, 2, 'ellipsis', 20]);
    expect(paginationRange(1, 0)).toEqual([]);
  });

  it('pages forward and marks the current page', async () => {
    const { Pagination } = await import('@burtson-labs/ui');
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBe(
      'page',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('confirms through an alert dialog and cancels with Escape', async () => {
    const m = await import('@burtson-labs/ui');
    const onConfirm = vi.fn();
    render(
      <m.AlertDialog>
        <m.AlertDialogTrigger>Delete</m.AlertDialogTrigger>
        <m.AlertDialogContent>
          <m.AlertDialogTitle>Delete it?</m.AlertDialogTitle>
          <m.AlertDialogDescription>Gone for good.</m.AlertDialogDescription>
          <m.AlertDialogCancel>Cancel</m.AlertDialogCancel>
          <m.AlertDialogAction destructive onClick={onConfirm}>
            Delete
          </m.AlertDialogAction>
        </m.AlertDialogContent>
      </m.AlertDialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('alertdialog', { name: 'Delete it?' })).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }),
    );
    expect(onConfirm).toHaveBeenCalled();
  });

  it('selects from a combobox by typing', async () => {
    const { Combobox } = await import('@burtson-labs/ui');
    const onValueChange = vi.fn();
    render(
      <Combobox
        options={[
          { value: 'a', label: 'Dana', description: 'dana@x.test' },
          { value: 'b', label: 'Luis', description: 'luis@x.test' },
        ]}
        value={null}
        onValueChange={onValueChange}
        placeholder="Pick user"
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByPlaceholderText('Search…'), 'luis');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('marks the current step', async () => {
    const { Steps } = await import('@burtson-labs/ui');
    render(<Steps current={1} items={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]?.getAttribute('data-state')).toBe('complete');
    expect(items[1]?.getAttribute('aria-current')).toBe('step');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

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
    expect(buttonVariants({ variant: 'outline', size: 'sm' })).toContain('border-input');
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

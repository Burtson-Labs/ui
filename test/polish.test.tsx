// 0.13.2: API consistency (refs, slots, controlled and uncontrolled forms,
// aria wiring), the DataTable card default, the Table scroll region, the
// form recipe and the tokens the polish added.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  CheckboxRow,
  Combobox,
  Composer,
  DataTable,
  type DataTableColumn,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DropdownMenuTrigger,
  duration,
  easing,
  elevation,
  ErrorSummary,
  Field,
  FieldGrid,
  FieldSet,
  focusRingClasses,
  FormActions,
  IconButton,
  Input,
  Kbd,
  layer,
  Message,
  motion,
  NativeSelect,
  noOutlineClasses,
  NumberInput,
  Pagination,
  Progress,
  RadioCard,
  RadioGroup,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  shadow,
  Slider,
  StatStrip,
  Status,
  Steps,
  Switch,
  SwitchRow,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  touchTargetClasses,
  useMediaQuery,
} from '@burtson-labs/ui';

const ROOT = join(import.meta.dirname, '..');

function mockViewport(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
}

describe('refs and slots', () => {
  it('forwards a ref to the root of every leaf and pattern component', () => {
    const refs = {
      badge: React.createRef<HTMLSpanElement>(),
      card: React.createRef<HTMLDivElement>(),
      checkbox: React.createRef<HTMLButtonElement>(),
      sw: React.createRef<HTMLButtonElement>(),
      kbd: React.createRef<HTMLElement>(),
      alert: React.createRef<HTMLDivElement>(),
      icon: React.createRef<HTMLButtonElement>(),
      message: React.createRef<HTMLDivElement>(),
      steps: React.createRef<HTMLOListElement>(),
      pagination: React.createRef<HTMLElement>(),
      composer: React.createRef<HTMLFormElement>(),
      status: React.createRef<HTMLSpanElement>(),
      progress: React.createRef<HTMLDivElement>(),
      slider: React.createRef<HTMLInputElement>(),
      textarea: React.createRef<HTMLTextAreaElement>(),
      tabs: React.createRef<HTMLDivElement>(),
    };
    render(
      <>
        <Badge ref={refs.badge}>b</Badge>
        <Card ref={refs.card}>c</Card>
        <Checkbox ref={refs.checkbox} aria-label="c" />
        <Switch ref={refs.sw} aria-label="s" />
        <Kbd ref={refs.kbd}>K</Kbd>
        <Alert ref={refs.alert}>a</Alert>
        <IconButton ref={refs.icon} label="i">
          <svg />
        </IconButton>
        <Message ref={refs.message} from="user">
          m
        </Message>
        <Steps ref={refs.steps} current={0} items={[{ title: 'One' }]} />
        <Pagination ref={refs.pagination} page={1} pageCount={2} onPageChange={() => {}} />
        <Composer ref={refs.composer} onSubmit={() => {}} />
        <Status ref={refs.status}>ok</Status>
        <Progress ref={refs.progress} value={1} aria-label="p" />
        <Slider ref={refs.slider} aria-label="sl" />
        <Textarea ref={refs.textarea} aria-label="t" />
        <Tabs ref={refs.tabs} defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
        </Tabs>
      </>,
    );
    expect(refs.badge.current?.dataset.slot).toBe('badge');
    expect(refs.card.current?.dataset.slot).toBe('card');
    expect(refs.checkbox.current?.getAttribute('role')).toBe('checkbox');
    expect(refs.sw.current?.getAttribute('role')).toBe('switch');
    expect(refs.kbd.current?.tagName).toBe('KBD');
    expect(refs.alert.current?.getAttribute('role')).toBe('alert');
    expect(refs.icon.current?.tagName).toBe('BUTTON');
    expect(refs.message.current?.dataset.slot).toBe('message');
    expect(refs.steps.current?.tagName).toBe('OL');
    expect(refs.pagination.current?.tagName).toBe('NAV');
    expect(refs.composer.current?.tagName).toBe('FORM');
    expect(refs.status.current?.dataset.slot).toBe('status');
    expect(refs.progress.current?.getAttribute('role')).toBe('progressbar');
    expect(refs.slider.current?.type).toBe('range');
    expect(refs.textarea.current?.tagName).toBe('TEXTAREA');
    expect(refs.tabs.current?.dataset.slot).toBe('tabs');
  });

  it('marks variants and sizes as data attributes and lets the caller win on className', () => {
    render(
      <>
        <Button variant="outline" size="sm" className="h-12">
          b
        </Button>
        <Badge variant="success">s</Badge>
        <Alert variant="warning">w</Alert>
      </>,
    );
    const b = screen.getByRole('button', { name: 'b' });
    expect(b.dataset.variant).toBe('outline');
    expect(b.dataset.size).toBe('sm');
    // tailwind-merge: the caller's h-12 replaces the size's h-8.
    expect(b.className.split(' ')).toContain('h-12');
    expect(b.className.split(' ')).not.toContain('h-8');
    expect(screen.getByText('s').dataset.variant).toBe('success');
    expect(screen.getByRole('alert').dataset.variant).toBe('warning');
  });

  it('keeps a trigger reachable and 44px on touch through asChild', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    // The trigger's slot replaces the button's, so the touch size lives in the classes.
    expect(trigger.dataset.slot).toBe('dialog-trigger');
    expect(trigger.className.split(' ')).toContain('pointer-coarse:min-h-11');
    expect(DropdownMenuTrigger).toBeTypeOf('object');
  });

  it('uses one focus style per kind of control', () => {
    render(
      <>
        <Button>b</Button>
        <Checkbox aria-label="c" />
        <Input aria-label="i" />
      </>,
    );
    const ring = focusRingClasses.split(' ');
    expect(screen.getByRole('button').className.split(' ')).toEqual(expect.arrayContaining(ring));
    expect(screen.getByRole('checkbox').className.split(' ')).toEqual(
      expect.arrayContaining([...ring, ...touchTargetClasses.split(' ')]),
    );
    const input = screen.getByRole('textbox').className.split(' ');
    expect(input).toEqual(expect.arrayContaining(noOutlineClasses.split(' ')));
    expect(input).not.toContain('focus-visible:outline-2');
    // The forced-colors outline comes back with !important, nothing at rest.
    expect(noOutlineClasses).toContain('outline-none!');
    expect(noOutlineClasses).toMatch(
      /forced-colors:focus-visible:\[outline:2px_solid_Highlight\]!/,
    );
  });
});

describe('controlled and uncontrolled', () => {
  it('runs a Combobox without a value prop', async () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        options={[
          { value: 'a', label: 'Ada' },
          { value: 'b', label: 'Bob' },
        ]}
        defaultValue="a"
        onValueChange={onValueChange}
        placeholder="Person"
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Person' });
    expect(trigger.textContent).toContain('Ada');
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: /Bob/ }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(trigger.textContent).toContain('Bob');
  });

  it('runs a Slider without a value prop', () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="s" defaultValue={20} onValueChange={onValueChange} />);
    const slider = screen.getByRole<HTMLInputElement>('slider');
    expect(slider.value).toBe('20');
    fireEvent.change(slider, { target: { value: '55' } });
    expect(slider.value).toBe('55');
    expect(onValueChange).toHaveBeenCalledWith(55);
  });
});

describe('form recipe', () => {
  it('wires id, description, error and required onto the control', () => {
    render(
      <Field label="Name" description="Shown in logs." error="Required." required>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Name');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-required')).toBe('true');
    const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toHaveLength(2);
    // Error first, so it is read before the help.
    expect(document.getElementById(ids[0]!)?.textContent).toBe('Required.');
    expect(document.getElementById(ids[1]!)?.textContent).toBe('Shown in logs.');
    expect(screen.getByRole('alert').textContent).toBe('Required.');
  });

  it('points the label at a kit Select trigger and names a group', () => {
    render(
      <>
        <Field label="Model">
          <Select defaultValue="a">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">A</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Window" group description="Local time.">
          <div>
            <Input aria-label="From" />
            <Input aria-label="To" />
          </div>
        </Field>
      </>,
    );
    expect(screen.getByLabelText('Model').getAttribute('role')).toBe('combobox');
    const group = screen.getByRole('group', { name: 'Window' });
    expect(group.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByLabelText('From').getAttribute('aria-describedby')).toBeNull();
  });

  it('lays fields on a subgrid in a FieldGrid and groups them in a FieldSet', () => {
    const { container } = render(
      <FieldSet legend="Pickup" description="Where the driver loads." disabled>
        <FieldGrid columns={3}>
          <Field label="Site" span>
            <Input />
          </Field>
        </FieldGrid>
      </FieldSet>,
    );
    const set = screen.getByRole<HTMLFieldSetElement>('group', { name: 'Pickup' });
    expect(set.disabled).toBe(true);
    expect(set.getAttribute('aria-describedby')).toBeTruthy();
    expect(container.querySelector('[data-slot=field-grid]')?.className).toContain(
      'sm:grid-cols-3',
    );
    const field = container.querySelector('[data-slot=field]');
    expect(field?.className).toContain('grid-rows-subgrid');
    expect(field?.className).toContain('sm:col-span-full');
  });

  it('gives NumberInput a numeric keyboard, right alignment and the box as the field', () => {
    const { container } = render(
      <>
        <NumberInput aria-label="Gallons" suffix="gal" defaultValue="7500" />
        <NumberInput aria-label="Rate" prefix="$" decimal aria-invalid />
      </>,
    );
    const gallons = screen.getByRole('textbox', { name: 'Gallons' });
    expect(gallons.getAttribute('inputmode')).toBe('numeric');
    expect(gallons.className).toContain('text-right');
    expect(screen.getByRole('textbox', { name: 'Rate' }).getAttribute('inputmode')).toBe('decimal');
    const boxes = container.querySelectorAll('[data-slot=number-input]');
    expect(boxes).toHaveLength(2);
    expect(boxes[0]?.textContent).toContain('gal');
    expect(boxes[1]?.className).toContain('has-[input[aria-invalid=true]]:border-destructive');
  });

  it('renders NativeSelect and SearchInput as labelled fields', () => {
    render(
      <>
        <NativeSelect aria-label="Plan" defaultValue="b">
          <option value="a">A</option>
          <option value="b">B</option>
        </NativeSelect>
        <SearchInput aria-label="Search loads" width="md" />
      </>,
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Plan' }).value).toBe('b');
    const search = screen.getByRole('searchbox', { name: 'Search loads' });
    expect(search.getAttribute('enterkeyhint')).toBe('search');
    expect(search.closest('[data-slot=search-input]')?.className).toContain('sm:w-48');
  });

  it('labels rows and cards and describes them', async () => {
    render(
      <>
        <CheckboxRow label="Copy me" description="One email." />
        <SwitchRow label="Quiet hours" description="No pushes." />
        <RadioGroup defaultValue="a" aria-label="Plan">
          <RadioCard value="a" title="Starter" description="Five loads." />
        </RadioGroup>
      </>,
    );
    const box = screen.getByRole('checkbox', { name: 'Copy me' });
    expect(document.getElementById(box.getAttribute('aria-describedby')!)?.textContent).toBe(
      'One email.',
    );
    await userEvent.click(screen.getByText('Copy me'));
    expect(box.getAttribute('aria-checked')).toBe('true');
    const sw = screen.getByRole('switch', { name: 'Quiet hours' });
    expect(document.getElementById(sw.getAttribute('aria-describedby')!)?.textContent).toBe(
      'No pushes.',
    );
    const radio = screen.getByRole('radio', { name: 'Starter' });
    expect(document.getElementById(radio.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Five loads.',
    );
  });

  it('moves focus to the error summary and from an entry to its field', async () => {
    const onSelect = vi.fn();
    render(
      <>
        <ErrorSummary
          errors={[{ id: 'f-name', message: 'Name is required.' }]}
          onSelect={onSelect}
        />
        <Input id="f-name" aria-label="Name" />
      </>,
    );
    const summary = document.querySelector('[data-slot=error-summary]') as HTMLElement;
    expect(document.activeElement).toBe(summary);
    await userEvent.click(screen.getByRole('link', { name: 'Name is required.' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Name'));
    expect(onSelect).toHaveBeenCalledWith('f-name');
  });

  it('renders nothing for an empty summary and places form actions', () => {
    const { container } = render(
      <>
        <ErrorSummary errors={[]} />
        <FormActions sticky start={<Button variant="ghost">Cancel</Button>}>
          <Button>Save</Button>
        </FormActions>
      </>,
    );
    expect(container.querySelector('[data-slot=error-summary]')).toBeNull();
    const actions = container.querySelector('[data-slot=form-actions]');
    expect(actions?.getAttribute('data-sticky')).toBe('true');
    const buttons = within(actions as HTMLElement).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Cancel', 'Save']);
  });
});

describe('DataTable cards', () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });
  interface Row {
    id: string;
    name: string;
    runs: number;
  }
  const rows: Row[] = [
    { id: '1', name: 'Ada', runs: 3 },
    { id: '2', name: 'Bob', runs: 5 },
  ];
  const plain: DataTableColumn<Row>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name },
    { id: 'runs', header: 'Runs', numeric: true, cell: (r) => r.runs },
  ];
  const placed: DataTableColumn<Row>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name, card: 'title' },
    { id: 'runs', header: 'Runs', numeric: true, cell: (r) => r.runs },
  ];
  const table = (columns: DataTableColumn<Row>[], extra = {}) => (
    <DataTable aria-label="Runs" columns={columns} rows={rows} getRowId={(r) => r.id} {...extra} />
  );

  it('stays a table on a phone when no column has a card placement', () => {
    mockViewport(true);
    const { container } = render(table(plain));
    expect(container.querySelector('[data-slot=data-table]')?.getAttribute('data-layout')).toBe(
      'table',
    );
    expect(screen.getByRole('region', { name: 'Runs' })).toBeTruthy();
  });

  it('becomes cards on a phone when a column is placed, or when cardsBelow is set', () => {
    mockViewport(true);
    const { container, rerender } = render(table(placed));
    expect(container.querySelector('[data-slot=data-table]')?.getAttribute('data-layout')).toBe(
      'cards',
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    rerender(table(plain, { cardsBelow: 'md' }));
    expect(container.querySelector('[data-slot=data-table]')?.getAttribute('data-layout')).toBe(
      'cards',
    );
    rerender(table(placed, { cardsBelow: false }));
    expect(container.querySelector('[data-slot=data-table]')?.getAttribute('data-layout')).toBe(
      'table',
    );
  });

  it('is a table on the server and on a desktop', () => {
    const { container } = render(table(placed));
    expect(container.querySelector('[data-slot=data-table]')?.getAttribute('data-layout')).toBe(
      'table',
    );
  });
});

describe('Table scroll region', () => {
  it('pins the first column and draws its focus outline inside the box', () => {
    const { container } = render(
      <Table scrollLabel="Wide" pinFirstColumn>
        <TableBody>
          <TableRow>
            <TableCell>a</TableCell>
            <TableCell numeric>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const region = screen.getByRole('region', { name: 'Wide' });
    expect(region.getAttribute('data-pinned')).toBe('true');
    expect(region.className.split(' ')).toEqual(
      expect.arrayContaining(['focus-visible:outline-2', 'focus-visible:outline-offset-[-2px]']),
    );
    expect(container.querySelector('td')?.className).toContain(
      'first:group-data-[pinned]/table:sticky',
    );
    // No hint without overflow (jsdom has no layout).
    expect(container.querySelector('[data-slot=table-overflow-hint]')).toBeNull();
  });
});

describe('tokens', () => {
  it('names five elevations, a layer scale and builds motion from the timing tokens', () => {
    expect(elevation[4]).toBe(shadow.lg);
    expect(elevation[5]).toBe(shadow.xl);
    expect(layer).toEqual({ raised: 10, chrome: 40, overlay: 50, toast: 100 });
    expect(motion.animations.in).toBe(`bl-in ${duration.standard}ms ${easing.emphasized}`);
    expect(motion.animations['sheet-in']).toContain(easing.drawer);
    const css = readFileSync(join(ROOT, 'src/styles/theme.css'), 'utf8');
    expect(css).toContain('--default-transition-duration: var(--duration-fast)');
    expect(css).toContain('--shadow-xl:');
    // The touch rule is in the base layer at zero specificity, so a utility beats it.
    expect(css).toMatch(/@layer base \{\s*@media \(pointer: coarse\) \{\s*:where\(/);
  });

  it('answers false for a media query without matchMedia (server, jsdom)', () => {
    let value: boolean | undefined;
    function Probe() {
      value = useMediaQuery('(max-width: 767px)');
      return null;
    }
    render(<Probe />);
    expect(value).toBe(false);
  });

  it('draws stat strip figures as links or buttons only when asked', () => {
    const onSelect = vi.fn();
    render(
      <StatStrip
        stats={[
          { label: 'Runs', value: '1', href: '/runs' },
          { label: 'Failures', value: '2', onSelect },
          { label: 'Median', value: '3' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: /Runs/ }).getAttribute('href')).toBe('/runs');
    fireEvent.click(screen.getByRole('button', { name: /Failures/ }));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Median/ })).toBeNull();
  });
});

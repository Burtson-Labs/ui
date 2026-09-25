// Workbench primitives: tree, editor tabs, resizable panels, context menu and
// menubar, and the onboarding family (tour, spotlight, checklist).
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  EditorTabs,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  OnboardingChecklist,
  ResizablePanel,
  ResizablePanelGroup,
  ResizeHandle,
  Spotlight,
  Tour,
  TourAnchor,
  TreeView,
  type EditorTab,
  type TreeNode,
  type TourStep,
} from '@burtson-labs/ui';

import { flattenTree } from '../src/components/tree-view';

const files: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/app.tsx', label: 'app.tsx' },
      { id: 'src/main.tsx', label: 'main.tsx' },
    ],
  },
  { id: 'lazy', label: 'lazy', hasChildren: true },
  { id: 'package.json', label: 'package.json' },
  { id: 'readme.md', label: 'README.md' },
];

function Tree(
  props: Partial<React.ComponentProps<typeof TreeView>> & {
    initialExpanded?: string[];
    initialSelected?: string[];
  },
) {
  const { initialExpanded = [], initialSelected = [], ...rest } = props;
  const [expanded, setExpanded] = React.useState(initialExpanded);
  const [selected, setSelected] = React.useState(initialSelected);
  return (
    <TreeView
      aria-label="Files"
      nodes={files}
      expanded={expanded}
      onExpandedChange={setExpanded}
      selected={selected}
      onSelectedChange={setSelected}
      {...rest}
    />
  );
}

const item = (name: string) => screen.getByRole('treeitem', { name });

describe('TreeView', () => {
  it('flattens only expanded branches, with ARIA positions', () => {
    const rows = flattenTree(files, new Set(['src']));
    expect(rows.map((r) => r.node.id)).toEqual([
      'src',
      'src/app.tsx',
      'src/main.tsx',
      'lazy',
      'package.json',
      'readme.md',
    ]);
    expect(rows[1]).toMatchObject({ level: 2, posInSet: 1, setSize: 2, parentId: 'src' });
  });

  it('has one tab stop and moves with arrows, Home and End', async () => {
    render(<Tree />);
    expect(screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0)).toHaveLength(1);
    item('src').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(item('lazy'));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(item('README.md'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(item('src'));
  });

  it('expands with Right, enters the child, and goes back to the parent with Left', async () => {
    render(<Tree />);
    item('src').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(item('src').getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(item('app.tsx'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(item('src'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(item('src').getAttribute('aria-expanded')).toBe('false');
  });

  it('asks for lazy children once, and shows loading while they arrive', async () => {
    const load = vi.fn();
    const { rerender } = render(<Tree onLoadChildren={load} />);
    item('lazy').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(load).toHaveBeenCalledWith('lazy');
    rerender(
      <Tree
        onLoadChildren={load}
        initialExpanded={['lazy']}
        nodes={files.map((n) => (n.id === 'lazy' ? { ...n, loading: true } : n))}
      />,
    );
    expect(screen.getByRole('status', { name: 'Loading lazy' })).toBeTruthy();
  });

  it('jumps by typeahead, but not while typing in a rename field', async () => {
    render(
      <Tree
        renderLabel={(node) =>
          node.id === 'package.json' ? <input aria-label="Rename" defaultValue="" /> : node.label
        }
      />,
    );
    item('src').focus();
    await userEvent.keyboard('r');
    expect(document.activeElement).toBe(item('README.md'));
    screen.getByRole('textbox', { name: 'Rename' }).focus();
    await userEvent.keyboard('s');
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Rename' }));
  });

  it('runs onAction on Enter and selects the row', async () => {
    const action = vi.fn();
    render(<Tree onAction={action} />);
    item('package.json').focus();
    await userEvent.keyboard('{Enter}');
    expect(action).toHaveBeenCalledWith('package.json');
    expect(item('package.json').getAttribute('aria-selected')).toBe('true');
  });

  it('selects ranges with Shift and toggles with Ctrl in multiple mode', async () => {
    const user = userEvent.setup();
    render(<Tree selectionMode="multiple" />);
    await user.click(item('lazy'));
    await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
    const selected = () =>
      screen
        .getAllByRole('treeitem')
        .filter((el) => el.getAttribute('aria-selected') === 'true')
        .map((el) => el.getAttribute('aria-label'));
    expect(selected()).toEqual(['lazy', 'package.json', 'README.md']);
    await user.keyboard('{Control>}');
    await user.click(item('package.json'));
    await user.keyboard('{/Control}');
    expect(selected()).toEqual(['lazy', 'README.md']);
    expect(screen.getByRole('tree').getAttribute('aria-multiselectable')).toBe('true');
  });

  it('recovers focus when the focused row is deleted', async () => {
    const { rerender } = render(<Tree />);
    item('package.json').focus();
    rerender(<Tree nodes={files.filter((n) => n.id !== 'package.json')} />);
    await waitFor(() =>
      expect(document.activeElement?.getAttribute('aria-label')).toBe('README.md'),
    );
  });

  it('recovers focus to the parent when its branch collapses', () => {
    function Collapsing() {
      const [expanded, setExpanded] = React.useState(['src']);
      return (
        <>
          <button type="button" onClick={() => setExpanded([])}>
            collapse
          </button>
          <TreeView
            aria-label="Files"
            nodes={files}
            expanded={expanded}
            onExpandedChange={setExpanded}
            selected={[]}
            onSelectedChange={() => {}}
          />
        </>
      );
    }
    render(<Collapsing />);
    item('main.tsx').focus();
    act(() => screen.getByRole('button', { name: 'collapse' }).click());
    expect(item('src').tabIndex).toBe(0);
  });
});

const openTabs: EditorTab[] = [
  { id: 'a.ts', label: 'a.ts', description: 'src/a.ts' },
  { id: 'b.ts', label: 'b.ts', dirty: true },
  { id: 'c.ts', label: 'c.ts', closeable: false },
];

describe('EditorTabs', () => {
  it('moves focus with arrows and opens with Enter', async () => {
    const onActive = vi.fn();
    render(
      <EditorTabs
        aria-label="Open editors"
        tabs={openTabs}
        activeId="a.ts"
        onActiveChange={onActive}
      />,
    );
    const [a, b] = screen.getAllByRole('tab');
    a?.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(b);
    expect(onActive).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onActive).toHaveBeenCalledWith('b.ts');
    await userEvent.keyboard('{End}{ArrowRight}');
    expect(document.activeElement).toBe(a);
  });

  it('announces unsaved changes and the full path', () => {
    render(
      <EditorTabs
        aria-label="Open editors"
        tabs={openTabs}
        activeId="a.ts"
        onActiveChange={() => {}}
      />,
    );
    expect(screen.getByRole('tab', { name: 'b.ts, unsaved changes' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'a.ts' }).getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByRole('tablist', { name: 'Open editors' })).toBeTruthy();
  });

  it('asks the app to close, never removing the tab itself', async () => {
    const onClose = vi.fn();
    render(
      <EditorTabs
        aria-label="Open editors"
        tabs={openTabs}
        activeId="a.ts"
        onActiveChange={() => {}}
        onClose={onClose}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close b.ts' }));
    expect(onClose).toHaveBeenCalledWith('b.ts');
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    screen.getAllByRole('tab')[2]?.focus();
    await userEvent.keyboard('{Delete}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Close c.ts' })).toBeNull();
  });

  it('reorders from the keyboard', async () => {
    const onMove = vi.fn();
    render(
      <EditorTabs
        aria-label="Open editors"
        tabs={openTabs}
        activeId="a.ts"
        onActiveChange={() => {}}
        onMove={onMove}
      />,
    );
    screen.getAllByRole('tab')[0]?.focus();
    await userEvent.keyboard('{Control>}{Shift>}{PageDown}{/Shift}{/Control}');
    expect(onMove).toHaveBeenCalledWith('a.ts', 1);
  });

  it('keeps focus in the strip after the focused tab closes', async () => {
    const { rerender } = render(
      <EditorTabs
        aria-label="Open editors"
        tabs={openTabs}
        activeId="a.ts"
        onActiveChange={() => {}}
      />,
    );
    screen.getAllByRole('tab')[1]?.focus();
    rerender(
      <EditorTabs
        aria-label="Open editors"
        tabs={openTabs.filter((t) => t.id !== 'b.ts')}
        activeId="a.ts"
        onActiveChange={() => {}}
      />,
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'a.ts' })),
    );
  });
});

describe('Resizable', () => {
  it('renders labelled separators between panels', () => {
    render(
      <div style={{ width: 800, height: 400 }}>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="left" defaultSize="30%" minSize="10%">
            Left
          </ResizablePanel>
          <ResizeHandle aria-label="Resize explorer" withHandle />
          <ResizablePanel id="right">Right</ResizablePanel>
        </ResizablePanelGroup>
      </div>,
    );
    const handle = screen.getByRole('separator', { name: 'Resize explorer' });
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.tabIndex).toBe(0);
    expect(handle.getAttribute('data-slot')).toBe('resize-handle');
  });
});

describe('menus', () => {
  it('opens a context menu on right-click', async () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('target'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    expect(onSelect).toHaveBeenCalled();
  });

  it('opens a menubar menu from its trigger', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(screen.getByRole('menubar')).toBeTruthy();
    screen.getByRole('menuitem', { name: 'File' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(await screen.findByRole('menuitem', { name: 'Save' })).toBeTruthy();
  });
});

describe('Tour', () => {
  beforeEach(() => {
    // jsdom has no layout; report every connected element as on screen.
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
      return (this.isConnected ? [new DOMRect(0, 0, 100, 20)] : []) as unknown as DOMRectList;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const steps: TourStep[] = [
    { id: 'explorer', target: 'explorer', title: 'Explorer', content: 'Your files.' },
    { id: 'editor', target: 'editor', title: 'Editor', content: 'Edit here.' },
  ];

  function Harness(props: Partial<React.ComponentProps<typeof Tour>> & { withEditor?: boolean }) {
    const { withEditor = true, ...rest } = props;
    const [open, setOpen] = React.useState(false);
    const [step, setStep] = React.useState(0);
    const [ended, setEnded] = React.useState('');
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Start tour
        </button>
        <input aria-label="Editor field" />
        <TourAnchor id="explorer">
          <div>files</div>
        </TourAnchor>
        {withEditor && (
          <TourAnchor id="editor">
            <div>editor</div>
          </TourAnchor>
        )}
        <output>{ended}</output>
        <Tour
          steps={steps}
          open={open}
          step={step}
          onStepChange={setStep}
          onEnd={(reason) => {
            setEnded(reason);
            setOpen(false);
          }}
          waitMs={50}
          {...rest}
        />
      </>
    );
  }

  it('walks the steps with progress, then completes and restores focus', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Start tour' }));
    const dialog = await screen.findByRole('dialog', { name: 'Explorer' });
    expect(dialog.textContent).toContain('1 of 2');
    await waitFor(() => expect(document.activeElement).toBe(dialog));
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('dialog', { name: 'Editor' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('status').textContent).toBe('complete');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Start tour' }));
  });

  it('ends on Escape, but not while the person types elsewhere', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Start tour' }));
    await screen.findByRole('dialog', { name: 'Explorer' });
    screen.getByRole('textbox', { name: 'Editor field' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Explorer' })).toBeTruthy();
    screen.getByRole('dialog').focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('status').textContent).toBe('escape');
  });

  it('shows a step centred when its target never appears', async () => {
    render(<Harness withEditor={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start tour' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('dialog', { name: 'Editor' })).toBeTruthy();
  });

  it('skips a missing target when asked to', async () => {
    const extra: TourStep[] = [...steps, { id: 'end', title: 'All set', content: 'Done.' }];
    render(<Harness withEditor={false} missingTarget="skip" steps={extra} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start tour' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('dialog', { name: 'All set' })).toBeTruthy();
  });

  it('aborts a step preparation when the tour closes', () => {
    let aborted = false;
    const slow: TourStep[] = [
      {
        ...steps[0]!,
        prepare: (signal) =>
          new Promise<void>((resolve) => {
            signal.addEventListener('abort', () => {
              aborted = true;
              resolve();
            });
          }),
      },
    ];
    const { rerender } = render(
      <Tour steps={slow} open step={0} onStepChange={() => {}} onEnd={() => {}} />,
    );
    rerender(<Tour steps={slow} open={false} step={0} onStepChange={() => {}} onEnd={() => {}} />);
    expect(aborted).toBe(true);
  });
});

describe('Spotlight', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
      return (this.isConnected ? [new DOMRect(0, 0, 100, 20)] : []) as unknown as DOMRectList;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('shows a hint without taking focus, and dismisses', async () => {
    const onDismiss = vi.fn();
    render(
      <>
        <button type="button">Keep focus</button>
        <TourAnchor id="providers">
          <div>providers</div>
        </TourAnchor>
        <Spotlight target="providers" open onDismiss={onDismiss} title="Add a provider">
          Use a local model or your own key.
        </Spotlight>
      </>,
    );
    screen.getByRole('button', { name: 'Keep focus' }).focus();
    const note = await screen.findByRole('note', { name: 'Add a provider' });
    expect(note).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep focus' }));
    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onDismiss).toHaveBeenCalledWith('dismiss');
  });

  it('renders nothing when the target is absent', async () => {
    render(
      <Spotlight target="nowhere" open onDismiss={() => {}} title="Hidden">
        x
      </Spotlight>,
    );
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole('note')).toBeNull();
  });
});

describe('OnboardingChecklist', () => {
  it('shows progress from app state and swaps in the completion message', () => {
    const items = [
      { id: 'repo', title: 'Open a repository', done: true },
      {
        id: 'provider',
        title: 'Test a provider',
        done: false,
        action: <button type="button">Set up</button>,
      },
    ];
    const { rerender } = render(
      <OnboardingChecklist
        title="Get started"
        items={items}
        onDismiss={() => {}}
        complete="All done"
      />,
    );
    expect(screen.getByRole('progressbar', { name: '1 of 2 done' })).toBeTruthy();
    expect(screen.getByText(', not done')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Set up' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dismiss checklist' })).toBeTruthy();
    rerender(
      <OnboardingChecklist
        title="Get started"
        items={items.map((i) => ({ ...i, done: true }))}
        complete="All done"
      />,
    );
    expect(screen.getByText('All done')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Set up' })).toBeNull();
  });
});

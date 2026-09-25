import * as React from 'react';
import {
  Group,
  Panel,
  Separator,
  type GroupImperativeHandle,
  type Layout,
  type LayoutChangedMeta,
} from 'react-resizable-panels';

import { cn } from '../lib/utils';

// Resizing is react-resizable-panels: it implements the WAI-ARIA window
// splitter (arrow keys, Home/End, Enter to collapse), captures the pointer so
// a drag over an iframe or terminal keeps tracking, and enforces min/max and
// collapse. This file adds the Burtson look and a controlled `layout` prop.

export type ResizableLayout = Layout;

export interface ResizablePanelGroupProps extends Omit<
  React.ComponentProps<typeof Group>,
  'defaultLayout' | 'onLayoutChange' | 'onLayoutChanged'
> {
  /**
   * Controlled sizes: panel id → percentage (0..100). Pass it with
   * onLayoutChange, or onLayoutChanged if you only need the settled value.
   * The group re-applies it whenever it differs from what is on screen.
   */
  layout?: ResizableLayout;
  /** Initial sizes when uncontrolled, e.g. restored from storage. */
  defaultLayout?: ResizableLayout;
  /** Every change, including each pointer move while dragging. */
  onLayoutChange?: (layout: ResizableLayout) => void;
  /** After a drag ends or a key resizes; the one to persist. */
  onLayoutChanged?: (layout: ResizableLayout, meta: LayoutChangedMeta) => void;
}

const sameLayout = (a: ResizableLayout, b: ResizableLayout) => {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((k) => b[k] !== undefined && Math.abs((a[k] ?? 0) - (b[k] ?? 0)) < 0.01)
  );
};

function ResizablePanelGroup({
  className,
  layout,
  defaultLayout,
  groupRef: groupRefProp,
  orientation = 'horizontal',
  ...props
}: ResizablePanelGroupProps) {
  const groupRef = React.useRef<GroupImperativeHandle | null>(null);
  React.useImperativeHandle(groupRefProp, () => groupRef.current as GroupImperativeHandle, []);

  React.useEffect(() => {
    const group = groupRef.current;
    if (!layout || !group) return;
    if (!sameLayout(group.getLayout(), layout)) group.setLayout(layout);
  }, [layout]);

  return (
    <Group
      data-slot="resizable-panel-group"
      data-orientation={orientation}
      orientation={orientation}
      groupRef={groupRef}
      defaultLayout={layout ?? defaultLayout}
      className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof Panel>) {
  return (
    <Panel data-slot="resizable-panel" className={cn('min-h-0 min-w-0', className)} {...props} />
  );
}

export interface ResizeHandleProps extends React.ComponentProps<typeof Separator> {
  /** Show a small grip in the middle of the line. */
  withHandle?: boolean;
  /** What the handle resizes, e.g. "Resize explorer". Required for screen readers. */
  'aria-label': string;
}

/**
 * The separator between two panels. It is a 1px line with an 8px hit area;
 * hover and drag tint it, keyboard focus draws it in the brand colour.
 */
function ResizeHandle({ className, withHandle, ...props }: ResizeHandleProps) {
  return (
    <Separator
      data-slot="resize-handle"
      className={cn(
        'group/handle relative flex shrink-0 items-center justify-center bg-border outline-none',
        // Hit area wider than the line, on the axis being dragged.
        'after:absolute after:content-[""]',
        // The library sets aria-orientation on the line itself: a horizontal
        // group has vertical separators. Nested groups stay independent.
        'aria-[orientation=vertical]:w-px aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:-inset-x-1',
        'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:-inset-y-1',
        'transition-colors data-[separator=hover]:bg-border-strong data-[separator=active]:bg-brand',
        'focus-visible:outline-none data-[separator=focus]:bg-ring data-[separator=focus]:shadow-[0_0_0_1px_var(--ring)]',
        'data-[separator=disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <span
          aria-hidden
          className="z-10 flex items-center justify-center rounded-xs border bg-surface group-aria-[orientation=vertical]/handle:h-6 group-aria-[orientation=vertical]/handle:w-2 group-aria-[orientation=horizontal]/handle:h-2 group-aria-[orientation=horizontal]/handle:w-6"
        >
          <span className="rounded-full bg-muted-foreground/60 group-aria-[orientation=vertical]/handle:h-3 group-aria-[orientation=vertical]/handle:w-px group-aria-[orientation=horizontal]/handle:h-px group-aria-[orientation=horizontal]/handle:w-3" />
        </span>
      )}
    </Separator>
  );
}

export { usePanelRef, useGroupRef } from 'react-resizable-panels';
export type {
  GroupImperativeHandle as ResizablePanelGroupHandle,
  PanelImperativeHandle as ResizablePanelHandle,
} from 'react-resizable-panels';
export { ResizablePanelGroup, ResizablePanel, ResizeHandle };

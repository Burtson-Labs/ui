import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { usePresence } from './presence';
import { type Orientation, RovingFocusGroup, RovingFocusItem } from './roving-focus';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';

/**
 * Tabs, per the ARIA tabs pattern: a `tablist` of `tab` buttons, each
 * controlling a `tabpanel`. The list is one Tab stop; the arrow keys for
 * the orientation (Left/Right, mirrored in RTL, or Up/Down) and Home/End
 * move focus between tabs, wrapping by default (`loop`).
 *
 * - `activationMode="automatic"` (the default): a tab is selected when it
 *   receives focus, so arrowing through the list shows each panel.
 * - `activationMode="manual"`: arrows only move focus; Enter or Space (or a
 *   press) selects.
 *
 * A press selects on `mousedown` (the primary button, without Ctrl), so the
 * panel is already there when the press ends. When focus enters the list
 * from outside it lands on the selected tab, whatever tab had focus before.
 * Each tab and panel get ids from the root, and reference each other with
 * `aria-controls` and `aria-labelledby`. A panel is in the Tab sequence
 * (`tabindex="0"`), as the pattern recommends when it starts with
 * non-focusable content.
 */

interface TabsContextValue {
  baseId: string;
  value: string | undefined;
  select: (value: string) => void;
  orientation: Orientation;
  dir?: 'ltr' | 'rtl';
  activationMode: 'automatic' | 'manual';
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error(`${component} must be inside Tabs`);
  return context;
}

/** An id fragment for a value: spaces and other characters ids cannot carry are escaped. */
const idPart = (value: string) =>
  value.replace(/[^\w-]/g, (character) => `_${character.codePointAt(0)!.toString(16)}`);

const triggerId = (baseId: string, value: string) => `${baseId}-trigger-${idPart(value)}`;
const contentId = (baseId: string, value: string) => `${baseId}-content-${idPart(value)}`;

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'> {
  asChild?: boolean;
  /** The selected tab's value, when controlled. */
  value?: string;
  /** The tab selected at first, when uncontrolled. */
  defaultValue?: string;
  /** Called with the value of the tab the person selects. */
  onValueChange?: (value: string) => void;
  /**
   * Which arrow keys move between tabs: Left/Right or Up/Down.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /** Reading direction for Left/Right; the computed direction when unset. */
  dir?: 'ltr' | 'rtl';
  /**
   * `automatic` selects a tab when it receives focus; `manual` waits for Enter, Space or a press.
   * @default 'automatic'
   */
  activationMode?: 'automatic' | 'manual';
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    asChild = false,
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    dir,
    activationMode = 'automatic',
    ...props
  },
  ref,
) {
  const baseId = useStableId(undefined, 'bl-tabs');
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const context = React.useMemo<TabsContextValue>(
    () => ({ baseId, value, select: setValue, orientation, dir, activationMode }),
    [baseId, value, setValue, orientation, dir, activationMode],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <TabsContext.Provider value={context}>
      <Comp dir={dir} data-orientation={orientation} {...props} ref={ref} />
    </TabsContext.Provider>
  );
});

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /**
   * Arrow keys wrap from the last tab to the first.
   * @default true
   */
  loop?: boolean;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { asChild = false, loop = true, onBlur, ...props },
  ref,
) {
  const context = useTabs('TabsList');
  const selectedId = context.value === undefined ? null : triggerId(context.baseId, context.value);
  // The tab stop follows the selection; arrowing in manual mode moves it
  // ahead of the selection until focus leaves the list.
  const [tabStop, setTabStop] = React.useState<string | null>(selectedId);
  const [seenSelected, setSeenSelected] = React.useState(selectedId);
  if (seenSelected !== selectedId) {
    setSeenSelected(selectedId);
    setTabStop(selectedId);
  }
  const Comp = asChild ? Slot : 'div';
  return (
    <RovingFocusGroup
      asChild
      orientation={context.orientation}
      dir={context.dir}
      loop={loop}
      currentTabStopId={tabStop}
      onCurrentTabStopIdChange={setTabStop}
    >
      <Comp
        role="tablist"
        aria-orientation={context.orientation}
        {...props}
        ref={ref}
        onBlur={composeHandlers(onBlur, (event: React.FocusEvent<HTMLDivElement>) => {
          const to = event.relatedTarget;
          if (to instanceof Node && event.currentTarget.contains(to)) return;
          setTabStop(selectedId);
        })}
      />
    </RovingFocusGroup>
  );
});

export interface TabsTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  asChild?: boolean;
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { asChild = false, value, disabled = false, onMouseDown, onKeyDown, onFocus, ...props },
  ref,
) {
  const context = useTabs('TabsTrigger');
  const selected = context.value === value;
  const id = triggerId(context.baseId, value);
  const Comp = asChild ? Slot : 'button';
  return (
    <RovingFocusItem asChild focusable={!disabled} active={selected} tabStopId={id}>
      <Comp
        type={asChild ? undefined : 'button'}
        role="tab"
        id={id}
        aria-selected={selected}
        aria-controls={contentId(context.baseId, value)}
        data-state={selected ? 'active' : 'inactive'}
        data-disabled={disabled ? '' : undefined}
        data-orientation={context.orientation}
        disabled={disabled}
        {...props}
        ref={ref}
        onMouseDown={composeHandlers(onMouseDown, (event: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled || event.button !== 0 || event.ctrlKey) {
            // A Ctrl-press opens the context menu on macOS; keep focus where it is.
            if (event.ctrlKey) event.preventDefault();
            return;
          }
          context.select(value);
        })}
        onKeyDown={composeHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLButtonElement>) => {
          if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return;
          event.preventDefault();
          context.select(value);
        })}
        onFocus={composeHandlers(onFocus, () => {
          if (!disabled && !selected && context.activationMode === 'automatic')
            context.select(value);
        })}
      />
    </RovingFocusItem>
  );
});

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  value: string;
  /** Keep the panel in the DOM (hidden) while its tab is not selected. */
  forceMount?: true;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { asChild = false, value, forceMount, ...props },
  forwardedRef,
) {
  const context = useTabs('TabsContent');
  const selected = context.value === value;
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const mounted = usePresence(selected, nodeRef);
  if (!mounted && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      role="tabpanel"
      id={contentId(context.baseId, value)}
      aria-labelledby={triggerId(context.baseId, value)}
      data-state={selected ? 'active' : 'inactive'}
      data-orientation={context.orientation}
      hidden={!mounted}
      tabIndex={0}
      {...props}
      ref={ref}
    />
  );
});

export {
  TabsContent as Content,
  TabsList as List,
  Tabs as Root,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsTrigger as Trigger,
};

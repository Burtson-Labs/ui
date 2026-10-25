import * as React from 'react';

import { cn } from '../lib/utils';
import { useComposedRefs } from '../primitives/vendor/radix/react-compose-refs';
import * as PopoverPrimitive from '../primitives/vendor/radix/react-popover';
import * as Slot from '../primitives/vendor/radix/react-slot';

import { surfaceClasses } from './popover';

interface HoverCardContextValue {
  open: boolean;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  show: () => void;
  hide: () => void;
  cancel: () => void;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCard(name: string) {
  const ctx = React.useContext(HoverCardContext);
  if (!ctx) throw new Error(`${name} must be used inside a HoverCard`);
  return ctx;
}

const TABBABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable=true]';

const tabbables = (root: ParentNode) =>
  [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => !el.hasAttribute('data-radix-focus-guard') && !el.closest('[inert]'),
  );

export interface HoverCardProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds the pointer or focus rests on the trigger before the card opens. */
  openDelay?: number;
  /** Milliseconds after the pointer or focus leaves before it closes; long enough to cross the gap. */
  closeDelay?: number;
  children?: React.ReactNode;
}

/**
 * A preview of what a link points at: a citation's source, a person, a
 * commit. Opens after a short rest on the trigger with a mouse or keyboard
 * focus, stays open while the pointer or focus is inside it, and closes on
 * Escape. Touch has no hover, so a tap follows the link: never put
 * information only in the card.
 */
function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 500,
  closeDelay = 300,
  children,
}: HoverCardProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const contentId = React.useId();
  const controlled = openProp !== undefined;

  const setOpen = React.useCallback(
    (next: boolean) => {
      clearTimeout(timer.current);
      if (next === open) return;
      if (!controlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [open, controlled, onOpenChange],
  );
  const cancel = React.useCallback(() => clearTimeout(timer.current), []);
  const show = React.useCallback(() => {
    clearTimeout(timer.current);
    if (open) return;
    timer.current = setTimeout(() => setOpen(true), openDelay);
  }, [open, openDelay, setOpen]);
  const hide = React.useCallback(() => {
    clearTimeout(timer.current);
    if (!open) return;
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [open, closeDelay, setOpen]);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <HoverCardContext.Provider
      value={{ open, contentId, triggerRef, contentRef, show, hide, cancel, setOpen }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </HoverCardContext.Provider>
  );
}

export interface HoverCardTriggerProps extends React.ComponentProps<'a'> {
  /** Render your own element (a kit Button, a router Link) instead of an `<a>`. */
  asChild?: boolean;
}

/**
 * The link the card previews. Keep it a real link or button that works on its
 * own; the card only adds a preview. While open, the card describes it
 * (aria-describedby) and Tab moves into the card's links.
 */
const HoverCardTrigger = React.forwardRef<HTMLAnchorElement, HoverCardTriggerProps>(
  function HoverCardTrigger(
    {
      asChild = false,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onKeyDown,
      'aria-describedby': describedBy,
      ...props
    },
    ref,
  ) {
    const ctx = useHoverCard('HoverCardTrigger');
    const Comp = asChild ? Slot.Root : 'a';
    return (
      <PopoverPrimitive.Anchor asChild>
        <Comp
          ref={useComposedRefs(ref, ctx.triggerRef as React.Ref<HTMLAnchorElement>)}
          data-slot="hover-card-trigger"
          data-state={ctx.open ? 'open' : 'closed'}
          aria-describedby={
            [describedBy, ctx.open ? ctx.contentId : undefined].filter(Boolean).join(' ') ||
            undefined
          }
          onPointerEnter={(event: React.PointerEvent<HTMLAnchorElement>) => {
            onPointerEnter?.(event);
            if (event.pointerType !== 'touch') ctx.show();
          }}
          onPointerLeave={(event: React.PointerEvent<HTMLAnchorElement>) => {
            onPointerLeave?.(event);
            if (event.pointerType !== 'touch') ctx.hide();
          }}
          onFocus={(event: React.FocusEvent<HTMLAnchorElement>) => {
            onFocus?.(event);
            ctx.show();
          }}
          onBlur={(event: React.FocusEvent<HTMLAnchorElement>) => {
            onBlur?.(event);
            const to = event.relatedTarget as Node | null;
            if (!to || !ctx.contentRef.current?.contains(to)) ctx.hide();
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLAnchorElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || !ctx.open) return;
            if (event.key !== 'Tab' || event.shiftKey || !ctx.contentRef.current) return;
            const first = tabbables(ctx.contentRef.current)[0];
            if (!first) return;
            event.preventDefault();
            ctx.cancel();
            first.focus();
          }}
          {...props}
        />
      </PopoverPrimitive.Anchor>
    );
  },
);

export type HoverCardContentProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  'onOpenAutoFocus' | 'onCloseAutoFocus'
>;

/**
 * The raised preview surface, 288px wide. It does not take focus when it
 * opens; Tab from the trigger enters it, Tab past its last link continues
 * after the trigger, and Escape closes it and returns focus to the trigger.
 */
const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    {
      className,
      align = 'center',
      sideOffset = 6,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onKeyDown,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      ...props
    },
    ref,
  ) {
    const ctx = useHoverCard('HoverCardContent');
    const leaveTo = (to: Node | null) =>
      !to || (!ctx.contentRef.current?.contains(to) && !ctx.triggerRef.current?.contains(to));
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={useComposedRefs(ref, ctx.contentRef)}
          data-slot="hover-card-content"
          id={ctx.contentId}
          role={undefined}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            surfaceClasses,
            'w-72 max-w-[calc(100vw-2rem)] origin-(--radix-popover-content-transform-origin) p-4 text-sm outline-none',
            className,
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            onEscapeKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (ctx.contentRef.current?.contains(document.activeElement))
              ctx.triggerRef.current?.focus();
          }}
          onPointerDownOutside={(event) => {
            onPointerDownOutside?.(event);
            // A press on the trigger follows the link; let it, without a close-reopen flicker.
            if (ctx.triggerRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          onFocusOutside={(event) => {
            onFocusOutside?.(event);
            // Focus leaving is handled by blur, with the close delay.
            event.preventDefault();
          }}
          onPointerEnter={(event) => {
            onPointerEnter?.(event);
            ctx.cancel();
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            if (event.pointerType !== 'touch') ctx.hide();
          }}
          onFocus={(event) => {
            onFocus?.(event);
            ctx.cancel();
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (leaveTo(event.relatedTarget)) ctx.hide();
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== 'Tab' || !ctx.contentRef.current) return;
            const inside = tabbables(ctx.contentRef.current);
            const trigger = ctx.triggerRef.current;
            if (!trigger) return;
            if (event.shiftKey && event.target === inside[0]) {
              event.preventDefault();
              trigger.focus();
            } else if (!event.shiftKey && event.target === inside[inside.length - 1]) {
              const after = tabbables(document).find(
                (el) =>
                  !ctx.contentRef.current?.contains(el) &&
                  !trigger.contains(el) &&
                  trigger.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
              );
              event.preventDefault();
              ctx.setOpen(false);
              (after ?? trigger).focus();
            }
          }}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  },
);

export { HoverCard, HoverCardContent, HoverCardTrigger };

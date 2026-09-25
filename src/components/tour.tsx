import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { cn } from '../lib/utils';
import * as PopoverPrimitive from '../primitives/vendor/radix/react-popover';
import * as Slot from '../primitives/vendor/radix/react-slot';

import { Button } from './button';
import { surfaceClasses } from './popover';

/**
 * A registered target id (see TourAnchor), or a function returning the
 * element. Ids are stable; never target generated class names or nth-child.
 */
export type TourTarget = string | (() => Element | null);

/** Marks an element as a tour target. Merges onto its one child. */
function TourAnchor({ id, children }: { id: string; children: React.ReactElement }) {
  return <Slot.Root data-tour-target={id}>{children}</Slot.Root>;
}

/** The same marker as TourAnchor, for elements you render yourself. */
export const tourTarget = (id: string) => ({ 'data-tour-target': id });

const isVisible = (el: Element | null): el is Element =>
  Boolean(el?.isConnected && el.getClientRects().length > 0);

export function findTourTarget(target: TourTarget | undefined): Element | null {
  if (!target) return null;
  const el =
    typeof target === 'function'
      ? target()
      : (Array.from(document.querySelectorAll('[data-tour-target]')).find(
          (node) => node.getAttribute('data-tour-target') === target,
        ) ?? null);
  return isVisible(el) ? el : null;
}

/**
 * Resolves when the target is mounted and visible, or with null after
 * `timeoutMs` or when `signal` aborts. Handles targets that render late
 * (lazy panels, async data) without polling forever.
 */
export function waitForTourTarget(
  target: TourTarget | undefined,
  timeoutMs: number,
  signal: AbortSignal,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const now = findTourTarget(target);
    if (now || !target || timeoutMs <= 0 || signal.aborted) return resolve(now);
    let done = false;
    const finish = (el: Element | null) => {
      if (done) return;
      done = true;
      observer.disconnect();
      clearInterval(poll);
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      resolve(el);
    };
    const check = () => {
      const el = findTourTarget(target);
      if (el) finish(el);
    };
    const abort = () => finish(null);
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    // Visibility can change through CSS alone, which no mutation reports.
    const poll = setInterval(check, 150);
    const timer = setTimeout(() => finish(null), timeoutMs);
    signal.addEventListener('abort', abort);
  });
}

/**
 * Escape belongs to whatever the person is typing in (a field, CodeMirror's
 * contenteditable, xterm's hidden textarea), not to the tour.
 */
const typingElsewhere = (container: HTMLElement | null) => {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || container?.contains(active)) return false;
  return active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
};

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Follows an element's box across scroll and resize; null until measured. */
function useRect(el: Element | null) {
  const [measured, setMeasured] = React.useState<{ el: Element; rect: DOMRect } | null>(null);
  React.useEffect(() => {
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setMeasured({ el, rect: el.getBoundingClientRect() }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [el]);
  return measured && measured.el === el ? measured.rect : null;
}

/** A ring around the target, optionally dimming the rest of the page. Never blocks clicks. */
function TourHighlight({ rect, dim }: { rect: DOMRect; dim: boolean }) {
  const pad = 4;
  return (
    <div
      aria-hidden
      data-slot="tour-highlight"
      className={cn(
        'pointer-events-none fixed z-40 rounded-md ring-2 ring-brand motion-safe:transition-[top,left,width,height] motion-safe:duration-200',
        dim && 'shadow-[0_0_0_9999px_rgb(10_8_14/0.45)]',
      )}
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }}
    />
  );
}

/** A zero-size box a third of the way down the viewport, for steps without a target. */
const centerRect = () =>
  new DOMRect(window.innerWidth / 2, Math.max(80, window.innerHeight / 3), 0, 0);

const contentClasses = cn(
  surfaceClasses,
  'w-80 max-w-[calc(100vw-2rem)] p-4 text-[13px] outline-none origin-(--radix-popover-content-transform-origin)',
);

export interface TourStep {
  id: string;
  /** Omit for a centred step with no anchor. */
  target?: TourTarget;
  title: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /**
   * Reveal what the step points at (open a panel, switch a route) before it
   * shows. Aborted if the person leaves the step first; a rejection shows the
   * step centred rather than stranding the tour.
   */
  prepare?: (signal: AbortSignal) => void | Promise<void>;
}

export type TourEndReason = 'complete' | 'skip' | 'close' | 'escape';

export interface TourLabels {
  next: string;
  back: string;
  skip: string;
  done: string;
  close: string;
  progress: (step: number, total: number) => string;
}

const defaultLabels: TourLabels = {
  next: 'Next',
  back: 'Back',
  skip: 'Skip tour',
  done: 'Done',
  close: 'Close tour',
  progress: (step, total) => `${step} of ${total}`,
};

export interface TourProps {
  steps: TourStep[];
  open: boolean;
  /** Controlled, zero-based. */
  step: number;
  onStepChange: (step: number) => void;
  /** The tour is over. Store dismissal or completion yourself, keyed by tour id and revision. */
  onEnd: (reason: TourEndReason, step: number) => void;
  /** `center` (default) shows a step whose target never appears in the middle; `skip` moves past it. */
  missingTarget?: 'center' | 'skip';
  /** How long to wait for a late target. Default 2000ms. */
  waitMs?: number;
  /** Dim the page outside the target. Default true. */
  dim?: boolean;
  labels?: Partial<TourLabels>;
  /** Where focus goes if the element that started the tour is gone. */
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * A guided sequence of anchored steps. It is non-modal: the page stays
 * usable and outside clicks do not end it. Focus moves into each step,
 * Escape ends the tour (unless the person is typing in a field or editor
 * outside it), and focus returns to where it was when the tour started.
 * The app owns the copy, the eligibility rules and what it persists.
 */
function Tour({
  steps,
  open,
  step,
  onStepChange,
  onEnd,
  missingTarget = 'center',
  waitMs = 2000,
  dim = true,
  labels: labelOverrides,
  fallbackFocus,
}: TourProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const current = steps[step];
  // The resolved step: which step it is for, and its target (null: centred).
  const stepKey = current ? `${step}:${current.id}` : '';
  const [resolved, setResolved] = React.useState<{ key: string; el: Element | null } | null>(null);
  const ready = open && resolved?.key === stepKey;
  const target = ready ? (resolved?.el ?? null) : null;
  const rect = useRect(target);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // Radix mounts the content after the popper measures, so focus follows the node.
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null);
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const direction = React.useRef(1);
  const titleId = React.useId();
  const bodyId = React.useId();

  // Remember who started the tour; hand focus back when it ends.
  React.useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
    return () => {
      const back = returnFocus.current;
      const el = back && isVisible(back) ? back : (fallbackFocus?.() ?? null);
      el?.focus();
    };
    // fallbackFocus is read at close time; re-running on its identity would steal focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open || !current) return;
    const controller = new AbortController();
    const { signal } = controller;
    void (async () => {
      let prepared = true;
      try {
        await current.prepare?.(signal);
      } catch {
        prepared = false;
      }
      if (signal.aborted) return;
      const el = prepared ? await waitForTourTarget(current.target, waitMs, signal) : null;
      if (signal.aborted) return;
      if (!el && current.target && missingTarget === 'skip') {
        const next = step + direction.current;
        if (next >= 0 && next < steps.length) return onStepChange(next);
      }
      if (el)
        el.scrollIntoView?.({
          block: 'nearest',
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      setResolved({ key: stepKey, el });
    })();
    return () => controller.abort();
    // steps/onStepChange identity changes should not restart a step in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepKey, waitMs, missingTarget]);

  // Shown once resolved and, for an anchored step, measured.
  const shown = ready && (!target || rect !== null);
  React.useEffect(() => {
    if (shown) contentEl?.focus();
  }, [shown, step, contentEl]);

  if (!open || !current) return null;
  const last = step === steps.length - 1;
  const go = (to: number) => {
    direction.current = to < step ? -1 : 1;
    onStepChange(to);
  };
  // Wait one frame for the target's box rather than flashing the step centred.
  if (!shown && ready) return null;
  const anchor = rect ?? centerRect();

  return (
    <>
      {ready && rect && <TourHighlight rect={rect} dim={dim} />}
      <PopoverPrimitive.Root open={shown} modal={false}>
        <PopoverPrimitive.Anchor
          virtualRef={{ current: { getBoundingClientRect: () => anchor } }}
        />
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={(el) => {
              contentRef.current = el;
              setContentEl(el);
            }}
            data-slot="tour"
            data-step={current.id}
            tabIndex={-1}
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            side={rect ? (current.side ?? 'bottom') : 'bottom'}
            align={rect ? (current.align ?? 'center') : 'center'}
            sideOffset={10}
            collisionPadding={12}
            className={contentClasses}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => {
              if (typingElsewhere(contentRef.current)) event.preventDefault();
              else onEnd('escape', step);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  {labels.progress(step + 1, steps.length)}
                </p>
                <h2 id={titleId} className="mt-0.5 text-sm font-semibold text-foreground">
                  {current.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label={labels.close}
                onClick={() => onEnd('close', step)}
                className="-me-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
            <div id={bodyId} className="mt-2 text-muted-foreground">
              {current.content}
            </div>
            <div className="mt-4 flex items-center gap-2">
              {!last && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ms-2"
                  onClick={() => onEnd('skip', step)}
                >
                  {labels.skip}
                </Button>
              )}
              <div className="ms-auto flex gap-2">
                {step > 0 && (
                  <Button variant="outline" size="sm" onClick={() => go(step - 1)}>
                    {labels.back}
                  </Button>
                )}
                <Button size="sm" onClick={() => (last ? onEnd('complete', step) : go(step + 1))}>
                  {last ? labels.done : labels.next}
                </Button>
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  );
}

export interface SpotlightProps {
  target: TourTarget;
  open: boolean;
  onDismiss: (reason: 'dismiss' | 'escape') => void;
  title: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /** Default "Got it". */
  dismissLabel?: string;
  /** An extra button, e.g. "Add a provider". */
  action?: React.ReactNode;
  /** Ring the target. Default true. */
  highlight?: boolean;
  className?: string;
}

/**
 * One contextual hint beside a target: a new feature, a setup nudge. It is
 * informational, so it does not take focus or block the page. Escape (unless
 * the person is typing elsewhere) or the dismiss button closes it. If the target is
 * not on screen, nothing renders.
 */
function Spotlight({
  target,
  open,
  onDismiss,
  title,
  children,
  side = 'bottom',
  align = 'center',
  dismissLabel = 'Got it',
  action,
  highlight = true,
  className,
}: SpotlightProps) {
  const key = typeof target === 'string' ? target : 'fn';
  const [found, setFound] = React.useState<{ key: string; el: Element | null } | null>(null);
  const el = open && found?.key === key ? found.el : null;
  const rect = useRect(el);
  const titleId = React.useId();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void waitForTourTarget(target, 2000, controller.signal).then((found) => {
      if (!controller.signal.aborted) setFound({ key, el: found });
    });
    return () => controller.abort();
    // A new function identity for `target` should not re-run the lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key]);

  if (!open || !el || !rect) return null;
  return (
    <>
      {highlight && <TourHighlight rect={rect} dim={false} />}
      <PopoverPrimitive.Root open modal={false}>
        <PopoverPrimitive.Anchor virtualRef={{ current: { getBoundingClientRect: () => rect } }} />
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={contentRef}
            data-slot="spotlight"
            role="note"
            aria-labelledby={titleId}
            side={side}
            align={align}
            sideOffset={10}
            collisionPadding={12}
            className={cn(contentClasses, 'w-72', className)}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => {
              if (typingElsewhere(contentRef.current)) event.preventDefault();
              else onDismiss('escape');
            }}
          >
            <span className="sr-only" aria-live="polite">
              Tip: {title}
            </span>
            <p id={titleId} className="text-sm font-semibold text-foreground">
              {title}
            </p>
            <div className="mt-1.5 text-muted-foreground">{children}</div>
            <div className="mt-3 flex justify-end gap-2">
              {action}
              <Button
                size="sm"
                variant={action ? 'ghost' : 'default'}
                onClick={() => onDismiss('dismiss')}
              >
                {dismissLabel}
              </Button>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  );
}

export { Spotlight, Tour, TourAnchor };

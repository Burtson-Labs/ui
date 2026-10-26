import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@burtson-labs/ui';

import { createCollection } from '../src/primitives/collection';
import { composeRefs } from '../src/primitives/compose-refs';
import { FocusScope } from '../src/primitives/focus-trap';
import { hideOthers } from '../src/primitives/hide-others';
import { Layer, LayerBranch, layerCount } from '../src/primitives/layer';
import { Portal } from '../src/primitives/portal';
import { Presence, usePresence } from '../src/primitives/presence';
import {
  movementFor,
  nextIndex,
  RovingFocusGroup,
  RovingFocusItem,
} from '../src/primitives/roving-focus';
import { lockScroll, scrollLockCount } from '../src/primitives/scroll-lock';
import { mergeProps, Slot, Slottable } from '../src/primitives/slot';
import { getTabbables, isTabbable } from '../src/primitives/tabbable';
import { findTypeaheadMatch } from '../src/primitives/typeahead';
import { useControllableState } from '../src/primitives/use-controllable-state';
import { useStableId } from '../src/primitives/use-id';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

/** For tests that build their own DOM: runs `fn` against a fresh body, then clears it. */
function withDom(html: string, fn: () => void) {
  document.body.innerHTML = html;
  try {
    fn();
  } finally {
    document.body.innerHTML = '';
  }
}

describe('slot', () => {
  it('renders its child with merged class, style, handlers (child first) and both refs', () => {
    const calls: string[] = [];
    const outer = React.createRef<HTMLButtonElement>();
    const inner = React.createRef<HTMLButtonElement>();
    render(
      <Slot
        ref={outer}
        className="a"
        style={{ color: 'red', margin: 1 }}
        onClick={() => calls.push('slot')}
        data-slot="trigger"
      >
        <button
          ref={inner}
          className="b"
          style={{ color: 'blue' }}
          onClick={() => calls.push('child')}
          data-slot="button"
        >
          Go
        </button>
      </Slot>,
    );
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button.className).toBe('a b');
    expect(button.style.color).toBe('blue');
    expect(button.style.margin).toBe('1px');
    expect(button.dataset.slot).toBe('button');
    expect(outer.current).toBe(button);
    expect(inner.current).toBe(button);
    fireEvent.click(button);
    expect(calls).toEqual(['child', 'slot']);
  });

  it('renders nothing for a non-element child and uses Slottable to pick the target', () => {
    const { container } = render(<Slot className="x">plain text</Slot>);
    expect(container.innerHTML).toBe('');
    render(
      <Slot className="x">
        <span data-testid="before">before</span>
        <Slottable>
          <a href="/x">link</a>
        </Slottable>
        <span data-testid="after">after</span>
      </Slot>,
    );
    const link = screen.getByRole('link');
    expect(link.className).toBe('x');
    expect(link.textContent).toBe('beforelinkafter');
    expect(link.contains(screen.getByTestId('before'))).toBe(true);
  });

  it('mergeProps keeps child values and composes only shared handlers', () => {
    const slotOnly = vi.fn();
    const merged = mergeProps(
      { id: 'slot', onFocus: slotOnly, title: 'slot' },
      { id: 'child', title: undefined },
    );
    expect(merged.id).toBe('child');
    expect(merged.title).toBe('slot');
    expect(merged.onFocus).toBe(slotOnly);
  });
});

describe('composeRefs', () => {
  it('feeds object and callback refs and cleans up', () => {
    const object = React.createRef<string>();
    const seen: (string | null)[] = [];
    const cleanup = vi.fn();
    const callback = (value: string | null) => {
      seen.push(value);
      return cleanup;
    };
    const composed = composeRefs<string>(object, callback, undefined, null);
    const release = composed('node') as unknown as () => void;
    expect(object.current).toBe('node');
    expect(seen).toEqual(['node']);
    release();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(object.current).toBeNull();
  });
});

describe('useControllableState', () => {
  function Counter({ value, onChange }: { value?: number; onChange?: (value: number) => void }) {
    const [count, setCount] = useControllableState({ value, defaultValue: 0, onChange });
    return (
      <button onClick={() => setCount((c) => c + 1)} data-testid="count">
        {count}
      </button>
    );
  }

  it('owns the state when uncontrolled and reports changes', () => {
    const onChange = vi.fn();
    render(<Counter onChange={onChange} />);
    fireEvent.click(screen.getByTestId('count'));
    fireEvent.click(screen.getByTestId('count'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(onChange.mock.calls).toEqual([[1], [2]]);
  });

  it('only reports when controlled, and never for the parent’s own changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Counter value={5} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('count'));
    expect(screen.getByTestId('count').textContent).toBe('5');
    expect(onChange).toHaveBeenCalledWith(6);
    rerender(<Counter value={9} onChange={onChange} />);
    expect(screen.getByTestId('count').textContent).toBe('9');
    expect(onChange).toHaveBeenCalledTimes(1);
    // A parent that declined the change is asked again.
    fireEvent.click(screen.getByTestId('count'));
    expect(onChange).toHaveBeenLastCalledWith(10);
  });
});

describe('useStableId', () => {
  it('prefers the explicit id and strips React’s delimiters', () => {
    function Ids() {
      const a = useStableId();
      const b = useStableId('given');
      return <output>{`${a}|${b}`}</output>;
    }
    render(<Ids />);
    const [a, b] = screen.getByRole('status').textContent.split('|');
    expect(a).toMatch(/^bl-[\w-]+$/);
    expect(b).toBe('given');
  });
});

describe('tabbable', () => {
  it('applies the focusability rules in tab order', () => {
    withDom(
      `<div id="root">
        <a id="noHref">no href</a>
        <a id="link" href="#">link</a>
        <button id="later" tabindex="2">later</button>
        <button id="first" tabindex="1">first</button>
        <button id="disabled" disabled>disabled</button>
        <input id="minus" tabindex="-1" />
        <fieldset disabled><input id="inFieldset" /></fieldset>
        <div hidden><button id="hidden">hidden</button></div>
        <div style="display:none"><button id="displayNone">none</button></div>
        <div inert><button id="inert">inert</button></div>
        <input type="radio" name="r" id="r1" />
        <input type="radio" name="r" id="r2" checked />
        <input type="radio" name="r" id="r3" />
        <details><summary id="summary">s</summary><a id="closed" href="#">c</a></details>
        <span id="editable" contenteditable="true">e</span>
        <span id="guard" tabindex="0" data-bl-focus-guard></span>
        <textarea id="text"></textarea>
      </div>`,
      () => {
        const ids = getTabbables(document.getElementById('root')!).map((el) => el.id);
        expect(ids).toEqual(['first', 'later', 'link', 'r2', 'summary', 'editable', 'text']);
        expect(isTabbable(document.getElementById('minus')!)).toBe(false);
      },
    );
  });

  it('makes the first radio of an unchecked group the tab stop', () => {
    withDom(`<input type="radio" name="g" id="a" /><input type="radio" name="g" id="b" />`, () => {
      expect(getTabbables(document.body).map((el) => el.id)).toEqual(['a']);
    });
  });
});

describe('Portal', () => {
  it('renders into the body after mount, or into a container', () => {
    const container = document.createElement('section');
    document.body.appendChild(container);
    render(
      <>
        <Portal data-testid="p1">one</Portal>
        <Portal container={container}>two</Portal>
      </>,
    );
    expect(screen.getByTestId('p1').parentElement).toBe(document.body);
    expect(container.textContent).toBe('two');
  });
});

describe('presence', () => {
  it('unmounts at once when nothing animates and keeps the node while an animation runs', async () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => (finish = resolve));
    const node = { getAnimations: vi.fn() };
    function Box({ present }: { present: boolean }) {
      return (
        <Presence present={present}>
          <div
            data-testid="box"
            data-state={present ? 'open' : 'closed'}
            ref={(el) => {
              if (el) Object.assign(el, { getAnimations: node.getAnimations });
            }}
          />
        </Presence>
      );
    }
    node.getAnimations.mockReturnValue([]);
    const { rerender } = render(<Box present />);
    expect(screen.getByTestId('box')).toBeTruthy();
    rerender(<Box present={false} />);
    expect(screen.queryByTestId('box')).toBeNull();

    // Now with a running animation: the node stays until it finishes.
    node.getAnimations.mockReturnValue([
      {
        playState: 'running',
        finished,
        effect: { getComputedTiming: () => ({ endTime: 150 }) },
      },
    ]);
    rerender(<Box present />);
    rerender(<Box present={false} />);
    expect(screen.getByTestId('box').dataset.state).toBe('closed');
    await act(async () => {
      finish();
      await finished;
    });
    await waitFor(() => expect(screen.queryByTestId('box')).toBeNull());
  });

  it('ignores infinite animations and skips the wait under reduced motion', () => {
    const infinite = {
      playState: 'running',
      finished: new Promise(() => undefined),
      effect: { getComputedTiming: () => ({ endTime: Number.POSITIVE_INFINITY }) },
    };
    function Box({ present }: { present: boolean }) {
      const ref = React.useRef<HTMLDivElement>(null);
      const mounted = usePresence(present, ref);
      return mounted ? (
        <div
          ref={(el) => {
            ref.current = el;
            if (el) Object.assign(el, { getAnimations: () => [infinite] });
          }}
          data-testid="box"
        />
      ) : null;
    }
    const { rerender } = render(<Box present />);
    rerender(<Box present={false} />);
    expect(screen.queryByTestId('box')).toBeNull();

    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const finite = { ...infinite, effect: { getComputedTiming: () => ({ endTime: 200 }) } };
    function Reduced({ present }: { present: boolean }) {
      const ref = React.useRef<HTMLDivElement>(null);
      const mounted = usePresence(present, ref);
      return mounted ? (
        <div
          ref={(el) => {
            ref.current = el;
            if (el) Object.assign(el, { getAnimations: () => [finite] });
          }}
          data-testid="reduced"
        />
      ) : null;
    }
    const second = render(<Reduced present />);
    second.rerender(<Reduced present={false} />);
    expect(screen.queryByTestId('reduced')).toBeNull();
    vi.unstubAllGlobals();
  });
});

describe('layer', () => {
  function Stack({
    onOuter,
    onInner,
    inner = true,
    modal = false,
    preventInner,
  }: {
    onOuter: () => void;
    onInner: () => void;
    inner?: boolean;
    modal?: boolean;
    preventInner?: boolean;
  }) {
    return (
      <>
        <button>outside</button>
        <Layer data-testid="outer" onDismiss={onOuter} disableOutsidePointerEvents={modal}>
          <button>in outer</button>
          {inner && (
            <Portal>
              <Layer
                data-testid="inner"
                onDismiss={onInner}
                onInteractOutside={preventInner ? (e) => e.preventDefault() : undefined}
              >
                <button>in inner</button>
              </Layer>
            </Portal>
          )}
        </Layer>
        <LayerBranch>
          <button>in branch</button>
        </LayerBranch>
      </>
    );
  }

  it('sends Escape to the top layer only', () => {
    const onOuter = vi.fn();
    const onInner = vi.fn();
    render(<Stack onOuter={onOuter} onInner={onInner} />);
    expect(layerCount()).toBe(2);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onInner).toHaveBeenCalledTimes(1);
    expect(onOuter).not.toHaveBeenCalled();
  });

  it('treats a press in a nested (portaled) layer as inside the outer one', () => {
    const onOuter = vi.fn();
    const onInner = vi.fn();
    render(<Stack onOuter={onOuter} onInner={onInner} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'in inner' }));
    expect(onInner).not.toHaveBeenCalled();
    expect(onOuter).not.toHaveBeenCalled();
    // A press in the outer layer dismisses only the inner one.
    fireEvent.pointerDown(screen.getByRole('button', { name: 'in outer' }));
    expect(onInner).toHaveBeenCalledTimes(1);
    expect(onOuter).not.toHaveBeenCalled();
    // A press on the page dismisses both; a press in a branch, neither.
    fireEvent.pointerDown(screen.getByRole('button', { name: 'outside' }));
    expect(onInner).toHaveBeenCalledTimes(2);
    expect(onOuter).toHaveBeenCalledTimes(1);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'in branch' }));
    expect(onOuter).toHaveBeenCalledTimes(1);
  });

  it('lets a prevented top layer pass the press down, and focus outside dismisses', () => {
    const onOuter = vi.fn();
    const onInner = vi.fn();
    render(<Stack onOuter={onOuter} onInner={onInner} preventInner />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'outside' }));
    expect(onInner).not.toHaveBeenCalled();
    expect(onOuter).toHaveBeenCalledTimes(1);
    screen.getByRole('button', { name: 'outside' }).focus();
    expect(onOuter).toHaveBeenCalledTimes(2);
  });

  it('turns body pointer events off for a modal layer and restores them', () => {
    const { unmount } = render(<Stack onOuter={() => {}} onInner={() => {}} modal />);
    expect(document.body.style.pointerEvents).toBe('none');
    expect(screen.getByTestId('outer').style.pointerEvents).toBe('auto');
    expect(screen.getByTestId('inner').style.pointerEvents).toBe('auto');
    unmount();
    expect(document.body.style.pointerEvents).toBe('');
    expect(layerCount()).toBe(0);
  });
});

describe('FocusScope', () => {
  it('focuses the first tabbable on mount, wraps Tab, and restores focus on unmount', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          {open && (
            <FocusScope trapped loop data-testid="scope">
              <button>one</button>
              <button onClick={() => setOpen(false)}>two</button>
            </FocusScope>
          )}
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'open' });
    await user.click(opener);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'one' }));
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'one' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'two' }));
    await user.keyboard('{Enter}');
    expect(screen.queryByTestId('scope')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('pulls focus back when trapped, and honours prevented auto focus', () => {
    const onMount = vi.fn((event: Event) => event.preventDefault());
    const onUnmount = vi.fn((event: Event) => event.preventDefault());
    render(
      <>
        <button>away</button>
        <FocusScope trapped onMountAutoFocus={onMount} onUnmountAutoFocus={onUnmount}>
          <button>inside</button>
        </FocusScope>
      </>,
    );
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(document.body);
    screen.getByRole('button', { name: 'inside' }).focus();
    screen.getByRole('button', { name: 'away' }).focus();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'inside' }));
  });

  it('selects the text of an input it focuses', () => {
    render(
      <FocusScope>
        <input defaultValue="name" aria-label="name" />
      </FocusScope>,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox');
    expect(document.activeElement).toBe(input);
    expect(input.selectionEnd).toBe(4);
  });
});

describe('scroll lock', () => {
  it('counts locks, hides overflow and restores', () => {
    document.documentElement.style.overflow = 'auto';
    const a = lockScroll();
    const b = lockScroll();
    expect(scrollLockCount()).toBe(2);
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.documentElement.style.getPropertyValue('--bl-scrollbar-gutter')).toBe('0px');
    a();
    a();
    expect(document.documentElement.style.overflow).toBe('hidden');
    b();
    expect(scrollLockCount()).toBe(0);
    expect(document.documentElement.style.overflow).toBe('auto');
    expect(document.documentElement.style.getPropertyValue('--bl-scrollbar-gutter')).toBe('');
  });

  it('cancels touch moves outside the allowed element but not inside a scrollable within it', () => {
    withDom(
      `<div id="allowed"><div id="list" style="overflow-y:auto"><p>x</p></div></div><p id="page">page</p>`,
      () => {
        const list = document.getElementById('list')!;
        Object.defineProperties(list, {
          scrollHeight: { value: 400 },
          clientHeight: { value: 100 },
        });
        list.scrollTop = 0;
        const release = lockScroll(document.getElementById('allowed'));
        const touch = (target: Element, y: number, type: 'touchstart' | 'touchmove') => {
          const event = new Event(type, { cancelable: true, bubbles: true });
          Object.defineProperty(event, 'touches', { value: [{ clientX: 0, clientY: y }] });
          target.dispatchEvent(event);
          return event.defaultPrevented;
        };
        const inner = list.querySelector('p')!;
        touch(inner, 100, 'touchstart');
        // Scrolling the list down (finger moves up) is allowed: it can scroll.
        expect(touch(inner, 50, 'touchmove')).toBe(false);
        // Pulling further down at the top would reach the page: cancelled.
        expect(touch(inner, 150, 'touchmove')).toBe(true);
        const page = document.getElementById('page')!;
        touch(page, 100, 'touchstart');
        expect(touch(page, 50, 'touchmove')).toBe(true);
        release();
      },
    );
  });
});

describe('hideOthers', () => {
  it('hides siblings along the path, keeps live regions, counts nested calls', () => {
    withDom(
      `<div id="app"><p id="text">x</p></div>
      <div id="toasts" aria-live="polite"></div>
      <div id="portal"><div id="overlay"></div><div id="content"></div></div>
      <div id="portal2"><div id="content2"></div></div>`,
      () => {
        const byId = (id: string) => document.getElementById(id)!;
        byId('app').setAttribute('aria-hidden', 'false');
        const releaseFirst = hideOthers(byId('content'));
        expect(byId('app').getAttribute('aria-hidden')).toBe('true');
        expect(byId('overlay').getAttribute('aria-hidden')).toBe('true');
        expect(byId('toasts').hasAttribute('aria-hidden')).toBe(false);
        expect(byId('text').hasAttribute('aria-hidden')).toBe(false);
        expect(byId('portal2').getAttribute('aria-hidden')).toBe('true');
        const releaseSecond = hideOthers(byId('content2'));
        expect(byId('portal').getAttribute('aria-hidden')).toBe('true');
        releaseFirst();
        // The second call still holds the app hidden.
        expect(byId('app').getAttribute('aria-hidden')).toBe('true');
        expect(byId('portal').getAttribute('aria-hidden')).toBe('true');
        releaseSecond();
        expect(byId('app').getAttribute('aria-hidden')).toBe('false');
        expect(byId('portal').hasAttribute('aria-hidden')).toBe(false);
        expect(byId('overlay').hasAttribute('aria-hidden')).toBe(false);
      },
    );
  });
});

describe('hideOthers and live subtrees', () => {
  it('descends into a sibling that holds a live region instead of hiding it whole', () => {
    withDom(
      `<div id="app"></div>
      <div id="toast-portal"><ol id="viewport" role="region" data-bl-live=""><li id="toast">saved</li></ol><div id="beside"></div></div>
      <div id="portal"><div id="content"></div></div>`,
      () => {
        const byId = (id: string) => document.getElementById(id)!;
        const release = hideOthers(byId('content'));
        expect(byId('app').getAttribute('aria-hidden')).toBe('true');
        // The portal around the toasts is left alone; only its non-live child is hidden.
        expect(byId('toast-portal').hasAttribute('aria-hidden')).toBe(false);
        expect(byId('viewport').hasAttribute('aria-hidden')).toBe(false);
        expect(byId('toast').hasAttribute('aria-hidden')).toBe(false);
        expect(byId('beside').getAttribute('aria-hidden')).toBe('true');
        release();
        expect(byId('beside').hasAttribute('aria-hidden')).toBe(false);
      },
    );
  });
});

describe('collection and roving focus', () => {
  it('lists items in document order whatever the registration order', () => {
    const { CollectionProvider, useCollection, useCollectionItem } = createCollection<string>('t');
    let read: () => string[] = () => [];
    function Item({ label }: { label: string }) {
      const ref = React.useRef<HTMLLIElement>(null);
      useCollectionItem(ref, label);
      return <li ref={ref}>{label}</li>;
    }
    function Reader() {
      const { getItems } = useCollection();
      read = () => getItems().map((item) => item.data);
      return null;
    }
    function List({ extra }: { extra: boolean }) {
      return (
        <CollectionProvider>
          <ul>
            {extra && <Item label="zero" />}
            <Item label="one" />
            <Item label="two" />
          </ul>
          <Reader />
        </CollectionProvider>
      );
    }
    const { rerender } = render(<List extra={false} />);
    expect(read()).toEqual(['one', 'two']);
    rerender(<List extra />);
    expect(read()).toEqual(['zero', 'one', 'two']);
  });

  it('computes arrow movement by orientation, direction and loop', () => {
    expect(movementFor('ArrowRight', 'horizontal', false)).toBe('next');
    expect(movementFor('ArrowRight', 'horizontal', true)).toBe('previous');
    expect(movementFor('ArrowDown', 'horizontal', false)).toBeUndefined();
    expect(movementFor('ArrowDown', undefined, false)).toBe('next');
    expect(movementFor('Home', 'vertical', false)).toBe('first');
    expect(nextIndex('next', 2, 3, false)).toBe(-1);
    expect(nextIndex('next', 2, 3, true)).toBe(0);
    expect(nextIndex('previous', 0, 3, true)).toBe(2);
    expect(nextIndex('last', 0, 3, false)).toBe(2);
  });

  it('gives one item the tab stop and moves it with the arrows, skipping unfocusable items', async () => {
    const user = userEvent.setup();
    render(
      <RovingFocusGroup orientation="horizontal" loop>
        <RovingFocusItem asChild>
          <button>a</button>
        </RovingFocusItem>
        <RovingFocusItem asChild focusable={false}>
          <button disabled>b</button>
        </RovingFocusItem>
        <RovingFocusItem asChild active>
          <button>c</button>
        </RovingFocusItem>
      </RovingFocusGroup>,
    );
    const a = screen.getByRole('button', { name: 'a' });
    const c = screen.getByRole('button', { name: 'c' });
    expect(c.tabIndex).toBe(0);
    expect(a.tabIndex).toBe(-1);
    c.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(a);
    expect(a.tabIndex).toBe(0);
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(c);
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(a);
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(c);
  });
});

describe('typeahead', () => {
  it('matches the next label starting with the typed string, cycling on a repeated letter', () => {
    const labels = ['Apple', 'Avocado', 'Banana', 'Blueberry', 'Cherry'];
    expect(findTypeaheadMatch(labels, 'b', -1)).toBe(2);
    expect(findTypeaheadMatch(labels, 'b', 2)).toBe(3);
    expect(findTypeaheadMatch(labels, 'bb', 2)).toBe(3);
    expect(findTypeaheadMatch(labels, 'bb', 3)).toBe(2);
    expect(findTypeaheadMatch(labels, 'bl', 2)).toBe(3);
    expect(findTypeaheadMatch(labels, 'av', 0)).toBe(1);
    expect(findTypeaheadMatch(labels, 'ch', 4)).toBe(4);
    expect(findTypeaheadMatch(labels, 'z', 0)).toBe(-1);
    expect(findTypeaheadMatch([], 'a', 0)).toBe(-1);
  });
});

describe('overlay stacks in transition', () => {
  it('a modal layer never restores a pointer-events value another stack set', () => {
    document.body.style.pointerEvents = 'none';
    const { unmount } = render(
      <Layer disableOutsidePointerEvents onDismiss={() => {}}>
        <div>modal</div>
      </Layer>,
    );
    expect(document.body.style.pointerEvents).toBe('none');
    unmount();
    expect(document.body.style.pointerEvents).toBe('');
  });
});

describe('hideOthers beside the other overlay stack', () => {
  it('does not restore an aria-hidden the other stack set, whichever releases first', () => {
    withDom(
      `<div id="dialog" aria-hidden="true" data-aria-hidden="true"></div>
      <div id="portal"><div id="alert"></div></div>`,
      () => {
        const byId = (id: string) => document.getElementById(id)!;
        // The vendored Select has hidden the dialog; our AlertDialog opens on top.
        const release = hideOthers(byId('alert'));
        expect(byId('dialog').getAttribute('aria-hidden')).toBe('true');
        // The Select closes first and clears its own marks.
        byId('dialog').removeAttribute('aria-hidden');
        byId('dialog').removeAttribute('data-aria-hidden');
        release();
        expect(byId('dialog').hasAttribute('aria-hidden')).toBe(false);
        // The other order: we release while the other stack still holds it.
        byId('dialog').setAttribute('aria-hidden', 'true');
        byId('dialog').setAttribute('data-aria-hidden', 'true');
        hideOthers(byId('alert'))();
        expect(byId('dialog').getAttribute('aria-hidden')).toBe('true');
      },
    );
  });
});

describe('a dialog opened from a menu item', () => {
  function MenuThenDialog() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setOpen(true)}>Rename…</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Pick a new name.</DialogDescription>
            <input aria-label="Name" />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  it('stays open while the closing menu hands focus back, and the page stays clickable after', async () => {
    const user = userEvent.setup();
    render(<MenuThenDialog />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename…' }));
    const dialog = await screen.findByRole('dialog');
    // The menu's focus return must not read as "focus moved outside".
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(screen.queryByRole('dialog')).toBe(dialog);
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.body.style.pointerEvents).toBe('');
  });
});

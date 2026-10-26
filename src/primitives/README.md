# Burtson primitives

The behaviour layer under the components: focus, dismissal, positioning,
presence, scroll locking, composition. Written by Burtson Labs from the
WAI-ARIA Authoring Practices, the DOM and CSS specifications and the kit's
own documented behaviour. It is not a port of another library, and nothing
here reads from `vendor/`.

Everything is headless: no classes, no theme. A component in
`src/components` imports a module from here, adds its classes and `data-slot`
attributes and re-exports the result under the kit's names. Copy-source
consumers get the same files through the registry (`primitive-<module>` items
under `lib/burtson-primitives/`), with their full MIT notice.

## Modules

| Module                                                                          | What it is                                                                                                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slot`                                                                          | `Slot`, `Slottable`, `mergeProps`: the `asChild` pattern.                                                                                                            |
| `compose-refs`                                                                  | `composeRefs`, `useComposedRefs`, `setRef`: one node, several refs, React 18 and 19.                                                                                 |
| `compose-handlers`                                                              | `composeHandlers(theirs, ours)`: the caller's handler first; ours unless it prevented the event.                                                                     |
| `element-ref`                                                                   | `getElementRef`: an element's ref on either React major.                                                                                                             |
| `use-controllable-state`                                                        | The `value` / `defaultValue` / `onChange` triple.                                                                                                                    |
| `use-id`                                                                        | `useStableId`: SSR-safe ids without React's delimiters.                                                                                                              |
| `use-layout-effect`                                                             | `useIsoLayoutEffect`: layout effect in the browser, plain effect on the server.                                                                                      |
| `use-callback-ref`                                                              | `useCallbackRef`: a stable function that calls the latest callback.                                                                                                  |
| `tabbable`                                                                      | `getTabbables`, `isTabbable`, `isFocusable`: the Tab sequence from the HTML focusability rules.                                                                      |
| `presence`                                                                      | `usePresence`, `Presence`: stay mounted through an exit animation.                                                                                                   |
| `portal`                                                                        | `Portal`: `createPortal` into the body or a `container`, nothing on the server.                                                                                      |
| `layer`                                                                         | `Layer`, `LayerBranch`: the dismissable layer stack (Escape, press outside, focus outside, modal pointer events).                                                    |
| `focus-trap`                                                                    | `FocusScope`: focus in on mount, wrap, trap, restore on unmount.                                                                                                     |
| `anchor-geometry`                                                               | `computePlacement` and rect helpers: the positioning arithmetic, no DOM.                                                                                             |
| `anchor`                                                                        | `AnchorProvider`, `Anchor`, `Positioned`, `Arrow`, `useAnchoredPlacement`: the positioning engine's DOM side.                                                        |
| `scroll-lock`                                                                   | `lockScroll`, `useScrollLock`: counted page scroll lock with gutter compensation and touch handling.                                                                 |
| `hide-others`                                                                   | `hideOthers`, `useHideOthers`: `aria-hidden` and `inert` on everything but the live surface.                                                                         |
| `collection`                                                                    | `createCollection`: an ordered registry of a composite's items.                                                                                                      |
| `roving-focus`                                                                  | `RovingFocusGroup`, `RovingFocusItem`, `movementFor`, `nextIndex`: roving tabindex.                                                                                  |
| `typeahead`                                                                     | `findTypeaheadMatch`, `useTypeahead`: type-to-find for menus and lists.                                                                                              |
| `popover`                                                                       | Popover: Root, Trigger, Anchor, Portal, Content, Close, Arrow.                                                                                                       |
| `tooltip`                                                                       | Tooltip: Provider, Root, Trigger, Portal, Content, Arrow.                                                                                                            |
| `dialog`                                                                        | Dialog: Root, Trigger, Portal, Overlay, Content, Title, Description, Close.                                                                                          |
| `alert-dialog`                                                                  | AlertDialog on Dialog: Action and Cancel, `role="alertdialog"`, no outside dismissal, focus on Cancel.                                                               |
| `collapsible`                                                                   | Collapsible: Root, Trigger, Content, with measured height and width for animations.                                                                                  |
| `pointer-intent`                                                                | `graceTriangle`, `pointInPolygon`: the region a pointer may cross on its way into a submenu.                                                                         |
| `menu`                                                                          | The menu core: Root, Anchor, Portal, Content, Group, Label, Item, CheckboxItem, RadioGroup, RadioItem, ItemIndicator, Separator, Arrow, Sub, SubTrigger, SubContent. |
| `dropdown-menu`                                                                 | DropdownMenu on `menu`: a menu button that owns the open state.                                                                                                      |
| `context-menu`                                                                  | ContextMenu on `menu`: the `contextmenu` event or a long press, anchored at the pointer.                                                                             |
| `menubar`                                                                       | Menubar on `menu`: Root, Menu, Trigger, and the rest; Left and Right across menus, pointer-follow, `loop`.                                                           |
| `select`                                                                        | Select: Root, Trigger, Value, Icon, Portal, Content, Viewport, Group, Label, Item, ItemText, ItemIndicator, ScrollUpButton, ScrollDownButton, Separator, Arrow.      |
| `command-score`                                                                 | `commandScore`, `normalizeText`: the palette's matcher and ranking.                                                                                                  |
| `command`                                                                       | Command: Root, Input, List, Group, Item, Separator, Empty, Loading, `useCommandState`, `defaultFilter`.                                                              |
| `navigation-menu`                                                               | NavigationMenu: Root, Sub, List, Item, Trigger, Link, Content, Viewport, Indicator.                                                                                  |
| `tabs`                                                                          | Tabs: Root, List, Trigger, Content; automatic or manual activation.                                                                                                  |
| `accordion`                                                                     | Accordion on Collapsible: Root (single or multiple), Item, Header, Trigger, Content.                                                                                 |
| `form-proxy`                                                                    | `FormProxy`, `useInForm`: a native input that lets a button-based control submit, validate and reset.                                                                |
| `checkbox`                                                                      | Checkbox: Root, Indicator; checked, unchecked or indeterminate.                                                                                                      |
| `radio-group`                                                                   | RadioGroup: Root, Item, Indicator; arrows move and choose.                                                                                                           |
| `switch`                                                                        | Switch: Root, Thumb.                                                                                                                                                 |
| `toast`                                                                         | Toast: Provider, Viewport, Root, Title, Description, Action, Close; timing, swipe, announcements.                                                                    |
| `scroll-area`                                                                   | ScrollArea: Root, Viewport, Scrollbar, Thumb, Corner; drawn scrollbars over a native scroller.                                                                       |
| `avatar`                                                                        | Avatar: Root, Image, Fallback, `useImageLoadingStatus`.                                                                                                              |
| `progress`                                                                      | Progress: Root, Indicator.                                                                                                                                           |
| `separator`                                                                     | Separator: decorative (`role="none"`) or semantic.                                                                                                                   |
| `label`                                                                         | Label: a native label that does not select its text on a double press.                                                                                               |
| Each headless module exports its parts under both long names (`PopoverContent`) |
| and short ones (`Content`), so a component can `import * as PopoverPrimitive`   |
| and read as it always has.                                                      |

## Decisions, and why

### Composition

- **Slot merges child-first.** When the Slot and its child both handle an event,
  the child's handler runs first, then the Slot's, always. A child's
  `preventDefault()` does not cancel the Slot's handler: that decision belongs to
  the component, which composes the caller's prop with its own behaviour through
  `composeHandlers` (theirs first; ours skipped when they prevented). So
  `<DialogTrigger onClick={(e) => e.preventDefault()}>` keeps the dialog closed,
  while a child element's own `onClick` cannot silently disable a trigger.
- **Slot with several children** needs one `Slottable`; the others render inside
  the element that child renders. A child that is not an element renders
  nothing: there is no node to merge onto.
- **Refs work on React 18 and 19.** `composeRefs` returns a cleanup. React 19
  runs it; React 18 ignores it and calls the callback with `null`, which the
  cleanup also handles. `getElementRef` reads `props.ref` on 19 and the element
  field on 18, so no deprecation warning is logged.
- **`useControllableState` reports synchronously.** `onChange` fires from the
  setter, not from an effect, so a controlled parent updates in the same event.
  It never fires when nothing changed or when the parent changed the value
  itself. Two calls in one event build on each other when uncontrolled; a
  controlled parent that declined a change is asked again next time.

### Presence

- **The stylesheet drives the exit.** The consumer renders `data-state="closed"`
  the moment its state closes; CSS starts the exit animation from that
  attribute; `usePresence` asks the element for its running animations and
  transitions (`getAnimations()`) and unmounts when the last one ends, with a
  timeout at the longest computed end time as a safety net. Infinite animations
  (a pulse) are ignored or the element would never leave; descendants are not
  consulted so a spinner inside a dialog never holds it open.
- **Reduced motion skips the wait.** The kit shortens every animation to 1ms
  under `prefers-reduced-motion`, so waiting would be pointless; the element
  unmounts at once.
- **The closing render keeps the node.** Presence derives "exiting" during the
  render in which `present` turns false, so the node is still there for the
  stylesheet to animate and for the hook to inspect in its layout effect.

### Layers

- **One stack, in opening order.** Escape goes to the top layer only. A press
  or focus is "inside" a layer if it is inside the layer's element, inside a
  `LayerBranch`, or inside a React descendant of the layer that renders through
  a portal. That last rule is what makes a menu opened from a dialog belong to
  the dialog although it lives elsewhere in the DOM, and what keeps a vendored
  Radix overlay (phase 2 territory) from closing a Burtson dialog it sits in.
  The document listeners run in the bubble phase so the layer's own capture
  handlers have marked such events first.
- **Outside presses walk down.** A press outside the top layer is announced to
  it, and then to each layer below, down to the top modal layer. Each may
  `preventDefault()` to stay open. So one press on the page closes a popover and
  the dialog it was opened from, while a layer that refuses (a tour step) does
  not shield the popover under it. Nothing under a modal layer is ever
  dismissed by what happens above it; it is covered.
- **Escape from a nested overlay is not ours.** When the key event came through
  the layer's React subtree but its target is outside the layer's element, a
  nested overlay with its own Escape handling has it.
- **Modal pointer events.** A layer with `disableOutsidePointerEvents` sets
  `pointer-events: none` on the body and `auto` on itself and every layer above
  it; layers below get `none`. The dialog's overlay sets `pointer-events: auto`
  inline so the press that dismisses still lands on it.

### Focus

- **Tabbables from the rules, not a selector.** `getTabbables` applies disabled
  state (including a disabled fieldset), `tabindex="-1"`, `inert` subtrees,
  `display: none` and `visibility: hidden` ancestors, closed `<details>`, and
  the radio-group rule (the checked radio, or the first when none is). Positive
  tabindex values come first in ascending order, as the browser orders them.
- **FocusScope stacks like layers.** Only the newest scope enforces its trap, so
  a trapped dialog does not fight a popover opened from inside it. Focus that
  comes through the scope's React subtree (a portal) is inside.
- **Mount: first tabbable, else the scope itself when focusable; inputs get
  their text selected.** Both the mount move and the unmount restore can be
  prevented (`onMountAutoFocus`, `onUnmountAutoFocus`) by calling
  `preventDefault()` on the event the scope passes. Restore goes to
  `restoreFocusTo()` (a trigger) or the element focused before the scope
  mounted.
- **Wrapping is by keydown.** Tab on the last tabbable (or Shift+Tab on the
  first) moves focus to the other end when `loop` or `trapped`. No hidden
  focus-guard elements are rendered.
- **A press outside does not pull focus back to the trigger.** When a popover
  or non-modal dialog closes because of a press elsewhere, the press decided
  where focus goes. Escape and the close button return it to the trigger. A
  modal dialog always returns focus to its trigger: the press landed on the
  overlay, nowhere useful. After a press that restore is deferred by a task
  (`setTimeout(0)`): the browser runs the press's own focus change (a
  mousedown on nothing focusable blurs to the body) after our listener, and a
  synchronous restore would be undone by it when the dialog unmounts at once
  (no exit animation, reduced motion).
- **A press on the trigger of an open popover is not an outside dismissal.**
  The trigger's own click toggles; dismissing first would close and reopen.

### Positioning

- **Pure geometry first.** `computePlacement` takes rectangles and numbers and
  returns `x`, `y`, the side and alignment used, available room, the arrow's
  offset and a `transform-origin`. It is tested as arithmetic. The DOM side
  (`Positioned`) measures, calls it, and writes the result.
- **Order of operations.** For each candidate placement the box is shifted
  along the alignment axis to stay inside the boundary (`sticky: 'partial'`
  stops it sliding off the anchor; `'always'` lets it), then its overflow is
  measured. Candidates: the preferred side and alignment, then the opposite
  alignment on the same side, then the opposite side with each. The first with
  no overflow wins; else the first that fits on the side axis; else the one
  that overflows least there. `avoidCollisions={false}` considers only the
  preferred placement.
- **Offsets.** `sideOffset` is the gap on the side axis; an arrow's height is
  added so the arrow sits in the gap. `alignOffset` moves the box inward from
  its aligned edge for `start` and `end`; for `center` it moves toward the end
  (right, or left in RTL; down on the left and right sides). RTL (the content's
  computed `direction`) swaps start and end on the top and bottom sides only.
- **Transform origin** is the point on the box nearest the anchor's centre, on
  the edge facing the anchor (at the arrow's tip when there is an arrow), so a
  scale animation grows out of the anchor.
- **Fixed positioning, written straight to the DOM.** The wrapper is
  `position: fixed; left: 0; top: 0` and moved with a transform, leaving the
  content's own transform free for animations. The wrapper sets
  `transition: none` inline: a page's global transition rule (even the kit's
  reduced-motion `transition-duration: 1ms`) would otherwise animate the
  transform, lagging behind scrolling and leaving the box at the viewport
  origin for its first frame. Anchor and content resizes
  (`ResizeObserver`), any scroll (capture) and window resizes are coalesced
  into one animation frame; only a change of side or alignment re-renders. A
  transformed, filtered or paint-contained ancestor forms the containing block
  for a fixed box; its offset is subtracted. The wrapper takes the content's
  computed `z-index`. `hideWhenDetached` hides the box while the anchor is
  scrolled out of its clipping ancestors.
- **CSS variables.** The wrapper publishes `--bl-anchor-width`,
  `--bl-anchor-height`, `--bl-available-width`, `--bl-available-height` and
  `--bl-transform-origin`; the content inherits them. Each component also sets
  the older `--radix-<component>-content-*`, `--radix-<component>-trigger-*` and
  `--radix-popper-*` names as aliases. Those are deprecated and will be removed
  in a later major.
- **Virtual anchors.** `Anchor` with `virtualRef` registers an object with
  `getBoundingClientRect`; a new ref object means a new box.

### Page lock and hiding

- **Scroll lock is counted** and compensates the scrollbar gutter by measuring
  the viewport before and after `overflow: hidden`, so a page with
  `scrollbar-gutter: stable` is not padded twice. The width is published as
  `--bl-scrollbar-gutter` on `<html>` for fixed headers. While locked, a
  `touchmove` that would reach the page is cancelled unless a scrollable
  ancestor inside the allowed element can still move that way.
- **hideOthers** marks every sibling along the path from the surface to the
  body with `aria-hidden="true"` and, where supported, `inert`. Live regions
  are never hidden; nested calls count and restore the previous attributes
  when the last one releases. A component hides from its portal node, not
  from the surface itself: an overlay beside the surface must stay
  hit-testable (inert elements are not), or the press on it would fall
  through to the page.

### Composite widgets

- **Collection** keeps items in a `Map` and sorts by `compareDocumentPosition`
  on read, so document order holds whatever the render or portal order.
- **Roving focus** is the Authoring Practices pattern: the current item has
  `tabindex="0"`, the others `-1`; the group has none. After every render the
  group checks that the current tab stop is still focusable and otherwise hands
  it to the `active` item or the first focusable one. Arrows follow
  `orientation` and the computed writing direction; `loop` wraps.
- **Typeahead** is a pure function plus a hook that keeps the search string and
  its timer.

### Components built here

- **Popover** is non-modal by default: outside press and focus dismiss; Tab
  wraps inside (`loop`); `modal` adds the trap, page lock and hiding.
- **Tooltip** opens on hover after the provider's delay and on keyboard focus at
  once; never on touch or on a press (a press that focuses the button is not a
  request for its label). It closes when the pointer leaves, on blur, on a
  press and on Escape. The visible element is the `role="tooltip"` element and
  is referenced from the trigger's `aria-describedby` while open. Hoverable
  content: when the pointer leaves the trigger toward the content it may cross
  the gap, tracked as the box spanning both; leaving that box closes.
  `TooltipProvider` keeps the skip-delay window: within `skipDelayDuration` of
  one tooltip closing, the next opens instantly.
- **Dialog** registers its Title and Description, so `aria-labelledby` and
  `aria-describedby` reference elements that exist. `aria-describedby={undefined}`
  leaves the description out on purpose. No development warnings are logged
  for a missing title; the kit's tests and lint are where that is caught.
- **AlertDialog** is a Dialog with `role="alertdialog"`, outside presses
  ignored (Escape still cancels) and initial focus on Cancel.
- **Collapsible** measures its content whenever it opens or closes, with the
  animation paused for the measurement, and publishes
  `--bl-collapsible-content-height` / `-width` (and the `--radix-` aliases) for
  the height keyframes. The measurement runs before the presence check so the
  animation that restarts after it is the one presence waits for.

### Composite widgets and form controls (phase 2, part B)

- **Tabs** follow the Authoring Practices tabs pattern on `roving-focus`. In
  automatic mode a tab is selected when it receives focus; in manual mode
  arrows only move focus and Enter or Space selects. A press selects on
  `mousedown` (primary button, no Ctrl, which is the macOS context-menu
  press). The list's tab stop is the selected tab whenever focus is outside
  the list, so focus coming back in always lands on the selection, even
  after arrowing ahead of it in manual mode. Ids are derived from the root's
  id and the value, with characters that ids cannot carry (spaces) escaped,
  so `aria-controls` is always a single token. The panel is in the Tab
  sequence. The list itself is not a Tab stop (the roving item is).
- **Accordion** is a set of Collapsibles. In single mode without
  `collapsible`, the open section's button reports `aria-disabled="true"` and
  a press on it is ignored (the pattern's "cannot be collapsed" case); the
  button stays focusable. Every header button is a Tab stop (the pattern does
  not use roving tabindex here); arrows for the orientation, Home and End move
  between enabled buttons and wrap. The content is a `region` labelled by
  its button. `--bl-accordion-content-height/width` (and the deprecated
  `--radix-accordion-content-*` the kit's keyframes read) are set as
  `var(--bl-collapsible-content-*)`, so there is one measurement.
- **Form participation** (`form-proxy`). Checkbox, Switch and RadioGroup are
  buttons, which a form neither submits nor validates. When the control is
  in a form (an ancestor, or the `form` attribute) a native input is rendered
  after it, 1px, transparent, `aria-hidden`, `tabindex="-1"`, no pointer
  events, carrying `name`, `value`, the checked state, `required` and
  `disabled`. The browser then submits it, blocks submission with its own
  message, and resets it. Focus the browser sends to an invalid proxy is
  passed to the visible control. The proxy's default state is the
  control's initial state, and a form `reset` sets the control back to it.
  A change dispatches bubbling `input` and `change` events on the proxy (a
  radio only when it becomes checked, as natively). No proxy is rendered
  outside a form. An indeterminate checkbox submits nothing (as a native
  unchecked one).
- **Checkbox**: Space toggles (the button's activation), Enter does nothing
  (the pattern; Enter in a form must not toggle). Indeterminate goes to
  checked on a press. The Indicator renders while checked or indeterminate
  and ignores pointer events, so a press on the mark is a press on the box.
- **RadioGroup** is a roving-focus group where moving is choosing: the
  radio's own roving handler moves focus on an arrow key, and the group,
  seeing the key it prevented bubble up, chooses the radio that now has
  focus. Home and End move focus without choosing. Tab into the group lands
  on the chosen radio (else the first). Enter does nothing. A required group
  without a `name` gets a generated one, so its native radios validate as one
  group. The item's `checked` prop is accepted and ignored; the group's value
  decides.
- **Switch** is a button with `role="switch"`; Space and Enter toggle (the
  pattern allows both).
- **Label** is the native element; the browser's label activation toggles a
  checkbox, switch or radio button and focuses a field. A double press on the
  caption is prevented from selecting text; presses on a control inside the
  label are not touched.
- **Separator**: `decorative` renders `role="none"`; otherwise
  `role="separator"` with `aria-orientation` only when vertical (horizontal
  is the role's default). An unknown orientation is horizontal.
- **Progress**: a value outside `0..max` or not finite is indeterminate (no
  `aria-valuenow`); a `max` that is not a positive number is 100.
  `aria-valuetext` is a whole percentage unless `getValueLabel` says
  otherwise. `data-state` is indeterminate, loading or complete.
- **Avatar** loads `src` in a detached `Image` (with `referrerPolicy` and
  `crossOrigin` copied) and renders the `<img>` only once it has loaded. A
  missing `src` is an error. The fallback shows whenever the image is not
  loaded, after `delayMs` when given. `onLoadingStatusChange` hears
  "loading", then "loaded" or "error".

### Toasts

- **The region.** The viewport is an `<ol>` inside a `role="region"` landmark
  named by `label` ("Notifications ({hotkey})"). The region is a
  `LayerBranch` and carries `data-bl-live`, so a modal's `hideOthers` leaves
  it reachable, a press in it dismisses nothing, and a trapping FocusScope
  lets focus go there. The region has `pointer-events: none`; each toast
  sets `pointer-events: auto`, so the empty corner of the screen never blocks
  the page, and toasts stay pressable under a modal (which turns pointer
  events off on the body).
- **Toasts portal into the viewport**, wherever they are rendered under the
  provider. React's events from a toast therefore do not reach the
  viewport's React handlers; hover and focus are watched with native
  listeners on the list.
- **The hotkey** (`['F8']`; `event.code` values and modifier names such as
  `altKey`) focuses the list from anywhere. Tab then walks the toasts (each
  is focusable).
- **Timing.** A toast closes after `duration` (its own, else the
  provider's; `Infinity` never). Every timer pauses while the pointer (not a
  touch) is over the list, while focus is inside it, and while the window is
  blurred, and resumes with what was left. A change of `duration` restarts
  the full time. `onPause` and `onResume` report the transitions.
- **Announcing once.** The toast is not a live region. When it opens, a
  visually hidden region (`role="alert"`, `aria-live="assertive"` for
  `type="foreground"`; `role="status"`, polite, for `"background"`) is
  rendered empty into `announcerContainer` (the body), filled 50ms later (a
  region inserted with its text is not reliably announced) and removed after
  a second. The text is the provider `label`, then the toast's text with each
  Action's `altText` instead of its label and the Close button left out.
- **Swipe.** A primary-button press that travels 10px, mostly along the
  swipe axis and toward the dismissal side, starts a swipe (pointer capture,
  no text selection, timer paused). The toast moves only toward that side.
  Releasing at `swipeThreshold` or further dismisses (`data-swipe="end"`,
  end variables set); otherwise it springs back (`data-swipe="cancel"`). A
  cancelled pointer cancels. The click that ends a swipe is swallowed.
  `onSwipeStart/Move/Cancel/End` receive a cancelable `CustomEvent` with
  `detail.originalEvent` and `detail.delta`; preventing a move skips the
  variables, preventing an end keeps the toast. The toast sets
  `touch-action` to allow scrolling across the swipe axis only.
- **Escape** in a focused toast closes it (preventable through
  `onEscapeKeyDown`) and is consumed, so a dialog behind stays open; focus
  inside a closing toast moves to the list. Escape on the list itself is the
  dialog's.
- **Layer and focus-trap changes.** `isInLayerBranch` is exported from
  `layer`; a trapping FocusScope ignores focus that lands in a branch, and
  the layer stack ignores an Escape that a branch already handled
  (`defaultPrevented`).

### Scroll areas

- **A native scroller underneath.** The viewport keeps wheel, touch,
  keyboard scrolling (Chrome makes a scroller with no focusable children a
  Tab stop), find-in-page and scroll anchoring. Its own scrollbars are hidden
  with `scrollbar-width: none` and the `::-webkit-scrollbar` rule in a small
  `<style>` (with `nonce`). An axis without a Scrollbar is
  `overflow: hidden`.
- **Content wrapper.** Children sit in `min-width: 100%; display: table`, so
  content wider than the viewport widens the wrapper and is measured
  (`scrollWidth`) rather than spilling; this is the layout the kit has
  always had.
- **Measurement.** Thumb length is the visible fraction of the track
  (`clientSize / scrollSize`, 18px minimum); offset is the scroll ratio of
  the free track. Both are written to the DOM on every `scroll` event and
  after a `ResizeObserver` frame (viewport, content, scrollbar), without a
  React render. The thumb is moved from where the layout put it
  (`offsetLeft`/`offsetTop`), so a stylesheet that aligns it differently
  (a flex column in RTL puts it at the right end) still lines up.
- **RTL** horizontal scrolling uses the browser's negative `scrollLeft`
  (0 at the right edge, `-max` at the left); `thumbOffset` and
  `positionForThumb` map between the two with an explicit range, tested as
  arithmetic. The vertical scrollbar and the corner move to the left.
- **Interaction.** Dragging the thumb scrolls proportionally (pointer
  capture on the scrollbar, `scrollTo` with `behavior: 'instant'` so a page's
  `scroll-behavior: smooth` does not lag the thumb; text selection off while
  dragging). A press on the track pages by one viewport toward the press. A
  wheel over a scrollbar that is outside the viewport scrolls the viewport
  and cancels the page scroll only when the viewport moved.
- **Visibility.** `hover` (default): while the pointer is over the root or
  the axis is scrolling, then `scrollHideDelay` (600ms) more; `scroll`:
  only while scrolling; `auto`: whenever the axis overflows; `always`:
  always. All but `always` need overflow. `data-state` is visible or hidden
  and presence keeps a scrollbar mounted through an exit animation. The
  corner renders where two visible scrollbars meet (not for `scroll`), and
  the root publishes the corner size so the scrollbars stop short of it.

### Menus

- **One core, three fronts.** `menu` is the ARIA menu: the surface, the rows,
  the keyboard and the submenus. It is controlled only; `dropdown-menu`,
  `context-menu` and `menubar` own the open state because what opens a menu
  differs (a button, a right-click, a bar's current value). Each front passes
  its trigger, its ids and a `FocusOnOpenHandle` into the core.
- **Rows take real focus.** The highlighted row is the focused row
  (`data-highlighted` follows focus), so the kit's `focus:` classes work and
  assistive technology follows the highlight. The pointer resting on a row
  focuses it; leaving it focuses the surface, so nothing is highlighted; a
  disabled row under the pointer also leaves nothing highlighted.
- **Where focus goes on open** is decided by the trigger before it opens:
  Enter, Space and Down focus the first row, Up (menubar) the last, a press
  focuses the surface so the first arrow key reaches the first row. A
  submenu opened by the pointer leaves focus on its trigger row until the
  pointer reaches it; opened by the keyboard, its first row has focus.
- **Activation is the pointer's release, not the click.** The press records
  the row's box; the release, heard at the document (so it counts when the
  row moved or capture was lost), activates the row when it lands in that box
  or in the row's box now. The click that follows is ignored, and so is a
  click with no press (a long press that opened the menu under the finger,
  released on a row). A click with no pointer at all (keyboard, assistive
  technology) activates. Enter and Space activate from the keyboard; Space
  continues a typeahead search instead when one is running.
- **`onSelect` is a cancelable event.** `bl-menu-item-select` is dispatched on
  the row; `preventDefault()` keeps the menu open (checkbox and radio rows in
  a "view options" menu). Otherwise the whole tree closes, submenus included.
- **Escape closes one level, Tab closes all.** Escape goes to the top layer
  (the deepest open submenu) and focus returns to that level's trigger. Tab
  is prevented and closes everything; focus returns to the menu button.
- **Submenus and pointer intent.** A submenu opens after the pointer rests
  on its row for 100ms, and with Right (Left in RTL), Enter or Space. When the
  pointer leaves the row toward an open submenu, the parent surface keeps a
  grace triangle (`pointer-intent`: the exit point and the near edge of the
  submenu, widened by 5px); rows and the surface background inside the
  triangle do not take the highlight, so a diagonal path does not close the
  submenu. The triangle is spent once the pointer enters the submenu or
  leaves it. A row outside the triangle takes the highlight and closes every
  submenu but its own. Focus moving to a submenu's trigger row, or to the
  parent surface itself, never dismisses the submenu.
- **A closing menu restores focus only if focus was still inside it.** When
  another row took the highlight and closed a submenu, focus stays on that
  row. A modal root closed by a press outside returns focus to its trigger
  after the browser's own focus change; a non-modal one leaves it where the
  press put it.
- **The surface holds still while pressed.** A press on a row sets
  `data-bl-hold` on the positioned wrapper (`holdPlacement`); the positioning
  engine skips updates until the release, so a submenu does not flip or move
  between a finger going down and coming up.
- **Submenu placement.** Beside the trigger row on the reading side (`right`,
  `left` in RTL; flipped by collisions, reported in `data-side`), the first
  row level with the trigger (`alignOffset` -4 for the surface's padding).
  RTL comes from the `dir` prop or the computed direction of the parent.
- **Menubar.** The bar is a `RovingFocusGroup` of `menuitem` buttons (Left,
  Right, Home, End; `loop`). Down, Enter and Space open with the first row,
  Up with the last. Inside an open menu, Right at a row that is not a submenu
  trigger (and Left at the root level) moves to the neighbouring menu with
  its first row focused. An open menu follows the pointer onto another
  button. Presses and focus on the bar's buttons never dismiss its menus
  (`MenuCrossNavigation.owns`), so switching menus does not close the one
  that is opening.
- **Context menu.** The `contextmenu` event is prevented and the menu opens
  at a zero-size virtual anchor at the pointer (a new anchor object per
  point, so the engine re-measures), below and to the end of it, flipping
  when there is no room. A `contextmenu` event with no position (the Menu
  key, Shift+F10) opens at the trigger's bottom-left with the first row
  focused. Touch and pen open after a 700ms press that does not move.
- **Modal by default** (DropdownMenu, ContextMenu): page scroll locked, the
  rest hidden from assistive technology, focus trapped. Menubar menus are
  not modal.
- **Variables.** Menu surfaces inherit the five positioning variables; each
  front also sets `--radix-<front>-content-*`, `--radix-<front>-trigger-*` and
  `--radix-popper-*` as deprecated aliases (`dropdown-menu`, `context-menu`,
  `menubar`).

### Select

- **A select-only combobox over a listbox.** The trigger is the
  `role="combobox"` (`aria-expanded`, `aria-controls`, `aria-autocomplete="none"`,
  `data-placeholder` while nothing is chosen); the list is the `role="listbox"`
  and the rows `role="option"` with `aria-selected`. The chosen (else the
  first) option has focus when the list opens, whatever opened it; the
  arrows move without wrapping, Home/End and PageUp/PageDown jump, typing
  moves to the match, Enter and Space choose, Escape closes. Typing on the
  closed trigger chooses the match straight away, as a native select does.
- **Modal while open:** the page is locked and inert, focus is trapped, Tab
  does nothing. Focus returns to the trigger after the browser's own focus
  change.
- **Press, drag, release.** The trigger opens on the press (its default is
  prevented and it is focused by hand). A release on a row more than 10px
  from the press point chooses it; a release where the press was leaves the
  list open.
- **The trigger shows the chosen option's text while closed.** The rows render
  off-document in a `DocumentFragment` while the list is closed, so each
  `ItemText` can register its node and text by value in a small store the
  trigger subscribes to (`useSyncExternalStore`, so a row re-rendering never
  re-renders the root). The same registry fills the hidden native select.
- **The native `<select>`** renders when the select has a `name`, `form`,
  `required` or `autoComplete`, or sits inside a `<form>`; it carries the
  value for FormData and validation, mirrors the options so the browser can
  autofill, and a `change` from the browser becomes the select's value. The
  empty option is the placeholder, so `value=""` is the documented reset.
- **Item-aligned placement** renders its own fixed wrapper. After the rows
  have rendered, the chosen row's centre is put on the trigger's centre, the
  list stays `collisionPadding` (10px) inside the window, and when it cannot
  both fit and align, the viewport is scrolled so the row still aligns and
  the list's height is cut to what fits; the scroll buttons then appear. The
  buttons change the insets, so placement re-runs up to three times while
  they settle, then leaves the list alone. The wrapper publishes the same
  five variables as a positioned surface (`--bl-transform-origin` at the
  chosen row) and the `--radix-select-*` aliases. `popper` placement is the
  ordinary engine with `data-side` and `data-align`.
- **Scroll buttons** show when the viewport can scroll that way (its scroll
  position and a `ResizeObserver`), and scroll 8px a frame while the pointer
  rests on them; rows keep no highlight meanwhile.

### Command

- **A combobox whose listbox is always open.** The input is the
  `role="combobox"` (`aria-expanded="true"`, `aria-controls` the list,
  `aria-activedescendant` the highlighted row), the list the `role="listbox"`,
  rows `role="option"` with `aria-selected`; each group is a `role="group"`
  labelled by its heading. The `cmdk-*` attributes are kept for the kit's
  class lists and consumer stylesheets. The highlight is a value, not focus:
  focus stays in the input.
- **The matcher** (`command-score`) scores a row's value (and keywords, the
  best wins) against the search, case and diacritics ignored: identical 1;
  prefix 0.9; a word start (after a space, `-`, `_`, `/`, `.`, `:` or a
  lower-to-upper case change) 0.8; a substring 0.7, earlier better; a fuzzy
  match (every character in order) 0.1 to 0.5 by runs, gaps and word starts;
  nothing 0. Prefix, word-start and substring scores lose up to 0.08 for
  extra length, so the shorter of two equal matches ranks first. A search of
  several words that does not match as one string scores as the product of
  its words times 0.9. `filter` replaces the matcher; `shouldFilter={false}`
  skips it.
- **Ranking is shown.** While a search is active, rows are moved in the DOM
  into score order inside their group, and groups (and loose rows) by their
  best row, so what is read matches what is seen. When the search clears, the
  natural order is put back from the indices React's own order gave each row
  (`reindexFromDom`, taken while nothing is sorted). A row that mounts during
  a search sits at the end of the natural order until the next unsorted pass.
  Rows that do not match stay mounted but render nothing (`hidden`), so they
  keep their registration and are not read, focused or counted; their
  inferred value is kept from when they were shown.
- **The highlight** is the best row after every search change, and otherwise
  moves only when its row disappears. Down and Up move (wrapping with
  `loop`), Home and End jump, Alt+Down/Up go to the first row of the next or
  previous group, Meta+Down/Up to the last or first row, Ctrl+N/J and
  Ctrl+P/K move with `vimBindings`. Enter clicks the highlighted row; an IME
  composition owns Enter and the arrows until it ends. The pointer moving
  over a row highlights it unless `disablePointerSelection`.
- **A store, not state.** Rows register from layout effects; registrations
  are flushed once per commit by the root's own layout effect (before paint,
  so `CommandEmpty` never flashes) or by a microtask when the root did not
  render. Components subscribe to the store with `useSyncExternalStore`;
  `useCommandState(selector)` is the public window into it. Values are
  trimmed and compared case-insensitively, as cmdk did; `onSelect` receives
  the normalised value.
- **The list's height** is published as `--bl-command-list-height` (and
  `--cmdk-list-height`) from a `ResizeObserver` on the inner sizer.

### Navigation menu

- **Disclosure navigation.** A `<nav>` (`aria-label="Main"` unless given) of
  links and buttons; each button has `aria-expanded` and `aria-controls`;
  each panel is labelled by its button. One panel is open at a time; the
  value is the open item's.
- **Hover intent.** The pointer resting on a button opens its panel after
  `delayDuration` (200ms); while a panel is open, or within
  `skipDelayDuration` (300ms) of one closing, another button opens at once.
  Leaving both the button and the panel closes after 150ms; entering either
  cancels. Touch never opens on hover; a tap toggles. After Escape closed a
  panel, the pointer must leave its button before hover reopens it.
- **Keyboard.** Left and Right (Up and Down in a vertical bar) move along the
  bar's own buttons and links, Home and End jump; Enter and Space toggle;
  Down (Right in a vertical bar, Left in RTL) opens a panel or moves into an
  open one; inside a panel Down/Up move between its tabbables; Escape closes
  and focuses the button. Tab from an open panel's button goes into the panel
  through a hidden proxy after the button (the panel renders in the viewport,
  elsewhere in the DOM); Shift+Tab from the first link returns to the button;
  Tab from the last link leaves to the next control after the button and
  closes the panel. Focus on any of the bar's controls keeps the panel open;
  a press elsewhere closes it.
- **Viewport and motion.** With a viewport, every panel renders into it and
  the open panel is kept measured (`ResizeObserver`) into
  `--bl-navigation-menu-viewport-width` / `-height` (the
  `--radix-navigation-menu-viewport-*` names are aliases). `data-motion` says
  which way a panel moves from the DOM order of the items and the value
  before: `from-end` / `to-start` when the open item follows the previous
  one, `from-start` / `to-end` when it precedes it, reversed in RTL. The
  previous value is derived during render, not kept in a ref. Panels stay
  mounted through their exit (presence) so the viewport can cross-fade.
- **Links.** `active` sets `aria-current="page"` and `data-active="true"`.
  Following a link dispatches the cancelable `bl-navigation-menu-link-select`
  event and closes the panel, unless the click opens the link elsewhere
  (a modifier key) or the handler prevented it.
- **Indicator.** Rendered into the list's wrapper, positioned to the open
  button's offset and size along the bar, with `data-state` visible/hidden.

## History

Burtson UI 0.14 vendored Radix Primitives and cmdk as local source. 0.18
replaced the overlay family with the modules above; 0.19 replaced everything
else (menus, Select, Command, NavigationMenu, Tabs, Accordion, the form
controls, Toast, ScrollArea, Avatar, Progress, Separator, Label) and deleted
the vendored tree, along with the `@floating-ui/react-dom`, `aria-hidden` and
`react-remove-scroll` dependencies. Since then the kit has no port of another
library in it; the `--radix-*` CSS variable names survive only as deprecated
aliases of the `--bl-*` names.

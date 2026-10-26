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

| Module                   | What it is                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `slot`                   | `Slot`, `Slottable`, `mergeProps`: the `asChild` pattern.                                                         |
| `compose-refs`           | `composeRefs`, `useComposedRefs`, `setRef`: one node, several refs, React 18 and 19.                              |
| `compose-handlers`       | `composeHandlers(theirs, ours)`: the caller's handler first; ours unless it prevented the event.                  |
| `element-ref`            | `getElementRef`: an element's ref on either React major.                                                          |
| `use-controllable-state` | The `value` / `defaultValue` / `onChange` triple.                                                                 |
| `use-id`                 | `useStableId`: SSR-safe ids without React's delimiters.                                                           |
| `use-layout-effect`      | `useIsoLayoutEffect`: layout effect in the browser, plain effect on the server.                                   |
| `use-callback-ref`       | `useCallbackRef`: a stable function that calls the latest callback.                                               |
| `tabbable`               | `getTabbables`, `isTabbable`, `isFocusable`: the Tab sequence from the HTML focusability rules.                   |
| `presence`               | `usePresence`, `Presence`: stay mounted through an exit animation.                                                |
| `portal`                 | `Portal`: `createPortal` into the body or a `container`, nothing on the server.                                   |
| `layer`                  | `Layer`, `LayerBranch`: the dismissable layer stack (Escape, press outside, focus outside, modal pointer events). |
| `focus-trap`             | `FocusScope`: focus in on mount, wrap, trap, restore on unmount.                                                  |
| `anchor-geometry`        | `computePlacement` and rect helpers: the positioning arithmetic, no DOM.                                          |
| `anchor`                 | `AnchorProvider`, `Anchor`, `Positioned`, `Arrow`, `useAnchoredPlacement`: the positioning engine's DOM side.     |
| `scroll-lock`            | `lockScroll`, `useScrollLock`: counted page scroll lock with gutter compensation and touch handling.              |
| `hide-others`            | `hideOthers`, `useHideOthers`: `aria-hidden` and `inert` on everything but the live surface.                      |
| `collection`             | `createCollection`: an ordered registry of a composite's items.                                                   |
| `roving-focus`           | `RovingFocusGroup`, `RovingFocusItem`, `movementFor`, `nextIndex`: roving tabindex.                               |
| `typeahead`              | `findTypeaheadMatch`, `useTypeahead`: type-to-find for menus and lists.                                           |
| `popover`                | Popover: Root, Trigger, Anchor, Portal, Content, Close, Arrow.                                                    |
| `tooltip`                | Tooltip: Provider, Root, Trigger, Portal, Content, Arrow.                                                         |
| `dialog`                 | Dialog: Root, Trigger, Portal, Overlay, Content, Title, Description, Close.                                       |
| `alert-dialog`           | AlertDialog on Dialog: Action and Cancel, `role="alertdialog"`, no outside dismissal, focus on Cancel.            |
| `collapsible`            | Collapsible: Root, Trigger, Content, with measured height and width for animations.                               |
| `tabs`                   | Tabs: Root, List, Trigger, Content; automatic or manual activation.                                               |
| `accordion`              | Accordion on Collapsible: Root (single or multiple), Item, Header, Trigger, Content.                              |
| `form-proxy`             | `FormProxy`, `useInForm`: a native input that lets a button-based control submit, validate and reset.             |
| `checkbox`               | Checkbox: Root, Indicator; checked, unchecked or indeterminate.                                                   |
| `radio-group`            | RadioGroup: Root, Item, Indicator; arrows move and choose.                                                        |
| `switch`                 | Switch: Root, Thumb.                                                                                              |
| `toast`                  | Toast: Provider, Viewport, Root, Title, Description, Action, Close; timing, swipe, announcements.                 |
| `scroll-area`            | ScrollArea: Root, Viewport, Scrollbar, Thumb, Corner; drawn scrollbars over a native scroller.                    |
| `avatar`                 | Avatar: Root, Image, Fallback, `useImageLoadingStatus`.                                                           |
| `progress`               | Progress: Root, Indicator.                                                                                        |
| `separator`              | Separator: decorative (`role="none"`) or semantic.                                                                |
| `label`                  | Label: a native label that does not select its text on a double press.                                            |

Each headless module exports its parts under both long names (`PopoverContent`)
and short ones (`Content`), so a component can `import * as PopoverPrimitive`
and read as it always has.

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

## For phase 2

The vendored modules that remain under `vendor/` (menus, select, navigation
menu and cmdk, with the support modules they import) map onto this layer as
follows:

| Vendored                                                    | Build on                                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| react-dismissable-layer                                     | `layer`                                                                                              |
| react-focus-scope / guards                                  | `focus-trap` (no guards needed)                                                                      |
| react-popper / react-arrow                                  | `anchor` (+ `anchor-geometry`)                                                                       |
| react-presence                                              | `presence`                                                                                           |
| react-portal                                                | `portal`                                                                                             |
| react-slot / react-primitive                                | `slot` (`asChild ? Slot : 'tag'`)                                                                    |
| react-collection                                            | `collection`                                                                                         |
| react-roving-focus                                          | `roving-focus`                                                                                       |
| react-use-controllable-state                                | `use-controllable-state`                                                                             |
| react-id, use-callback-ref, use-layout-effect, compose-refs | `use-id`, `use-callback-ref`, `use-layout-effect`, `compose-refs`                                    |
| react-direction                                             | read `getComputedStyle(node).direction` at the point of use, or a `dir` prop                         |
| react-use-size                                              | a `ResizeObserver` in the component                                                                  |
| react-visually-hidden                                       | the kit's `sr-only` class                                                                            |
| react-dialog (cmdk)                                         | `dialog`                                                                                             |
| aria-hidden, react-remove-scroll, @floating-ui/react-dom    | `hide-others`, `scroll-lock`, `anchor`; drop the dependencies when their last vendored importer goes |

Known while both stacks coexist: a vendored (Radix) modal menu opened inside
a Burtson dialog keeps its own layer stack. Escape, focus return and presses
inside the dialog work; a press on the dialog's body while the menu is open
does not always dismiss the menu (the baseline, all Radix, behaves the same).
It resolves itself when the menus move onto `layer`.

Keep the rules: no reading from `vendor/`, public component API unchanged,
`data-*` attributes and the `--radix-*` aliases kept, tests in `test/` with
plain assertions, a registry item per module (automatic: any `src/primitives/*.ts(x)`
file becomes `primitive-<name>`), and a note here for every decision.

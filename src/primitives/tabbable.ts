/**
 * Which elements the Tab key visits, worked out from the HTML focusability
 * rules rather than a fixed selector: disabled controls (including those in a
 * disabled fieldset), `tabindex="-1"`, `inert` subtrees, `display: none` or
 * `visibility: hidden` ancestors, the content of a closed `<details>`, and
 * all but one radio of a named group are left out. Positive tabindex values
 * come first in ascending order, then document order, as the browser does.
 */

const CANDIDATES =
  'a[href], area[href], button, input, select, textarea, iframe, object, embed, audio[controls], video[controls], summary, [tabindex], [contenteditable]';

/** Elements the kit itself inserts for focus management are never targets. */
const GUARD = 'data-bl-focus-guard';

function tabIndexOf(element: HTMLElement): number {
  const raw = element.getAttribute('tabindex');
  if (raw !== null) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  // Every other candidate is natively focusable, so it sits in the sequence
  // at 0 (the property is not reliable for summary or contenteditable in
  // every engine).
  return 0;
}

function isHiddenByStyle(element: HTMLElement, cache: Map<Element, boolean>): boolean {
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  if (view.getComputedStyle(element).visibility === 'hidden') return true;
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const known = cache.get(node);
    if (known !== undefined) {
      if (known) return true;
      continue;
    }
    const hidden = view.getComputedStyle(node).display === 'none';
    cache.set(node, hidden);
    if (hidden) return true;
  }
  return false;
}

function radioGroupAllows(radio: HTMLInputElement): boolean {
  if (!radio.name) return true;
  const scope: ParentNode = radio.form ?? radio.ownerDocument;
  const group = Array.from(scope.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(
    (other) => other.name === radio.name && other.form === radio.form,
  );
  const checked = group.find((other) => other.checked);
  if (checked) return checked === radio;
  return group[0] === radio;
}

/** True when the element can receive focus at all (Tab or `focus()`). */
export function isFocusable(element: Element, cache = new Map<Element, boolean>()): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hasAttribute(GUARD)) return false;
  if (!element.matches(CANDIDATES)) return false;
  if (element.matches(':disabled')) return false;
  if (element.getAttribute('contenteditable') === 'false' && !element.hasAttribute('tabindex'))
    return false;
  if (element.closest('[inert]')) return false;
  if (isHiddenByStyle(element, cache)) return false;
  // Only the summary of a closed <details> is rendered.
  const closedDetails = element.closest('details:not([open])');
  if (closedDetails && !(element.tagName === 'SUMMARY' && element.parentElement === closedDetails))
    return false;
  return true;
}

/** True when the Tab key can land on the element. */
export function isTabbable(element: Element, cache = new Map<Element, boolean>()): boolean {
  if (!isFocusable(element, cache)) return false;
  const html = element as HTMLElement;
  if (tabIndexOf(html) < 0) return false;
  if (html instanceof HTMLInputElement && html.type === 'radio') return radioGroupAllows(html);
  return true;
}

/** Every tabbable element inside `root`, in the order the Tab key visits them. */
export function getTabbables(root: ParentNode): HTMLElement[] {
  const cache = new Map<Element, boolean>();
  const ordered: { element: HTMLElement; tabIndex: number; order: number }[] = [];
  let order = 0;
  for (const element of root.querySelectorAll<HTMLElement>(CANDIDATES)) {
    if (!isTabbable(element, cache)) continue;
    ordered.push({ element, tabIndex: tabIndexOf(element), order: order++ });
  }
  return ordered
    .sort((a, b) => {
      const ta = a.tabIndex > 0 ? a.tabIndex : Number.POSITIVE_INFINITY;
      const tb = b.tabIndex > 0 ? b.tabIndex : Number.POSITIVE_INFINITY;
      return ta === tb ? a.order - b.order : ta - tb;
    })
    .map((entry) => entry.element);
}

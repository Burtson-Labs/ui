import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins class names and lets later Tailwind utilities override earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Keyboard focus for buttons, toggles, tabs, links and every other control
 * that is not a text field: a 2px outline in the ring colour, 2px outside the
 * box, so it follows the control's radius and reads at 3:1 on any surface.
 * (Fields use `fieldFocusClasses`: the border and a 1px inset ring. Menu and
 * list rows use a fill.) The same outline theme.css draws for any `[data-slot]`
 * by default; spelling it out here keeps it when a host page sets
 * `outline: none` on buttons. (`outline-solid` matters: Tailwind's
 * `outline-none` sets the shared outline-style variable to none, and
 * `outline-2` alone would read it back.)
 */
export const focusRingClasses =
  'outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * Suppresses the outline outright (a control that draws focus another way, or
 * whose box is not the focus target), with `!important` so a host page's
 * unlayered `:focus-visible { outline }` cannot draw a second box. In forced-
 * colors mode (Windows High Contrast) no ring or border colour survives, so
 * keyboard focus gets a system-colour outline there and nothing at rest.
 */
export const noOutlineClasses =
  'outline-none! forced-colors:focus-visible:[outline:2px_solid_Highlight]! forced-colors:focus-visible:outline-offset-2';

/**
 * A 44px hit area on touch screens for a small control (a 16px checkbox, a
 * 20px switch), drawn as an invisible square centred on it. The layout does
 * not change; the control just becomes easier to tap. The control needs
 * `relative` (included).
 */
export const touchTargetClasses =
  "relative pointer-coarse:before:absolute pointer-coarse:before:top-1/2 pointer-coarse:before:left-1/2 pointer-coarse:before:size-11 pointer-coarse:before:-translate-1/2 pointer-coarse:before:content-['']";

/**
 * The same for a control that already spans its row (a tab, a menubar
 * trigger): the hit area keeps the control's width and grows to 44px tall.
 */
export const touchTargetRowClasses =
  "relative pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:top-1/2 pointer-coarse:before:h-11 pointer-coarse:before:-translate-y-1/2 pointer-coarse:before:content-['']";

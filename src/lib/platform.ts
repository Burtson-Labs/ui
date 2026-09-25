/**
 * Keyboard-shortcut labels that match the user's platform: ⌘ on Apple
 * devices, Ctrl elsewhere. Handlers should accept both (metaKey || ctrlKey);
 * this only decides what to show.
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? nav.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform) || /Mac OS X|iPhone|iPad/.test(nav.userAgent);
}

/** "⌘" or "Ctrl". */
export function modKeyLabel(): string {
  return isApplePlatform() ? '⌘' : 'Ctrl';
}

/** A shortcut such as "⌘K" / "Ctrl K" for a key pressed with the platform modifier. */
export function shortcutLabel(key: string): string {
  return isApplePlatform() ? `⌘${key.toUpperCase()}` : `Ctrl ${key.toUpperCase()}`;
}

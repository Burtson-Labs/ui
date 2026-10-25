// The pre-paint half of ThemeProvider. Directive-free so a server component
// (a Next.js root layout, an Astro or Remix document) can build the script.

/** The key ThemeProvider and the theme init script read and write by default. */
export const DEFAULT_THEME_STORAGE_KEY = 'bl-theme';

/**
 * Storage keys, query parameter names and data attribute names that may be
 * written into script text: letters, digits, `.`, `_`, `:` and `-`, 1 to 64
 * characters, starting with a letter or digit. Anything else is refused.
 */
export const THEME_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export interface ThemeInitScriptOptions {
  /** The storage key; match ThemeProvider's `storageKey`. Default `bl-theme`. */
  storageKey?: string;
  /** Older keys read when `storageKey` holds nothing; match ThemeProvider's `legacyStorageKeys`. */
  legacyStorageKeys?: readonly string[];
  /** Used when nothing valid is saved. Default `system`; match ThemeProvider's `defaultTheme`. */
  defaultTheme?: 'light' | 'dark' | 'system';
  /** A URL query parameter (such as `theme`) that overrides the saved preference. Off by default. */
  queryParam?: string | null;
}

const checkKey = (value: string, what: string) => {
  if (typeof value !== 'string' || !THEME_KEY_PATTERN.test(value))
    throw new TypeError(
      `themeInitScript: ${what} must match ${String(THEME_KEY_PATTERN)}; got ${JSON.stringify(value)}`,
    );
  return value;
};

/**
 * The script body, as one IIFE with no line breaks. `fromScriptData` makes it
 * read data-storage-key, data-legacy-storage-keys, data-default-theme and
 * data-query-param from its own <script> element (the static file uses this).
 */
function buildScript(
  { storageKey, legacyStorageKeys, defaultTheme, queryParam }: Required<ThemeInitScriptOptions>,
  fromScriptData: boolean,
): string {
  // Every value is validated before it gets here and is still written with
  // JSON.stringify, so it is a string literal, never code.
  const config = JSON.stringify({
    k: storageKey,
    l: legacyStorageKeys,
    d: defaultTheme,
    q: queryParam,
  });
  const read = fromScriptData
    ? 'var s=document.currentScript,a=(s&&s.dataset)||{},p=' +
      String(THEME_KEY_PATTERN) +
      ';if(p.test(a.storageKey||""))c.k=a.storageKey;' +
      'if(a.legacyStorageKeys!=null)c.l=a.legacyStorageKeys.split(/[\\s,]+/).filter(function(x){return p.test(x)});' +
      'if(v(a.defaultTheme))c.d=a.defaultTheme;' +
      'if(p.test(a.queryParam||""))c.q=a.queryParam;'
    : '';
  return (
    '(function(){' +
    'var c=' +
    config +
    ',d=document.documentElement,t=null;' +
    'function v(x){return x==="light"||x==="dark"||x==="system"}' +
    read +
    'try{if(c.q){var u=new URLSearchParams(location.search).get(c.q);if(v(u))t=u}}catch(e){}' +
    'if(!t){try{var keys=[c.k].concat(c.l);for(var i=0;i<keys.length&&!t;i++){var x=localStorage.getItem(keys[i]);if(v(x))t=x}}catch(e){}}' +
    'if(!t)t=c.d;' +
    'var r=t;if(t==="system"){try{r=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){r="light"}}' +
    'd.classList.toggle("dark",r==="dark");d.dataset.theme=r;d.style.colorScheme=r' +
    '})();'
  );
}

const resolve = (options: ThemeInitScriptOptions = {}): Required<ThemeInitScriptOptions> => {
  const defaultTheme = options.defaultTheme ?? 'system';
  if (defaultTheme !== 'light' && defaultTheme !== 'dark' && defaultTheme !== 'system')
    throw new TypeError(`themeInitScript: defaultTheme must be light, dark or system`);
  return {
    storageKey: checkKey(options.storageKey ?? DEFAULT_THEME_STORAGE_KEY, 'storageKey'),
    legacyStorageKeys: (options.legacyStorageKeys ?? []).map((k) =>
      checkKey(k, 'legacyStorageKeys'),
    ),
    defaultTheme,
    queryParam: options.queryParam == null ? null : checkKey(options.queryParam, 'queryParam'),
  };
};

/**
 * JavaScript that applies the saved theme before first paint, the same way
 * ThemeProvider does (the `dark` class, `data-theme` and `color-scheme` on
 * <html>), so dark-mode users never see a light flash. Put it in a
 * render-blocking <script> in <head>. Under a strict CSP, either serve it as
 * a file (`@burtson-labs/ui/theme-init.js`) or allow the inline copy by hash
 * with themeInitScriptHash(). Storage errors fall back to `defaultTheme`.
 * Throws a TypeError for a key that is not plain text (see THEME_KEY_PATTERN).
 */
export function themeInitScript(options?: ThemeInitScriptOptions): string {
  return buildScript(resolve(options), false);
}

/**
 * The static `@burtson-labs/ui/theme-init.js` file: themeInitScript() with
 * defaults that the <script> element's data attributes can override.
 * @internal
 */
export function themeInitFile(): string {
  return buildScript(resolve(), true);
}

/**
 * The CSP source for themeInitScript(options), such as `'sha256-…'`, ready
 * for `script-src`. Uses Web Crypto, so it works in browsers, Node 20+,
 * Deno, Bun and edge runtimes. Compute it once per options at build or boot.
 */
export async function themeInitScriptHash(options?: ThemeInitScriptOptions): Promise<string> {
  const bytes = new TextEncoder().encode(themeInitScript(options));
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes));
  let binary = '';
  for (const byte of digest) binary += String.fromCharCode(byte);
  return `'sha256-${btoa(binary)}'`;
}

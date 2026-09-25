#!/usr/bin/env node
// After `vite build`: writes a static index.html for every docs route with
// that page's own title, description and canonical URL, plus sitemap.xml.
// The site is a single-page app, so without this a shared link to
// /docs/components/button previews as the home page in Slack, Teams and
// iMessage (they read the HTML, they do not run the app). nginx serves
// <route>/index.html via try_files $uri/.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { say } from './log.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'site/dist');
const SITE = 'https://ui.burtson.ai';
const { components } = await import('../site/src/docs.ts');

const esc = (t) =>
  t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const routes = [
  {
    path: '/docs/installation',
    title: 'Installation · Burtson UI',
    description:
      'Install @burtson-labs/ui with Tailwind v4 or the precompiled stylesheet, or copy a component’s source with the shadcn CLI.',
  },
  {
    path: '/docs/theming',
    title: 'Theming · Burtson UI',
    description:
      'Colour, radius, shadow and motion tokens, generated into CSS variables for Tailwind, the registry and MUI.',
  },
  {
    path: '/docs/mui',
    title: 'Using with MUI · Burtson UI',
    description:
      'Share the Burtson palette with MUI apps through createBurtsonTheme, and adopt components one screen at a time.',
  },
  ...components.map((c) => ({
    path: `/docs/components/${c.name}`,
    title: `${c.title} · Burtson UI`,
    description: `${c.description} React component with live examples, props and copyable source.`,
  })),
];

const template = readFileSync(join(DIST, 'index.html'), 'utf8');
/** Replace the content of the one tag matching `attr="key"`, which must exist. */
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key.replace(':', '\\:')}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`index.html has no <meta ${attr}="${key}">`);
  return html.replace(re, `$1${esc(value)}$2`);
};

for (const r of routes) {
  const url = `${SITE}${r.path}`;
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = setMeta(html, 'name', 'description', r.description);
  html = setMeta(html, 'property', 'og:title', r.title);
  html = setMeta(html, 'property', 'og:description', r.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', r.title);
  html = setMeta(html, 'name', 'twitter:description', r.description);
  const dir = join(DIST, r.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const urls = ['/', ...routes.map((r) => r.path)];
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
say(`route pages: ${routes.length} + sitemap.xml`);

import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const src = fileURLToPath(new URL('../src', import.meta.url));

// The docs site imports the library from source, under its published name, so
// the code shown on each page is exactly what an app would write.
import pkg from '../package.json' with { type: 'json' };

export default defineConfig({
  define: { __UI_VERSION__: JSON.stringify(pkg.version) },
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [
    react(),
    tailwindcss(),
    {
      // The preview-image URL carries the version, so Slack, Teams and
      // iMessage fetch a fresh card after a release instead of a cached one.
      name: 'ui-version-in-html',
      transformIndexHtml: (html) => html.replaceAll('__UI_VERSION__', pkg.version),
    },
  ],
  resolve: {
    alias: [
      { find: /^@burtson-labs\/ui$/, replacement: `${src}/index.ts` },
      { find: /^@burtson-labs\/ui\/mui$/, replacement: `${src}/mui/index.ts` },
      { find: /^@\//, replacement: `${src}/` },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        og: fileURLToPath(new URL('og.html', import.meta.url)),
      },
    },
  },
});

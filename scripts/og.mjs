#!/usr/bin/env node
// Renders site/public/og.png (the 1200x630 card Slack, Teams, LinkedIn and X
// show for ui.burtson.ai) and apple-touch-icon.png from a real page of
// components. Committed, because it needs Chrome; rerun `npm run og` after a
// visual change. Needs `npm run site` first; serves site/dist itself.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { fail, say } from './log.mjs';

import { preview } from 'vite';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!CHROME) {
  fail('no Chrome found; set CHROME_BIN');
  process.exit(1);
}

const server = await preview({
  configFile: join(ROOT, 'site/vite.config.ts'),
  preview: { port: 4388, strictPort: true },
});
// Async: the preview server runs in this process and must keep answering.
const shot = (path, size, out) =>
  promisify(execFile)(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${size}`,
      '--virtual-time-budget=4000',
      `--screenshot=${join(ROOT, 'site/public', out)}`,
      `http://localhost:4388${path}`,
    ],
    { timeout: 60_000 },
  );
try {
  await shot('/og.html', '1200,630', 'og.png');
  await shot('/og.html?touch', '180,180', 'apple-touch-icon.png');
  say('wrote site/public/og.png and apple-touch-icon.png');
} finally {
  await server.close();
}

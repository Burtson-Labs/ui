// Requires network access to npm. Tests the tarball outside this repository.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'burtson-packed-'));
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 180000 });
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
const versions = (name) =>
  JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8')).version;
const results = [];
try {
  const [pack] = JSON.parse(
    run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temp], root),
  );
  // npm reports a bare file name; refuse separators so it stays in the temp directory.
  if (!/^[\w.@-]+\.tgz$/.test(pack.filename) || pack.filename.startsWith('.'))
    throw new Error(`Unexpected tarball name: ${pack.filename}`);
  const tarball = `${temp}/${pack.filename}`;
  for (const matrix of [
    { react: '18.3.1', types: '18.3.22', domTypes: '18.3.7' },
    {
      react: versions('react'),
      types: versions('@types/react'),
      domTypes: versions('@types/react-dom'),
    },
  ]) {
    process.stdout.write(`Checking packed consumer: React ${matrix.react}.\n`);
    const consumer = mkdtempSync(join(tmpdir(), 'burtson-consumer-'));
    try {
      writeFileSync(
        join(consumer, 'package.json'),
        JSON.stringify(
          {
            name: 'burtson-port-consumer',
            private: true,
            type: 'module',
            dependencies: {
              '@burtson-labs/ui': `file:${tarball}`,
              '@burtson-labs/icons': versions('@burtson-labs/icons'),
              react: matrix.react,
              'react-dom': matrix.react,
            },
            devDependencies: {
              typescript: versions('typescript'),
              '@types/react': matrix.types,
              '@types/react-dom': matrix.domTypes,
            },
          },
          null,
          2,
        ),
      );
      run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], consumer);
      const lock = JSON.parse(readFileSync(join(consumer, 'package-lock.json'), 'utf8'));
      const forbidden = Object.keys(lock.packages).filter((p) =>
        /node_modules\/(?:@radix-ui\/|radix-ui$|cmdk$)/.test(p),
      );
      if (forbidden.length)
        throw new Error(`Packed consumer installed forbidden dependencies: ${forbidden}`);
      writeFileSync(
        join(consumer, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: false,
            noEmit: true,
            types: ['react', 'react-dom'],
          },
          include: ['index.tsx'],
        }),
      );
      writeFileSync(
        join(consumer, 'index.tsx'),
        `import * as React from 'react';
import { Button, Dialog, DialogTrigger, DialogContent, DialogTitle, Composer, Select, SelectTrigger, SelectContent, SelectItem, Command, CommandInput, CommandList, CommandItem, DataTable, type DataTableColumn } from '@burtson-labs/ui';
const props: React.ComponentProps<typeof Button> = { variant: 'brand', onClick: e => { e.currentTarget.disabled = true; } };
const columns: DataTableColumn<{ id: string; name: string }>[] = [{ id: 'name', header: 'Name', cell: row => row.name }];
export const example = <><Button {...props}>Send</Button><Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogTitle>Details</DialogTitle></DialogContent></Dialog><Composer onSubmit={async (text) => { console.log(text); }} /><Select><SelectTrigger /><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select><Command><CommandInput /><CommandList><CommandItem>Item</CommandItem></CommandList></Command><DataTable aria-label="People" columns={columns} rows={[]} getRowId={row => row.id} /></>;
`,
      );
      run(
        process.execPath,
        [join(consumer, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'],
        consumer,
      );
      writeFileSync(
        join(consumer, 'render.mjs'),
        `import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Composer, Dialog, DialogTrigger, Command, CommandList, CommandItem } from '@burtson-labs/ui';
const elements = [createElement(Button, null, 'Ready'), createElement(Composer, {onSubmit:()=>{}}), createElement(Dialog, null, createElement(DialogTrigger, null, 'Open')), createElement(Command, null, createElement(CommandList, null, createElement(CommandItem, null, 'Item')))];
for (const element of elements) { const html = renderToStaticMarkup(element); if (!html.includes('data-slot=')) throw new Error('Missing component output'); }
console.log('SSR passed');
`,
      );
      run(process.execPath, ['render.mjs'], consumer);
      results.push({
        react: matrix.react,
        reactTypes: matrix.types,
        typescript: versions('typescript'),
        typecheck: 'passed',
        serverRender: 'passed',
        externalRadixPackages: 0,
        externalCmdkPackages: 0,
      });
      process.stdout.write(`Packed consumer passed: React ${matrix.react}.\n`);
    } finally {
      rmSync(consumer, { recursive: true, force: true });
    }
  }
  writeFileSync(
    join(root, 'audit/packed-consumers.json'),
    JSON.stringify({ tarball: pack.filename, integrity: pack.integrity, results }, null, 2) + '\n',
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}

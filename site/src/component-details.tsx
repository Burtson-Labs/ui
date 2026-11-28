import * as React from 'react';

import ownLicense from '../../LICENSE?raw';
import upstreamLicense from '../../LICENSES/shadcn-MIT.txt?raw';

import { ApiReference } from './api-reference';
import { Code } from './code';
import { api, guidance } from './component-guidance';
import { usage } from './usage';

const sources = import.meta.glob<string>('../../src/components/*.tsx', {
  query: '?raw',
  import: 'default',
});

export function ComponentDetails({ name }: { name: string }) {
  const [showSource, setShowSource] = React.useState(false);
  const [source, setSource] = React.useState('// Loading source…');
  React.useEffect(() => {
    if (!showSource) return;
    let active = true;
    const load = sources[`../../src/components/${name}.tsx`];
    if (load)
      void load()
        .then((text) => {
          if (active)
            setSource(
              '/*\n' +
                ownLicense +
                '\nAdapted portions: shadcn/ui\n' +
                upstreamLicense +
                '\n*/\n' +
                text,
            );
        })
        .catch(() => {
          if (active) setSource('// Source could not load. Refresh to retry.');
        });
    return () => {
      active = false;
    };
  }, [name, showSource]);
  const u = usage[name];
  const notes = guidance[name] ?? [];
  const list = (items: string[]) => (
    <ul className="grid list-disc gap-1.5 pl-5 text-sm leading-6 text-muted-foreground">
      {items.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
  return (
    <>
      {u && (
        <section className="mt-10 grid gap-6 sm:grid-cols-2" aria-labelledby="when-heading">
          <div>
            <h2 id="when-heading" className="mb-2 text-base font-semibold tracking-tight">
              When to use
            </h2>
            {list(u.use)}
          </div>
          <div>
            <h2 className="mb-2 text-base font-semibold tracking-tight">Don&apos;t</h2>
            {list(u.avoid)}
          </div>
        </section>
      )}
      <section className="mt-10" aria-labelledby="usage-heading">
        <h2 id="usage-heading" className="mb-3 text-xl font-semibold tracking-tight">
          Accessibility and behaviour
        </h2>
        {list([...(u?.a11y ?? []), ...notes])}
      </section>
      <ApiReference name={name} />
      {api[name] && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Key props</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{name} properties</caption>
              <thead className="bg-muted">
                <tr>
                  {['Prop', 'Type / behavior', 'Default'].map((heading) => (
                    <th key={heading} scope="col" className="p-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {api[name].map(([prop, type, value]) => (
                  <tr key={prop} className="border-t">
                    <th scope="row" className="p-3 font-mono text-xs font-normal">
                      {prop}
                    </th>
                    <td className="p-3 text-muted-foreground">{type}</td>
                    <td className="p-3 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Inherited native and primitive props are included in the TypeScript source below.
          </p>
        </section>
      )}
      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Own the implementation</h2>
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Inspect the exact component used by this preview, including types, variants, and
          dependencies.
        </p>
        <button
          type="button"
          className="mb-3 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          aria-expanded={showSource}
          aria-controls="component-source"
          onClick={() => setShowSource((value) => !value)}
        >
          {showSource ? 'Hide source' : 'View component source'}
        </button>
        <div id="component-source" hidden={!showSource}>
          {showSource && <Code code={source} />}
        </div>
      </section>
    </>
  );
}

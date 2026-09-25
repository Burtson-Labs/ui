import * as React from 'react';

interface Prop {
  name: string;
  type: string;
  required: boolean;
  default: string | null;
  description: string;
  native: boolean;
}
interface ApiExport {
  name: string;
  kind: 'component' | 'type' | 'function' | 'value';
  description: string;
  signatures: string[];
  type: string | null;
  props: Prop[];
  inherited: string[];
}
interface ApiPage {
  component: string;
  source: string;
  exports: ApiExport[];
}

const pages = import.meta.glob<ApiPage>('./generated/api/*.json', { import: 'default' });

function PropTable({ props, label }: { props: Prop[]; label: string }) {
  if (!props.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{label} properties</caption>
        <thead className="bg-muted">
          <tr>
            {['Property', 'Type', 'Default', 'Description'].map((heading) => (
              <th key={heading} scope="col" className="p-3 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-t align-top">
              <th scope="row" className="p-3 text-left font-normal">
                <code>{prop.name}</code>
                {prop.required && (
                  <span className="mt-1 block text-xs font-medium text-brand">Required</span>
                )}
              </th>
              <td className="min-w-44 max-w-lg p-3">
                <code className="break-words whitespace-pre-wrap text-xs">{prop.type}</code>
              </td>
              <td className="max-w-56 p-3">
                <code className="break-words whitespace-pre-wrap text-xs">
                  {prop.default ?? '—'}
                </code>
              </td>
              <td className="min-w-48 p-3 whitespace-pre-line text-muted-foreground">
                {prop.description || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NativeProps({ ids, label }: { ids: string[]; label: string }) {
  const [props, setProps] = React.useState<Prop[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const load = () => {
    setFailed(false);
    void import('./generated/api-native.json')
      .then((module) => {
        const values = module.default as Record<string, Prop>;
        setProps(ids.map((id) => values[id]).filter((p): p is Prop => Boolean(p)));
      })
      .catch(() => setFailed(true));
  };
  return (
    <details
      className="rounded-md border p-3"
      onToggle={(e) => {
        if (e.currentTarget.open && !props) load();
      }}
    >
      <summary className="cursor-pointer text-sm font-medium">
        Inherited HTML and React props ({ids.length})
      </summary>
      <div className="mt-3">
        {props ? (
          <PropTable props={props} label={label} />
        ) : failed ? (
          <button type="button" onClick={load}>
            Retry loading inherited props
          </button>
        ) : (
          <p role="status">Loading inherited props…</p>
        )}
      </div>
    </details>
  );
}

function ExportDetails({ item }: { item: ApiExport }) {
  return (
    <div className="grid min-w-0 gap-3">
      {item.description && (
        <p className="text-sm whitespace-pre-line text-muted-foreground">{item.description}</p>
      )}
      {item.signatures.map((signature, i) => (
        <pre key={i} className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          <code>
            {item.name}
            {signature}
          </code>
        </pre>
      ))}
      {item.kind !== 'component' && !item.signatures.length && (
        <code className="break-words text-xs">{item.type}</code>
      )}
      <PropTable props={item.props} label={item.name} />
      {item.inherited.length > 0 && (
        <NativeProps ids={item.inherited} label={`${item.name} inherited`} />
      )}
    </div>
  );
}

function ApiReferenceContent({ name }: { name: string }) {
  const [page, setPage] = React.useState<ApiPage | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  React.useEffect(() => {
    let active = true;
    const load = pages[`./generated/api/${name}.json`];
    const request = load ? load() : Promise.reject(new Error('Missing API reference'));
    void request
      .then((value) => {
        if (active) setPage(value);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [name, attempt]);
  return (
    <section id="api-reference" className="mt-10 scroll-mt-20" aria-labelledby="api-heading">
      <h2 id="api-heading" className="mb-3 text-xl font-semibold tracking-tight">
        API reference
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Public exports and inherited props from this version’s TypeScript source. Defaults are shown
        where declared in the component or its type documentation; “—” means no declared default.
      </p>
      {failed ? (
        <p role="alert">
          The reference could not load.{' '}
          <button
            type="button"
            className="text-brand underline"
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </button>
        </p>
      ) : !page ? (
        <p role="status">Loading API reference…</p>
      ) : (
        <div className="grid gap-5">
          {page.exports.map((item) => (
            <details
              key={item.name}
              id={`api-${item.name}`}
              open={item.kind === 'component'}
              className="min-w-0 scroll-mt-20 rounded-lg border p-4"
            >
              <summary className="cursor-pointer font-mono text-sm font-semibold">
                {item.name}{' '}
                <span className="font-sans font-normal text-muted-foreground">· {item.kind}</span>
              </summary>
              <div className="mt-4">
                <ExportDetails item={item} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

export function ApiReference({ name }: { name: string }) {
  return <ApiReferenceContent key={name} name={name} />;
}

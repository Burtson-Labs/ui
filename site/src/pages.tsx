import ArrowRight from '@burtson-labs/icons/react/arrow-right';
import ExternalLink from '@burtson-labs/icons/react/external-link';
import * as React from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  dark,
  light,
  type Palette,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@burtson-labs/ui';

import { AccentSwatches } from './accent';
import { Code } from './code';
import { ComponentDetails } from './component-details';
import { components, type ComponentDoc } from './docs';
import { Playground } from './playground';
import { Link } from './router';

const version = __UI_VERSION__;

const demoModules = import.meta.glob<{ default: React.ComponentType }>('./demos/*.tsx');
const demoSources = import.meta.glob<string>('./demos/*.tsx', {
  query: '?raw',
  import: 'default',
});
// Elements are created once at module load, so a page never remounts a demo.
const demos: Record<string, React.ReactElement> = Object.fromEntries(
  Object.entries(demoModules).map(([path, mod]) => [
    path.slice('./demos/'.length, -'.tsx'.length),
    React.createElement(React.lazy(mod)),
  ]),
);
const source = (name: string) => demoSources[`./demos/${name}.tsx`]?.() ?? Promise.resolve('');

function H1({ children, lead }: { children: React.ReactNode; lead?: React.ReactNode }) {
  return (
    <header className="mb-8 grid gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">{children}</h1>
      {lead && <p className="text-lg text-muted-foreground">{lead}</p>}
    </header>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 mb-3 text-xl font-semibold tracking-tight">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 leading-7 text-muted-foreground [&_code]:font-mono [&_code]:text-foreground">
      {children}
    </p>
  );
}

class PreviewBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div role="alert" className="grid gap-3 text-center text-sm">
          <p>This preview could not load.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload preview
          </Button>
        </div>
      );
    return this.props.children;
  }
}

function Preview({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={`flex min-h-56 min-w-0 items-center justify-center overflow-x-auto rounded-lg border bg-background p-6 sm:p-8 ${className ?? ''}`}
    >
      <PreviewBoundary>
        <React.Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading preview…
            </p>
          }
        >
          {demos[name] ?? null}
        </React.Suspense>
      </PreviewBoundary>
    </div>
  );
}

export function Home() {
  const [query, setQuery] = React.useState('');
  const filtered = components.filter((component) =>
    query
      .toLowerCase()
      .split(/\s+/)
      .every((term) => `${component.title} ${component.description}`.toLowerCase().includes(term)),
  );
  // Wide demos span two columns so they render at a realistic width.
  const showcase: [string, string][] = [
    ['stat-card', 'md:col-span-2'],
    ['status', ''],
    ['toolbar', 'md:col-span-2'],
    ['card', ''],
    ['field', ''],
    ['table', 'md:col-span-2'],
  ];
  return (
    <div>
      <section className="grid grid-cols-[minmax(0,1fr)] gap-10 border-b py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            @burtson-labs/ui · v{version} · {components.length} components · MIT
          </p>
          <h1 className="home-title">Burtson UI</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            The React components behind Bandit Stealth, Sentinel, our cluster tools and client apps.
            Radix handles focus and keyboard behaviour, Tailwind v4 handles styling, and the icons
            are Burtson Icons. Install the package, or copy a component&apos;s source and change it.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/docs/installation">
                Installation <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#components">Explore components</a>
            </Button>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
          <Code lang="sh" code="npm install @burtson-labs/ui @burtson-labs/icons" />
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Try an accent</span>
            <AccentSwatches />
          </div>
        </div>
      </section>

      <Playground />
      <section
        aria-labelledby="recipe-chat"
        className="grid gap-6 border-t py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center"
      >
        <div>
          <p className="overline">Recipe</p>
          <h2 id="recipe-chat" className="text-2xl font-semibold tracking-tight">
            Build a chat app
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Conversation history, file attachments by button, drop or paste, streaming replies,
            voice notes with playback, and full screen. Nine components, a running demo, and the
            complete source to copy.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/docs/recipes/chat">
              Open the recipe <ArrowRight />
            </Link>
          </Button>
        </div>
        <Code
          code={`<ChatLayout sidebar={<ChatHistory items={chats} onSelect={open} />}>
  <Conversation>{messages}</Conversation>
  <Composer
    onSubmit={send}
    onAttach={upload}
    actions={<VoiceRecorder onRecorded={sendVoice} />}
  />
</ChatLayout>`}
        />
      </section>
      <section id="components" className="component-catalog py-10">
        <div className="section-intro">
          <div>
            <p className="overline">Your building blocks</p>
            <h2>Find the right component.</h2>
          </div>
          <label className="catalog-search">
            <span className="sr-only">Filter components</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search components…"
            />
          </label>
        </div>
        <p role="status" className="mb-4 text-sm text-muted-foreground">
          {filtered.length} components
        </p>
        <ul className="component-grid">
          {filtered.map((c) => (
            <li key={c.name}>
              <Link href={`/docs/components/${c.name}`} className="component-link">
                <span>
                  {c.title}
                  <ArrowRight aria-hidden className="size-4" />
                </span>
                <p>{c.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <div className="catalog-empty">
            <h3>No matching components</h3>
            <p>Try a shorter term or clear your search.</p>
            <Button variant="outline" onClick={() => setQuery('')}>
              Clear search
            </Button>
          </div>
        )}
      </section>

      <div className="section-intro">
        <div>
          <p className="overline">Built together</p>
          <h2>Patterns for real products.</h2>
        </div>
      </div>
      <section className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-3">
        {showcase.map(([name, span]) => (
          <Preview key={name} name={name} className={`min-h-72 bg-surface-muted ${span}`} />
        ))}
      </section>
    </div>
  );
}

export function Installation() {
  return (
    <article>
      <H1 lead="Two ways in: install the package, or own the source.">Installation</H1>
      <H2>1. Install the package</H2>
      <P>
        Best for Burtson Labs apps that should stay in step with the system. Components update when
        you bump the version.
      </P>
      <Code lang="sh" code="npm install @burtson-labs/ui @burtson-labs/icons" />
      <P>
        <br />
        With Tailwind CSS v4, add the theme and let Tailwind see the component classes:
      </P>
      <Code
        lang="css"
        code={`@import 'tailwindcss';
@import '@burtson-labs/ui/theme.css';
@source '../node_modules/@burtson-labs/ui/dist';`}
      />
      <P>
        <br />
        Without Tailwind (for example an MUI app), import the precompiled stylesheet once instead:
      </P>
      <Code code={`import '@burtson-labs/ui/styles.css';`} />
      <P>
        <br />
        Then use the components:
      </P>
      <Code
        code={`import { Button } from '@burtson-labs/ui';

export function Save() {
  return <Button>Save</Button>;
}`}
      />
      <H2>2. Copy the source</H2>
      <P>
        Every component is also published as a shadcn registry item at <code>ui.burtson.ai/r</code>.
        The CLI copies the file into <code>components/ui</code>, installs its dependencies and adds
        the Burtson theme to your CSS. From then on the code is yours to change.
      </P>
      <Code lang="sh" code="npx shadcn@latest add https://ui.burtson.ai/r/button.json" />
      <H2>Dark mode</H2>
      <P>
        Light is the default. Add <code>class=&quot;dark&quot;</code> or{' '}
        <code>data-theme=&quot;dark&quot;</code> to <code>&lt;html&gt;</code> (or any subtree) for
        the dark palette.
      </P>
    </article>
  );
}

function Swatches({ palette, label }: { palette: Palette; label: string }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Object.entries(palette).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="size-6 shrink-0 rounded-md border" style={{ background: v }} />
            <span className="grid">
              <span className="font-medium">{k}</span>
              <span className="font-mono text-muted-foreground">{v}</span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function Theming() {
  return (
    <article>
      <H1 lead="One set of tokens drives Tailwind, the registry and MUI.">Theming</H1>
      <P>
        Colours are CSS variables with the shadcn names (<code>background</code>,{' '}
        <code>primary</code>, <code>muted</code>, …), plus Burtson extras: <code>brand</code>,{' '}
        <code>brand-soft</code>, <code>success</code> and <code>warning</code>. Override any of them
        after importing the theme:
      </P>
      <Code
        lang="css"
        code={`:root {
  --radius: 0.5rem;
}
.dark {
  --primary: #8b0cc0;
}`}
      />
      <P>
        <br />
        The values come from <code>src/tokens.ts</code>, which is also exported for JavaScript:
      </P>
      <Code code={`import { brand, dark, light } from '@burtson-labs/ui/tokens';`} />
      <P>
        <br />
        This docs site overrides the accent (ink by default; pick another in the header) and uses
        neutral greys, to show the tokens at work. The swatches below are the package defaults.
      </P>
      <div className="mt-8 grid gap-4">
        <Swatches palette={dark} label="Dark" />
        <Swatches palette={light} label="Light" />
      </div>
    </article>
  );
}

export function Mui() {
  return (
    <article>
      <H1 lead="Most Burtson Labs apps run MUI today. They can share the palette now and adopt components one screen at a time.">
        Using with MUI
      </H1>
      <Code
        code={`import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { createBurtsonTheme } from '@burtson-labs/ui/mui';

const theme = createBurtsonTheme('dark');

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}`}
      />
      <P>
        <br />
        <code>createBurtsonTheme(mode, ...overrides)</code> maps the tokens onto the MUI palette,
        shape, shadows, typography and transitions, and gives MUI buttons, inputs, cards, dialogs,
        menus, chips and tabs the same radius and focus ring as the Burtson components. Pass your
        own theme options after the mode to extend it. <code>burtsonThemeOptions(mode)</code>{' '}
        returns the raw options if you merge themes yourself.
      </P>
      <Code
        code={`// A product accent and admin density. The primary fill, link colour and
// focus ring are derived from the accent with 4.5:1 contrast kept.
createBurtsonTheme({ mode: 'dark', accent: '#2563eb', density: 'compact' });

// The same derivation for the CSS side (Burtson UI components):
import { accentTokens } from '@burtson-labs/ui/tokens';
accentTokens('#2563eb', 'dark'); // { primary, brand, 'brand-soft', ring, … }`}
      />
      <P>
        To use Burtson UI components inside an MUI app, import{' '}
        <code>@burtson-labs/ui/styles.css</code> once. It leaves out Tailwind&apos;s global reset,
        so it will not fight <code>CssBaseline</code>.
      </P>
    </article>
  );
}

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const [code, setCode] = React.useState('// Loading example…');
  React.useEffect(() => {
    let active = true;
    void source(doc.name)
      .then((text) => {
        if (active) setCode(text);
      })
      .catch(() => {
        if (active) setCode('// Example could not load. Refresh to retry.');
      });
    return () => {
      active = false;
    };
  }, [doc.name]);
  return (
    <article>
      <H1 lead={doc.description}>{doc.title}</H1>
      {doc.radix && (
        <div className="-mt-4 mb-8 flex gap-2">
          <Badge variant="outline" asChild>
            <a
              href={`https://www.radix-ui.com/primitives/docs/components/${doc.radix}`}
              target="_blank"
              rel="noreferrer"
            >
              Radix {doc.radix} <ExternalLink />
            </a>
          </Badge>
        </div>
      )}
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <Preview name={doc.name} className="min-h-80" />
        </TabsContent>
        <TabsContent value="code">
          <Code code={code} />
        </TabsContent>
      </Tabs>
      <H2>Installation</H2>
      <Tabs defaultValue="package">
        <TabsList>
          <TabsTrigger value="package">Package</TabsTrigger>
          <TabsTrigger value="source">Copy source</TabsTrigger>
        </TabsList>
        <TabsContent value="package">
          <Code lang="sh" code="npm install @burtson-labs/ui @burtson-labs/icons" />
        </TabsContent>
        <TabsContent value="source">
          <Code lang="sh" code={`npx shadcn@latest add https://ui.burtson.ai/r/${doc.name}.json`} />
        </TabsContent>
      </Tabs>
      <ComponentDetails name={doc.name} />
      <Pager name={doc.name} />
    </article>
  );
}

function Pager({ name }: { name: string }) {
  const i = components.findIndex((c) => c.name === name);
  const prev = components[i - 1];
  const next = components[i + 1];
  return (
    <nav className="mt-12 flex justify-between gap-4 border-t pt-6" aria-label="Pager">
      {prev ? (
        <Button variant="outline" asChild>
          <Link href={`/docs/components/${prev.name}`}>← {prev.title}</Link>
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button variant="outline" asChild>
          <Link href={`/docs/components/${next.name}`}>{next.title} →</Link>
        </Button>
      )}
    </nav>
  );
}

export function NotFound() {
  return (
    <Card className="mx-auto mt-16 max-w-md text-center">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>That page does not exist, or it moved.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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

import { Code } from './code';
import { components, type ComponentDoc } from './docs';
import { Link } from './router';

const demoModules = import.meta.glob<{ default: React.ComponentType }>('./demos/*.tsx', {
  eager: true,
});
const demoSources = import.meta.glob<string>('./demos/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});
// Elements are created once at module load, so a page never remounts a demo.
const demos: Record<string, React.ReactElement> = Object.fromEntries(
  Object.entries(demoModules).map(([path, mod]) => [
    path.slice('./demos/'.length, -'.tsx'.length),
    React.createElement(mod.default),
  ]),
);
const source = (name: string) => demoSources[`./demos/${name}.tsx`] ?? '';

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

function Preview({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={`flex min-h-56 min-w-0 items-center justify-center overflow-x-auto rounded-lg border bg-background p-6 sm:p-8 ${className ?? ''}`}
    >
      {demos[name] ?? null}
    </div>
  );
}

export function Home() {
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
      <section className="relative isolate overflow-hidden py-16 sm:py-24">
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        />
        <Badge variant="brand" className="mb-5">
          Open source · MIT
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          The component system behind every <span className="text-brand">Burtson Labs</span> app.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          A quiet, precise, dark-first component system for agents, IDEs and ops tools, with Burtson
          Icons built in. Install the package, or own the source: every component is also a registry
          item you can copy into your app.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/docs/installation">
              Get started <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/components/button">Browse components</Link>
          </Button>
        </div>
        <Code
          lang="sh"
          className="mt-8 max-w-xl"
          code="npm install @burtson-labs/ui @burtson-labs/icons"
        />
      </section>
      <section className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-3">
        {showcase.map(([name, span]) => (
          <Preview key={name} name={name} className={`min-h-72 bg-surface-muted/60 ${span}`} />
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
        shape and typography. Pass your own theme options after the mode to extend it.{' '}
        <code>burtsonThemeOptions(mode)</code> returns the raw options if you merge themes yourself.
      </P>
      <P>
        To use Burtson UI components inside an MUI app, import{' '}
        <code>@burtson-labs/ui/styles.css</code> once. It leaves out Tailwind&apos;s global reset,
        so it will not fight <code>CssBaseline</code>.
      </P>
    </article>
  );
}

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const code = source(doc.name);
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

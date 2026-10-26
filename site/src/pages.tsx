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

import { AccentSwatches, ThemeEditor } from './accent';
import { Code } from './code';
import { ComponentDetails } from './component-details';
import { CopyMarkdown } from './copy-markdown';
import AgentRunDemo from './demos/agent-run';
import { components, type ComponentDoc } from './docs';
import { InterfaceScene, InterfacePaths } from './interface-scene';
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
  const [collection, setCollection] = React.useState('All components');
  const collections: Record<string, string[]> = {
    'All components': [],
    'Agents & chat': [
      'agent-run',
      'ask-user',
      'agent-plan',
      'context-usage',
      'loading-dots',
      'tool-call',
      'reasoning',
      'source',
      'composer',
      'model-picker',
      'message',
      'response-versions',
      'message-usage',
      'conversation',
      'attachment',
      'image-lightbox',
      'artifact-panel',
      'chat-layout',
      'chat-history',
      'connection-status',
    ],
    'Loading & feedback': [
      'progress',
      'circular-progress',
      'spinner',
      'loading-dots',
      'skeleton',
      'alert',
      'empty-state',
      'status',
    ],
    Workspace: [
      'theme-provider',
      'app-shell',
      'tree-view',
      'editor-tabs',
      'resizable',
      'command',
      'toolbar',
      'data-table',
      'mobile-nav',
      'avatar-upload',
      'avatar',
    ],
    'Forms & input': [
      'field',
      'input',
      'textarea',
      'select',
      'combobox',
      'checkbox',
      'slider',
      'switch',
      'form-actions',
      'avatar-upload',
      'voice-recorder',
    ],
  };
  const filtered = components.filter(
    (component) =>
      (collection === 'All components' || collections[collection]?.includes(component.name)) &&
      query
        .toLowerCase()
        .split(/\s+/)
        .every((term) =>
          `${component.title} ${component.description}`.toLowerCase().includes(term),
        ),
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
      <section className="grid grid-cols-[minmax(0,1fr)] gap-10 border-b py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_29rem] lg:items-center">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            @burtson-labs/ui · v{version} · {components.length} components · MIT
          </p>
          <h1 className="home-title">
            Interfaces for
            <br />
            working with agents.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Give people a clear view of what an agent is doing, what needs their attention, and what
            happens next. React components for conversations, approvals and workspaces, with
            keyboard and touch support built in.
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
        <InterfaceScene>
          <AgentRunDemo />
        </InterfaceScene>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 border-b py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <Code lang="sh" code="npm install @burtson-labs/ui @burtson-labs/icons" />
        <div className="flex flex-wrap items-center gap-4 px-3 text-xs text-muted-foreground">
          Try an accent <AccentSwatches />
        </div>
      </div>
      <InterfacePaths />
      <Link
        href="/docs/design-language"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-brand underline underline-offset-4"
      >
        One foundation for Labs, Bandit, Stealth, and TrueMarks <ArrowRight className="size-4" />
      </Link>
      <Playground />
      <section
        aria-labelledby="recipe-chat"
        className="grid grid-cols-[minmax(0,1fr)] gap-6 border-t py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center"
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
        <div role="group" aria-label="Component collections" className="mb-4 flex flex-wrap gap-2">
          {Object.keys(collections).map((name) => (
            <Button
              key={name}
              size="sm"
              variant={collection === name ? 'secondary' : 'ghost'}
              aria-pressed={collection === name}
              onClick={() => setCollection(name)}
            >
              {name}
            </Button>
          ))}
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
      <H2>3. With an AI agent</H2>
      <P>
        Using Claude Code, Cursor, Codex or Copilot? Give it the rules, the registry and the docs:{' '}
        <Link href="/docs/ai-agents" className="text-foreground underline underline-offset-4">
          Use with AI agents
        </Link>
        .
      </P>
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
      <ThemeEditor />
      <H2>Follow the system or choose a mode</H2>
      <Code
        code={`import { ThemeProvider, ThemeToggle } from '@burtson-labs/ui';

<ThemeProvider defaultTheme="system" storageKey="app-theme">
  <ThemeToggle />
  <App />
</ThemeProvider>`}
      />
      <P>
        Use <code>useTheme().setTheme(&apos;system&apos;)</code> to follow device settings again.
        The provider responds to system changes and preferences saved in another tab.
      </P>
      <H2>Apply the theme before first paint</H2>
      <P>
        The provider runs after React mounts, so on its own a dark-mode reader sees a light flash.
        Load the init script in <code>&lt;head&gt;</code>, before your styles. It reads the same
        storage key as the provider (<code>bl-theme</code> by default) and sets the{' '}
        <code>dark</code> class, <code>data-theme</code> and <code>color-scheme</code> on{' '}
        <code>&lt;html&gt;</code>. Blocked storage falls back to the default theme.
      </P>
      <P>
        With a strict Content Security Policy, serve it as a file so{' '}
        <code>script-src &apos;self&apos;</code> is enough. Copy{' '}
        <code>@burtson-labs/ui/theme-init.js</code> into your public folder (or let your bundler
        emit it) and configure it with data attributes:
      </P>
      <Code
        lang="tsx"
        code={`<script
  src="/theme-init.js"
  data-storage-key="app-theme"
  data-default-theme="system"
></script>`}
      />
      <P>
        To inline it instead, build the text with <code>themeInitScript()</code> on the server and
        allow it by hash. Pass the provider&apos;s <code>storageKey</code>,{' '}
        <code>legacyStorageKeys</code> and <code>defaultTheme</code> so both agree. Keys must be
        plain names (letters, digits, <code>. _ : -</code>); anything else throws instead of
        reaching the script.
      </P>
      <Code
        code={`import { themeInitScript, themeInitScriptHash } from '@burtson-labs/ui';

const options = { storageKey: 'app-theme' };
const script = themeInitScript(options);
// Add to script-src, e.g. script-src 'self' 'sha256-…'
const hash = await themeInitScriptHash(options);

<head>
  <script dangerouslySetInnerHTML={{ __html: script }} />
</head>`}
      />
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
      <P>
        Burtson Icons ship an MUI entry per icon (0.5.0), an <code>SvgIcon</code> that takes{' '}
        <code>fontSize</code> and <code>color</code> like any MUI icon, so buttons, list items and
        chips in an MUI screen use the same set as the Burtson components:
      </P>
      <Code
        code={`import Button from '@mui/material/Button';
import Plus from '@burtson-labs/icons/mui/plus';

<Button variant="contained" startIcon={<Plus />}>New agent</Button>;`}
      />
    </article>
  );
}

const primitiveModules: [string, string][] = [
  ['slot', 'Slot, Slottable and mergeProps: the asChild pattern.'],
  ['compose-refs', 'One node, several refs, on React 18 and 19.'],
  ['compose-handlers', 'Your handler first; the component’s unless you prevented the event.'],
  ['use-controllable-state', 'The value / defaultValue / onChange triple.'],
  ['use-id', 'Server-safe ids without React’s delimiters.'],
  ['tabbable', 'The Tab sequence from the HTML focusability rules.'],
  ['presence', 'Stay mounted through an exit animation, driven by data-state.'],
  ['portal', 'Render into the body or a container; nothing on the server.'],
  [
    'layer',
    'The dismissable layer stack: Escape, press outside, focus outside, modal pointer events.',
  ],
  ['focus-trap', 'FocusScope: focus in on mount, wrap, trap, restore on unmount.'],
  [
    'anchor-geometry',
    'The positioning arithmetic, with no DOM: side, align, flip, shift, arrow, origin.',
  ],
  ['anchor', 'The positioning engine: anchors, the fixed wrapper, the arrow, the CSS variables.'],
  ['scroll-lock', 'Counted page lock with scrollbar-gutter compensation and touch handling.'],
  ['hide-others', 'aria-hidden and inert on everything but the live surface; live regions kept.'],
  ['collection', 'An ordered registry of a composite’s items.'],
  ['roving-focus', 'Roving tabindex: one Tab stop, arrows, Home and End, RTL, loop.'],
  ['typeahead', 'Type-to-find for menus and lists.'],
  ['popover', 'Popover: Root, Trigger, Anchor, Portal, Content, Close, Arrow.'],
  ['tooltip', 'Tooltip: Provider, Root, Trigger, Portal, Content, Arrow.'],
  ['dialog', 'Dialog: Root, Trigger, Portal, Overlay, Content, Title, Description, Close.'],
  ['alert-dialog', 'AlertDialog: a Dialog that needs an answer.'],
  ['collapsible', 'Collapsible: Root, Trigger, Content, with the measured height for animations.'],
];

export function Primitives() {
  return (
    <article>
      <H1 lead="The behaviour layer under the components: focus, dismissal, positioning, presence. Burtson Labs’ own, headless, and copied with any component that needs it.">
        Primitives
      </H1>
      <P>
        Every overlay in the kit (Popover, Tooltip, Dialog, AlertDialog, Sheet, HoverCard, Tour,
        Collapsible, and the components built on them) runs on a set of small modules in{' '}
        <code>src/primitives</code>. They carry no classes and no theme. A component imports one,
        adds its classes and <code>data-slot</code> attributes, and re-exports the result under the
        kit&apos;s names, so the component API you use is unchanged. The menus, Select, Command,
        Tabs, Accordion and the form controls still run on the locally maintained Radix ports until
        their rewrite lands; the plan is in the repository&apos;s <code>VENDORING.md</code>.
      </P>
      <H2>Copying source</H2>
      <P>
        You do not install the primitives yourself. Each component&apos;s registry item lists the
        modules it needs, and the shadcn CLI copies them to <code>lib/burtson-primitives/</code>{' '}
        with their MIT notice. The relative imports between the modules keep working there.
      </P>
      <Code lang="sh" code="npx shadcn@latest add https://ui.burtson.ai/r/popover.json" />
      <P>
        <br />
        That pulls <code>primitive-popover</code> and its closure (<code>anchor</code>,{' '}
        <code>layer</code>, <code>focus-trap</code>, <code>presence</code>, <code>portal</code>,{' '}
        <code>slot</code> and the hooks). A module can also be added on its own, for a component of
        your own:
      </P>
      <Code lang="sh" code="npx shadcn@latest add https://ui.burtson.ai/r/primitive-layer.json" />
      <H2>Modules</H2>
      <ul className="mb-4 grid gap-2 text-sm leading-6">
        {primitiveModules.map(([name, what]) => (
          <li key={name} className="grid gap-0.5 sm:grid-cols-[12rem_1fr]">
            <code className="font-mono text-foreground">{name}</code>
            <span className="text-muted-foreground">{what}</span>
          </li>
        ))}
      </ul>
      <H2>How the layers behave</H2>
      <P>
        Overlays stack in the order they open. Escape closes the top one. A press or focus outside
        the top layer closes it and is then offered to each layer below, down to the top modal
        layer, so one press on the page closes a popover and the dialog it was opened from; a layer
        that refuses (a tour step) does not shield the one under it. A press inside a nested overlay
        is inside its parent too, even though the nested one renders in a portal elsewhere in the
        DOM. A modal layer turns pointer events off for the page and hides it from assistive
        technology; nothing under it is dismissed by what happens above.
      </P>
      <P>
        Focus moves into an overlay on open (the first tabbable, or the surface itself) and back to
        the trigger on close. When a popover closes because of a press elsewhere, the press decides
        where focus goes. Both moves can be prevented through <code>onOpenAutoFocus</code> and{' '}
        <code>onCloseAutoFocus</code>.
      </P>
      <H2>CSS variables</H2>
      <P>
        A positioned surface inherits five variables from its wrapper:{' '}
        <code>--bl-anchor-width</code>, <code>--bl-anchor-height</code>,{' '}
        <code>--bl-available-width</code>, <code>--bl-available-height</code> and{' '}
        <code>--bl-transform-origin</code>. A Collapsible sets{' '}
        <code>--bl-collapsible-content-height</code> and <code>-width</code> on its content; the
        page lock sets <code>--bl-scrollbar-gutter</code> on <code>html</code>.
      </P>
      <Code
        code={`<PopoverContent className="max-h-(--bl-available-height) origin-(--bl-transform-origin)" />
<PopoverContent className="w-(--bl-anchor-width)" /> {/* as wide as the trigger */}`}
      />
      <P>
        <br />
        The older <code>--radix-popover-content-*</code>, <code>--radix-popover-trigger-*</code>,{' '}
        <code>--radix-tooltip-*</code>, <code>--radix-popper-*</code> and{' '}
        <code>--radix-collapsible-content-*</code> names are still set as aliases. They are
        deprecated and will be removed in a later major; move class lists to the <code>--bl-</code>{' '}
        names when you touch them.
      </P>
      <H2>Design notes</H2>
      <P>
        Every decision the layer makes, and why, is written down in{' '}
        <code>src/primitives/README.md</code> in the repository, next to the code, together with the
        mapping the remaining components will follow.
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
              Upstream attribution <ExternalLink />
            </a>
          </Badge>
        </div>
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <a
          href="#api-reference"
          className="inline-flex text-sm font-medium text-brand underline underline-offset-4"
        >
          API reference
        </a>
        <CopyMarkdown name={doc.name} />
      </div>
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
    <nav className="mt-12 grid grid-cols-2 gap-3 border-t pt-6" aria-label="Pager">
      {prev ? (
        <Button variant="outline" className="min-w-0 justify-start" asChild>
          <Link href={`/docs/components/${prev.name}`}>
            <span className="truncate">← {prev.title}</span>
          </Link>
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button variant="outline" className="col-start-2 min-w-0 justify-end" asChild>
          <Link href={`/docs/components/${next.name}`}>
            <span className="truncate">{next.title} →</span>
          </Link>
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

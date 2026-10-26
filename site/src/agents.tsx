import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@burtson-labs/ui';

import skill from '../../skills/burtson-ui/SKILL.md?raw';

import {
  componentsJson,
  mcpCommands,
  projectRules,
  prompts,
  registryCommands,
  skillCommands,
} from './agents-content';
import { Code } from './code';

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-12 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 leading-7 text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:font-mono [&_code]:text-foreground">
      {children}
    </p>
  );
}

const files: [string, string, string][] = [
  [
    '/llms.txt',
    'https://ui.burtson.ai/llms.txt',
    'Index: install commands and every component, one line each.',
  ],
  [
    '/llms-full.txt',
    'https://ui.burtson.ai/llms-full.txt',
    'Every component in one file: description, when to use, props, import and example.',
  ],
  [
    '/docs/components/<name>.md',
    'https://ui.burtson.ai/docs/components/button.md',
    'One component page as Markdown. Each page also has a Copy as Markdown button.',
  ],
  [
    '/r/<name>.json',
    'https://ui.burtson.ai/r/registry.json',
    'The shadcn registry: component source, dependencies and the theme.',
  ],
  [
    'icons.burtson.ai/llms.txt',
    'https://icons.burtson.ai/llms.txt',
    'Burtson Icons for agents: every icon name with tags and import paths.',
  ],
];

/** The "Use with AI agents" guide: rules to paste, registry and MCP setup, the skill, prompts. */
export function AiAgents() {
  return (
    <article>
      <header className="mb-8 grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Use with AI agents</h1>
        <p className="text-lg text-muted-foreground">
          Set up Claude Code, Cursor, Codex, Copilot or any other coding agent to build with Burtson
          UI and Burtson Icons.
        </p>
      </header>

      <P>
        Agents do better with three things: the rules of the system in the project, a way to look up
        a component before using it, and a way to copy source. This page covers each. The same
        content is plain text at <a href="/llms.txt">/llms.txt</a>.
      </P>

      <H2 id="docs-for-agents">Docs agents can read</H2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Machine-readable documentation</caption>
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="p-3 font-medium">
                File
              </th>
              <th scope="col" className="p-3 font-medium">
                What it has
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map(([label, href, what]) => (
              <tr key={label} className="border-t">
                <th scope="row" className="p-3 font-mono text-xs font-normal">
                  <a href={href} className="underline underline-offset-4">
                    {label}
                  </a>
                </th>
                <td className="p-3 text-muted-foreground">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="project-rules">1. Add the rules to your project</H2>
      <P>
        Paste this into the file your agent reads at the start of every task: <code>CLAUDE.md</code>{' '}
        (Claude Code), <code>AGENTS.md</code> (Codex, Cursor, Copilot and others),{' '}
        <code>.cursorrules</code> (or a file in <code>.cursor/rules/</code>) or{' '}
        <code>.github/copilot-instructions.md</code>.
      </P>
      <Code lang="sh" code={projectRules} className="[&_pre]:whitespace-pre-wrap" />

      <H2 id="shadcn">2. Connect the registry and the shadcn MCP server</H2>
      <P>
        Every component is a shadcn registry item. Add the <code>@burtson</code> namespace to{' '}
        <code>components.json</code> so the CLI and the MCP server can find it:
      </P>
      <Code lang="sh" code={componentsJson} />
      <P>
        <br />
        Then add, search and view items by name:
      </P>
      <Code lang="sh" code={registryCommands} />
      <P>
        <br />
        The shadcn MCP server lets the agent browse, search and install registry items itself. Set
        it up for your client in the project root (it needs a <code>tsconfig.json</code> and adds{' '}
        <code>shadcn</code> as a dev dependency), then restart the agent:
      </P>
      <Code lang="sh" code={mcpCommands} />
      <P>
        <br />
        With the registry in <code>components.json</code>, ask for items by namespace: “add
        @burtson/agent-plan to the review page”.
      </P>

      <H2 id="skill">3. Install the Agent Skill</H2>
      <P>
        The <code>burtson-ui</code> skill tells an agent how to pick, install and use components,
        and when to read the docs. It follows the open{' '}
        <a href="https://agentskills.io">Agent Skills</a> format and lives in{' '}
        <a href="https://github.com/Burtson-Labs/ui/tree/main/skills/burtson-ui">
          skills/burtson-ui
        </a>
        . Install it with the <code>skills</code> CLI, which detects your agents and asks where to
        put it:
      </P>
      <Code lang="sh" code={skillCommands} />
      <P>
        <br />
        Or save the text below as <code>.claude/skills/burtson-ui/SKILL.md</code> (Claude Code) or{' '}
        <code>.agents/skills/burtson-ui/SKILL.md</code>:
      </P>
      <Code lang="sh" code={skill} className="[&_pre]:whitespace-pre-wrap" />

      <H2 id="prompts">4. Ask your agent</H2>
      <P>Prompts that work well once the rules or the skill are in place:</P>
      <div className="grid gap-4">
        {prompts.map((p) => (
          <Card key={p.title} className="gap-3">
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription className="sr-only">Example prompt</CardDescription>
            </CardHeader>
            <CardContent>
              <Code lang="sh" code={p.prompt} className="[&_pre]:whitespace-pre-wrap" />
            </CardContent>
          </Card>
        ))}
      </div>

      <H2 id="icons">Icons</H2>
      <P>
        Burtson Icons has its own guide, skill and llms files at{' '}
        <a href="https://icons.burtson.ai/agents/">icons.burtson.ai/agents</a>.
      </P>
    </article>
  );
}

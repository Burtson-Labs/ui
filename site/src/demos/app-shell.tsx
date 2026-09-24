import Activity from '@burtson-labs/icons/react/activity';
import BurtsonLabsVial from '@burtson-labs/icons/react/burtson-labs-vial';
import GitBranch from '@burtson-labs/icons/react/git-branch';
import ServerStack from '@burtson-labs/icons/react/server-stack';

import {
  AppShell,
  AppShellBody,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  Status,
} from '@burtson-labs/ui';

const nav = [
  { label: 'Runs', icon: Activity, active: true },
  { label: 'Repositories', icon: GitBranch },
  { label: 'Cluster', icon: ServerStack },
];

// A structural primitive: header, sidebar and main, with no routing or state.
// Apps add navigation, search and auth on top.
export default function AppShellDemo() {
  return (
    <AppShell className="h-80 min-h-0 w-full max-w-3xl overflow-hidden rounded-lg border">
      <AppShellHeader className="static gap-2 text-sm font-semibold">
        <BurtsonLabsVial className="size-4 text-brand" /> Bandit
        <Status status="success" className="ml-auto">
          cluster healthy
        </Status>
      </AppShellHeader>
      <AppShellBody className="grid-cols-[180px_1fr]">
        <AppShellSidebar className="p-2">
          <nav aria-label="Demo" className="grid gap-0.5">
            {nav.map(({ label, icon: Icon, active }) => (
              <span
                key={label}
                className={`flex h-8 items-center gap-2 rounded-sm px-2 text-[13px] ${active ? 'bg-muted font-semibold shadow-[inset_2px_0_0_var(--color-brand)]' : 'text-muted-foreground'}`}
              >
                <Icon className="size-4" /> {label}
              </span>
            ))}
          </nav>
        </AppShellSidebar>
        <AppShellMain>
          <AppShellContent className="text-sm text-muted-foreground">
            Page content goes here.
          </AppShellContent>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

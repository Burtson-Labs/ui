import { CopyButton, Toaster } from '@burtson-labs/ui';

export default function CopyButtonDemo() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 py-1 pr-1 pl-3 font-mono text-sm">
      npm i @burtson-labs/ui
      <CopyButton value="npm i @burtson-labs/ui" label="Copy install command" />
      <Toaster />
    </div>
  );
}

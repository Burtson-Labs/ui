import { Separator } from '@burtson-labs/ui';

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm">
      <p className="text-sm font-medium">Burtson UI</p>
      <p className="text-sm text-muted-foreground">Components for every Burtson Labs app.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Icons</span>
        <Separator orientation="vertical" />
        <span>GitHub</span>
      </div>
    </div>
  );
}

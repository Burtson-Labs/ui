import { Input, Label, SearchInput } from '@burtson-labs/ui';

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-lg gap-5">
      <div className="grid gap-2">
        <Label htmlFor="ollama-url">Ollama URL</Label>
        <Input id="ollama-url" placeholder="http://localhost:11434" width="lg" />
        <p className="text-xs text-muted-foreground">Leave empty to use the default.</p>
      </div>
      {/* Widths by content, full width on phones: xs, sm, md, lg, full. */}
      <div className="flex flex-wrap items-end gap-3">
        <Input aria-label="Minutes" placeholder="15" width="xs" inputMode="numeric" />
        <Input aria-label="Year" placeholder="2026" width="sm" />
        <Input aria-label="Date" placeholder="2026-09-25" width="md" />
      </div>
      <SearchInput aria-label="Search agents" placeholder="Search agents" width="md" />
    </div>
  );
}

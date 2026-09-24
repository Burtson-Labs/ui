import { Input, Label } from '@burtson-labs/ui';

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="ollama-url">Ollama URL</Label>
      <Input id="ollama-url" placeholder="http://localhost:11434" />
      <p className="text-xs text-muted-foreground">Leave empty to use the default.</p>
    </div>
  );
}

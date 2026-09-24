import { Label, Textarea } from '@burtson-labs/ui';

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="prompt">Prompt</Label>
      <Textarea id="prompt" placeholder="Describe the change you want…" />
    </div>
  );
}

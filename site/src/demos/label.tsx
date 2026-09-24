import { Input, Label } from '@burtson-labs/ui';

export default function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  );
}

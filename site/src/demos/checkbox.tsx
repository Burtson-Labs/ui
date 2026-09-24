import { Checkbox, Label } from '@burtson-labs/ui';

export default function CheckboxDemo() {
  return (
    <div className="grid gap-3">
      <Label>
        <Checkbox defaultChecked /> Scrub environment variables
      </Label>
      <Label>
        <Checkbox /> Allow network access
      </Label>
      <Label>
        <Checkbox disabled /> Mount home directory
      </Label>
    </div>
  );
}

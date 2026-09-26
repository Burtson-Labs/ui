import { Checkbox, CheckboxRow, Label } from '@burtson-labs/ui';

export default function CheckboxDemo() {
  return (
    <div className="grid gap-5">
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
      {/* A row: label to the right, a line of help under it. */}
      <CheckboxRow
        label="Send me a copy"
        description="One email per booking, to the address on your profile."
        defaultChecked
      />
    </div>
  );
}

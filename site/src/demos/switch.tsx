import { Label, Switch } from '@burtson-labs/ui';

export default function SwitchDemo() {
  return (
    <div className="grid gap-3">
      <Label>
        <Switch defaultChecked /> Sandbox commands
      </Label>
      <Label>
        <Switch /> Share usage data
      </Label>
    </div>
  );
}

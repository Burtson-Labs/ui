import * as React from 'react';

import {
  Badge,
  InlineSwitch,
  Label,
  NumberInput,
  Switch,
  SwitchList,
  SwitchRow,
} from '@burtson-labs/ui';

export default function SwitchDemo() {
  const [late, setLate] = React.useState(true);
  return (
    <div className="grid w-full max-w-md gap-6">
      <div className="grid gap-3">
        <Label>
          <Switch defaultChecked /> Sandbox commands
        </Label>
        <Label>
          <Switch /> Share usage data
        </Label>
      </div>
      {/* Settings: the name and what it does on the left, the switch on the right. */}
      <SwitchList bordered>
        <SwitchRow
          inset
          label="ETA moves"
          description="When a truck is running late by more than this."
          checked={late}
          onCheckedChange={setLate}
          before={
            <NumberInput suffix="min" defaultValue="15" width="xs" aria-label="Minutes late" />
          }
        />
        <SwitchRow
          inset
          label="Detention starts"
          badge={<Badge variant="brand">Always on</Badge>}
          defaultChecked
          disabled
        />
        <SwitchRow inset label="Quiet hours" description="Nothing between 10pm and 6am." />
      </SwitchList>
      {/* Filters: the switch first, then its label. */}
      <div className="flex flex-wrap gap-5">
        <InlineSwitch label="Only mine" defaultChecked />
        <InlineSwitch label="Running late" />
      </div>
    </div>
  );
}

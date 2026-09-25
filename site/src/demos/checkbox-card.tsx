import * as React from 'react';

import { CheckboxCard, CheckboxCardGroup } from '@burtson-labs/ui';

const roles = [
  {
    id: 'dispatcher',
    title: 'Dispatcher',
    description: 'Books loads, assigns drivers, sees the board.',
  },
  { id: 'billing', title: 'Billing', description: 'Invoices, rates and settlements.' },
  { id: 'admin', title: 'Admin', description: 'Everything above, plus people and settings.' },
];

export default function CheckboxCardDemo() {
  const [value, setValue] = React.useState<string[]>(['dispatcher']);
  return (
    <CheckboxCardGroup label="Roles" description="Pick one or more." className="w-full max-w-md">
      {roles.map((r) => (
        <CheckboxCard
          key={r.id}
          title={r.title}
          description={r.description}
          checked={value.includes(r.id)}
          onCheckedChange={(on) =>
            setValue((v) => (on === true ? [...v, r.id] : v.filter((x) => x !== r.id)))
          }
        />
      ))}
      <CheckboxCard
        title="Owner"
        description="Only the current owner can transfer ownership."
        checked
        disabled
      />
    </CheckboxCardGroup>
  );
}

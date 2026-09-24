import * as React from 'react';

import { Combobox, Field, FieldLabel } from '@burtson-labs/ui';

const users = [
  { value: 'u1', label: 'Dana Ortiz', description: 'dana@burtson.ai' },
  { value: 'u2', label: 'Luis Park', description: 'luis@burtson.ai' },
  { value: 'u3', label: 'Mei Chen', description: 'mei@partner.example' },
  { value: 'u4', label: 'Sam Reed', description: 'sam@burtson.ai' },
];

export default function ComboboxDemo() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <Field className="w-72">
      <FieldLabel htmlFor="owner">Key owner</FieldLabel>
      <Combobox
        id="owner"
        options={users}
        value={value}
        onValueChange={setValue}
        placeholder="Search users"
        searchPlaceholder="Name or email…"
      />
    </Field>
  );
}

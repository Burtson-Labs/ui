import { Field, FieldGrid, NumberInput } from '@burtson-labs/ui';

export default function NumberInputDemo() {
  return (
    <FieldGrid columns={3} className="w-full max-w-lg">
      <Field label="Rate" description="Per loaded mile.">
        <NumberInput prefix="$" decimal defaultValue="4.25" width="full" />
      </Field>
      <Field label="Gallons">
        <NumberInput suffix="gal" defaultValue="7,500" width="full" />
      </Field>
      <Field label="Free time" error="Whole minutes only.">
        <NumberInput suffix="min" defaultValue="90.5" width="full" />
      </Field>
    </FieldGrid>
  );
}

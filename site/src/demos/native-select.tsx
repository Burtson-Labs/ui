import { Field, NativeSelect } from '@burtson-labs/ui';

export default function NativeSelectDemo() {
  return (
    <Field label="Product" description="The phone's own picker; no popover." className="w-64">
      <NativeSelect defaultValue="diesel">
        <option value="diesel">Dyed diesel</option>
        <option value="gasoline">Gasoline</option>
        <option value="def">DEF</option>
        <option value="propane" disabled>
          Propane (not offered)
        </option>
      </NativeSelect>
    </Field>
  );
}

import { Field, FieldLabel, SecretInput } from '@burtson-labs/ui';

export default function SecretInputDemo() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="api-key">API key</FieldLabel>
      <SecretInput id="api-key" revealLabel="API key" defaultValue="sk-live-4f9c2d7a1b" />
    </Field>
  );
}

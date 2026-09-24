import {
  Field,
  FieldDescription,
  FieldError,
  FieldHeader,
  FieldHint,
  FieldLabel,
  Input,
  Textarea,
} from '@burtson-labs/ui';

export default function FieldDemo() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <Field>
        <FieldHeader>
          <FieldLabel htmlFor="agent-name">Agent name</FieldLabel>
          <FieldHint>Shown in logs</FieldHint>
        </FieldHeader>
        <Input id="agent-name" defaultValue="release-captain" />
        <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="ollama">Ollama URL</FieldLabel>
        <Input
          id="ollama"
          defaultValue="http://localhost:11343"
          aria-invalid
          aria-describedby="ollama-error"
        />
        <FieldError id="ollama-error">
          Nothing answered on port 11343. Did you mean 11434?
        </FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="instructions">Instructions</FieldLabel>
        <Textarea id="instructions" placeholder="Run the test suite before every commit…" />
      </Field>
    </div>
  );
}

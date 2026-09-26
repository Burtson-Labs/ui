import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldHeader,
  FieldHint,
  FieldLabel,
  FieldSet,
  Input,
  NumberInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@burtson-labs/ui';

export default function FieldDemo() {
  return (
    <div className="grid w-full max-w-lg gap-8">
      {/* The recipe: label, control, help; ids and aria wired for you. */}
      <FieldSet legend="Pickup" description="Where and when the driver loads.">
        <FieldGrid columns={2}>
          <Field label="Site" description="The shipper's yard or terminal." span>
            <Input defaultValue="Phillips 66, Kansas City" />
          </Field>
          <Field label="Gallons" required error="Enter a whole number.">
            <NumberInput suffix="gal" defaultValue="7,500" width="full" />
          </Field>
          <Field label="Product" optional>
            <Select defaultValue="diesel">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Dyed diesel</SelectItem>
                <SelectItem value="gasoline">Gasoline</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Window" group span>
            <div className="flex w-full items-center gap-2">
              <Input aria-label="From" defaultValue="08:00" width="full" />
              <span className="text-sm text-muted-foreground">to</span>
              <Input aria-label="To" defaultValue="11:00" width="full" />
            </div>
          </Field>
        </FieldGrid>
      </FieldSet>
      {/* Or compose the parts yourself. */}
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

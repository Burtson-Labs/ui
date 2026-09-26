import { Button, Field, FieldGrid, FieldSet, FormActions, Input } from '@burtson-labs/ui';

export default function FormActionsDemo() {
  return (
    <div className="grid w-full max-w-lg gap-6">
      <FieldSet legend="Workspace" description="Shown to everyone in the team.">
        <FieldGrid columns={2}>
          <Field label="Name">
            <Input defaultValue="bandit-stealth" />
          </Field>
          <Field label="Slug" description="In URLs.">
            <Input defaultValue="bandit-stealth" />
          </Field>
        </FieldGrid>
      </FieldSet>
      {/* Narrow the preview to see the phone form: one row, the primary widest. */}
      <FormActions start={<Button variant="ghost">Cancel</Button>}>
        <Button variant="outline">Save draft</Button>
        <Button>Save changes</Button>
      </FormActions>
    </div>
  );
}

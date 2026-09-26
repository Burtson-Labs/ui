import * as React from 'react';

import { Button, ErrorSummary, Field, FieldGrid, FormActions, Input } from '@burtson-labs/ui';

export default function ErrorSummaryDemo() {
  const [name, setName] = React.useState('Release Captain');
  const [url, setUrl] = React.useState('localhost:11343');
  const [submitted, setSubmitted] = React.useState(false);
  const errors = [
    ...(/^[a-z0-9-]+$/.test(name)
      ? []
      : [{ id: 'es-name', message: 'Agent name: lowercase letters, numbers and dashes only.' }]),
    ...(/^https?:\/\//.test(url)
      ? []
      : [{ id: 'es-url', message: 'Ollama URL: start with http:// or https://.' }]),
  ];
  return (
    <form
      className="grid w-full max-w-md gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      {submitted && <ErrorSummary errors={errors} />}
      <FieldGrid columns={1}>
        <Field
          id="es-name"
          label="Agent name"
          error={
            submitted && errors.some((e) => e.id === 'es-name')
              ? 'Lowercase letters, numbers and dashes only.'
              : undefined
          }
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field
          id="es-url"
          label="Ollama URL"
          error={
            submitted && errors.some((e) => e.id === 'es-url')
              ? 'Start with http:// or https://.'
              : undefined
          }
        >
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
      </FieldGrid>
      <FormActions>
        <Button type="submit">Save</Button>
      </FormActions>
    </form>
  );
}

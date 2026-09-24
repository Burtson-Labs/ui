import AlertTriangle from '@burtson-labs/icons/react/alert-triangle';
import CheckCircle from '@burtson-labs/icons/react/check-circle';
import Sparkles from '@burtson-labs/icons/react/sparkles';

import { Alert, AlertDescription, AlertTitle } from '@burtson-labs/ui';

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Alert variant="brand">
        <Sparkles />
        <AlertTitle>New model available</AlertTitle>
        <AlertDescription>gemma4:e4b is pulled and ready for the agent loop.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircle />
        <AlertTitle>Audit passed</AlertTitle>
        <AlertDescription>
          Sentinel found no secrets in the working tree or history.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Ollama isn&apos;t running</AlertTitle>
        <AlertDescription>Open the Ollama app, or run ollama serve.</AlertDescription>
      </Alert>
    </div>
  );
}

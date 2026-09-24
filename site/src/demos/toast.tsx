import * as React from 'react';

import {
  Button,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@burtson-labs/ui';

export default function ToastDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <ToastProvider>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Deploy site
      </Button>
      <Toast open={open} onOpenChange={setOpen} variant="success">
        <ToastTitle>Deployed</ToastTitle>
        <ToastDescription>burtson.ai is serving build 0.8.11.</ToastDescription>
        <ToastAction altText="View the deploy log">View</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}

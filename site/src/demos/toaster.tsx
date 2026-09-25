import { Button, toast, Toaster } from '@burtson-labs/ui';

export default function ToasterDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast({ title: 'Saved', variant: 'success' })}>
        Save
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: 'Could not delete report.pdf',
            description: 'The storage service did not answer. Try again.',
            variant: 'destructive',
          })
        }
      >
        Fail
      </Button>
      <Toaster />
    </div>
  );
}

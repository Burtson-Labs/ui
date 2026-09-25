import * as React from 'react';

import {
  AttachmentItem,
  AttachmentTray,
  Button,
  UploadQueue,
  type UploadQueueFile,
} from '@burtson-labs/ui';

const initial: UploadQueueFile[] = [
  { id: 'a', name: 'q3-report.pdf', size: 2_480_000, state: 'ready' },
  { id: 'b', name: 'invoices-2026.xlsx', size: 912_000, state: 'parsing', progress: 60 },
  { id: 'c', name: 'scan-0412.tiff', size: 38_200_000, state: 'uploading', progress: 25 },
  {
    id: 'd',
    name: 'notes.pages',
    size: 120_000,
    state: 'failed',
    error: 'This file type can’t be read. Export it as PDF.',
  },
];

export default function AttachmentDemo() {
  // The app owns uploading and parsing; the components show what it reports.
  const [files, setFiles] = React.useState(initial);
  const remove = (id: string) => setFiles((f) => f.filter((x) => x.id !== id));
  const retry = (id: string) =>
    setFiles((f) =>
      f.map((x) =>
        x.id === id ? { ...x, state: 'uploading', progress: 10, error: undefined } : x,
      ),
    );
  return (
    <div className="grid w-full max-w-xl gap-6">
      <AttachmentTray>
        {files.map((f) => (
          <AttachmentItem
            key={f.id}
            name={f.name}
            size={f.size}
            state={f.state}
            progress={f.progress}
            error={f.error}
            onRemove={() => remove(f.id)}
            onRetry={() => retry(f.id)}
          />
        ))}
      </AttachmentTray>
      <UploadQueue
        files={files}
        onRemove={remove}
        onRetry={retry}
        empty={
          <Button size="sm" variant="outline" onClick={() => setFiles(initial)}>
            Reset example
          </Button>
        }
      />
    </div>
  );
}

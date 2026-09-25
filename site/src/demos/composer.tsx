import Paperclip from '@burtson-labs/icons/react/paperclip';
import * as React from 'react';

import {
  AttachmentItem,
  AttachmentTray,
  Composer,
  IconButton,
  Suggestions,
} from '@burtson-labs/ui';

export default function ComposerDemo() {
  const [sent, setSent] = React.useState<string[]>([]);
  const [files, setFiles] = React.useState(['build-4821.log']);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Suggestions
        items={['Summarize today’s runs', 'Why did the build fail?']}
        onSelect={(s) => setSent((x) => [...x, s])}
      />
      {/* With a file attached, an empty message can still be sent. */}
      <Composer
        onSubmit={(t) => {
          setSent((x) => [...x, t || `(${files.length} file)`]);
          setFiles([]);
        }}
        attachmentCount={files.length}
        attachments={
          files.length > 0 && (
            <AttachmentTray>
              {files.map((name) => (
                <AttachmentItem
                  key={name}
                  name={name}
                  size={48_213}
                  onRemove={() => setFiles((f) => f.filter((x) => x !== name))}
                />
              ))}
            </AttachmentTray>
          )
        }
        actions={
          <IconButton
            label="Attach a file"
            variant="ghost"
            size="icon-sm"
            onClick={() => setFiles((f) => (f.length ? f : ['build-4821.log']))}
          >
            <Paperclip />
          </IconButton>
        }
      />
      {sent.length > 0 && <p className="text-xs text-muted-foreground">Sent: {sent.join(' · ')}</p>}
    </div>
  );
}

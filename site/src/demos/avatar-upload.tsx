import * as React from 'react';

import { AvatarUpload } from '@burtson-labs/ui';

export default function AvatarUploadDemo() {
  const [src, setSrc] = React.useState<string>();
  React.useEffect(
    () => () => {
      if (src) URL.revokeObjectURL(src);
    },
    [src],
  );
  return (
    <div className="w-full max-w-lg">
      <AvatarUpload
        name="Alex Morgan"
        fallback="AM"
        src={src}
        onUpload={(file) => {
          setSrc(URL.createObjectURL(file));
          return Promise.resolve();
        }}
        onRemove={() => {
          setSrc(undefined);
          return Promise.resolve();
        }}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Local preview only. Your photo stays in this browser.
      </p>
    </div>
  );
}

import * as React from 'react';

import { Message, MessageActions, ResponseVersions } from '@burtson-labs/ui';

const answers = [
  'Phillips 66 KC averaged 58 minutes of detention this week.',
  'Phillips 66 KC had the longest waits: 58 minutes on average, 13.6 hours over target.',
];

export default function ResponseVersionsDemo() {
  const [versions, setVersions] = React.useState(answers);
  const [index, setIndex] = React.useState(1);
  const regenerate = () => {
    setVersions((v) => [...v, `Version ${v.length + 1}: Phillips 66 KC, 58 minutes average.`]);
    setIndex(versions.length);
  };
  return (
    <div className="grid w-full max-w-xl gap-6">
      <Message
        from="assistant"
        name="Assistant"
        actions={
          <MessageActions
            versions={{ index, count: versions.length, onIndexChange: setIndex }}
            copyText={versions[index]}
            onRegenerate={regenerate}
          />
        }
      >
        {versions[index]}
      </Message>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        Standalone:
        <ResponseVersions index={index} count={versions.length} onIndexChange={setIndex} />
      </div>
    </div>
  );
}

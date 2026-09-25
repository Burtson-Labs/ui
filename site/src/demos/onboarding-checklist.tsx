import * as React from 'react';

import { Button, OnboardingChecklist } from '@burtson-labs/ui';

export default function OnboardingChecklistDemo() {
  // In an app these flags come from real events: a repo opened, a provider test passed.
  const [done, setDone] = React.useState({
    repo: true,
    provider: false,
    ask: false,
    review: false,
  });
  const [dismissed, setDismissed] = React.useState(false);
  const finish = (key: keyof typeof done) => setDone((d) => ({ ...d, [key]: true }));

  if (dismissed)
    return (
      <Button variant="outline" size="sm" onClick={() => setDismissed(false)}>
        Show checklist
      </Button>
    );
  return (
    <OnboardingChecklist
      className="w-full max-w-md"
      title="Get started"
      description="Four steps to a first reviewed change."
      onDismiss={() => setDismissed(true)}
      complete={
        <p className="text-muted-foreground">You are set up. Dismiss this when you like.</p>
      }
      items={[
        { id: 'repo', title: 'Open a repository', done: done.repo },
        {
          id: 'provider',
          title: 'Configure and test a provider',
          description: 'A local model or your own key.',
          done: done.provider,
          action: (
            <Button size="xs" variant="outline" onClick={() => finish('provider')}>
              Set up
            </Button>
          ),
        },
        {
          id: 'ask',
          title: 'Ask a first question',
          done: done.ask,
          action: (
            <Button size="xs" variant="outline" onClick={() => finish('ask')}>
              Ask
            </Button>
          ),
        },
        {
          id: 'review',
          title: 'Review a first change',
          done: done.review,
          action: (
            <Button size="xs" variant="outline" onClick={() => finish('review')}>
              Review
            </Button>
          ),
        },
      ]}
    />
  );
}

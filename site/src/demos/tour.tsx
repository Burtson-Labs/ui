import * as React from 'react';

import { Button, Spotlight, Tour, TourAnchor, type TourStep } from '@burtson-labs/ui';

const steps: TourStep[] = [
  {
    id: 'explorer',
    target: 'demo-explorer',
    title: 'Explorer',
    content: 'Find and open a file in the current repository.',
    side: 'right',
  },
  {
    id: 'editor',
    target: 'demo-editor',
    title: 'Editor and tabs',
    content: 'Move between open files. A dot on a tab means unsaved changes.',
  },
  {
    id: 'agent',
    target: 'demo-agent',
    title: 'Agent panel',
    content: 'Choose the active model and attach the files it should read.',
    side: 'left',
  },
];

const box =
  'flex items-center justify-center rounded-md border bg-surface p-3 text-[13px] text-muted-foreground';

export default function TourDemo() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [hint, setHint] = React.useState(false);
  const [ended, setEnded] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-2xl">
      <div className="grid h-40 grid-cols-[1fr_2fr_1fr] gap-2" data-slot="tour-demo">
        <TourAnchor id="demo-explorer">
          <div className={box}>Explorer</div>
        </TourAnchor>
        <TourAnchor id="demo-editor">
          <div className={box}>Editor</div>
        </TourAnchor>
        <TourAnchor id="demo-agent">
          <div className={box}>Agent</div>
        </TourAnchor>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            setStep(0);
            setEnded(null);
            setOpen(true);
          }}
        >
          Meet your workspace
        </Button>
        <Button size="sm" variant="outline" onClick={() => setHint(true)}>
          Show a hint
        </Button>
        {ended && <span className="text-xs text-muted-foreground">Tour ended: {ended}</span>}
      </div>
      <Tour
        steps={steps}
        open={open}
        step={step}
        onStepChange={setStep}
        onEnd={(reason) => {
          setOpen(false);
          setEnded(reason);
        }}
      />
      <Spotlight
        target="demo-agent"
        open={hint}
        onDismiss={() => setHint(false)}
        title="Add a provider"
        side="bottom"
      >
        Use a local model or your own API key. Nothing leaves your machine until you choose.
      </Spotlight>
    </div>
  );
}

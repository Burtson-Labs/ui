import Agent from '@burtson-labs/icons/react/agent';
import Copy from '@burtson-labs/icons/react/copy';
import RotateCcw from '@burtson-labs/icons/react/rotate-ccw';

import { IconButton, Message } from '@burtson-labs/ui';

export default function MessageDemo() {
  return (
    <div className="grid w-full max-w-xl gap-5">
      <Message from="system">Conversation started · gemma4:e4b on carterpi</Message>
      <Message from="user" meta="9:41">
        Is the cluster healthy?
      </Message>
      <Message
        from="assistant"
        name="Bandit"
        meta="9:41"
        avatar={<Agent />}
        actions={
          <>
            <IconButton label="Copy" variant="ghost" size="icon-sm">
              <Copy />
            </IconButton>
            <IconButton label="Retry" variant="ghost" size="icon-sm">
              <RotateCcw />
            </IconButton>
          </>
        }
      >
        All 15 nodes are Ready. maddipi is at 86% memory; worth a look before the nightly build.
      </Message>
    </div>
  );
}

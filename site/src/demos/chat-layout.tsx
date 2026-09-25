import * as React from 'react';

import {
  ChatHistory,
  ChatLayout,
  Composer,
  Conversation,
  Markdown,
  Message,
} from '@burtson-labs/ui';

const now = Date.now();

export default function ChatLayoutDemo() {
  const [active, setActive] = React.useState('a');
  return (
    <div className="h-[28rem] w-full overflow-hidden rounded-lg border">
      <ChatLayout
        title="Fuel surcharge for next week"
        sidebar={
          <ChatHistory
            items={[
              { id: 'a', title: 'Fuel surcharge for next week', updatedAt: now },
              { id: 'b', title: 'Detention at Phillips 66', updatedAt: now - 86_400_000 },
            ]}
            activeId={active}
            onSelect={setActive}
            onNewChat={() => undefined}
          />
        }
      >
        <Conversation className="flex-1">
          <Message from="user">What does the surcharge move to on Monday?</Message>
          <Message from="assistant" name="Assistant">
            <Markdown>
              {'Diesel is up **6¢** in PADD 2, so the table moves to **$0.41/mi**.'}
            </Markdown>
          </Message>
        </Conversation>
        <div className="p-3">
          <Composer onSubmit={() => undefined} onAttach={() => undefined} />
        </div>
      </ChatLayout>
    </div>
  );
}

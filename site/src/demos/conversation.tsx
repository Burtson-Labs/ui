import Agent from '@burtson-labs/icons/react/agent';
import * as React from 'react';

import {
  Composer,
  Conversation,
  Markdown,
  Message,
  Reasoning,
  StreamingIndicator,
  Suggestions,
  ToolCall,
} from '@burtson-labs/ui';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

const seed: Turn[] = [
  { role: 'user', text: 'Which repos failed the nightly Sentinel audit?' },
  {
    role: 'assistant',
    text: 'One did. **bowling** failed on `QUA-001` (errors swallowed in two catch blocks). The other 13 passed.\n\n- security 10/10 across the board\n- median score 9.4',
  },
];

export default function ConversationDemo() {
  const [turns, setTurns] = React.useState<Turn[]>(seed);
  const [streaming, setStreaming] = React.useState(false);

  const ask = (text: string) => {
    setTurns((t) => [...t, { role: 'user', text }]);
    setStreaming(true);
    setTimeout(() => {
      setTurns((t) => [
        ...t,
        { role: 'assistant', text: `Looked into *${text}*. Nothing else needs attention.` },
      ]);
      setStreaming(false);
    }, 1200);
  };

  return (
    <div className="grid h-[28rem] w-full max-w-2xl grid-rows-[1fr_auto] overflow-hidden rounded-lg border bg-background">
      <Conversation>
        {turns.map((t, i) =>
          t.role === 'user' ? (
            <Message key={i} from="user">
              {t.text}
            </Message>
          ) : (
            <Message key={i} from="assistant" name="Sentinel agent" avatar={<Agent />}>
              <div className="grid gap-3">
                {i === 1 && (
                  <>
                    <Reasoning durationMs={2400}>
                      Read the audit index, then each failing report.
                    </Reasoning>
                    <ToolCall
                      name="list_audits"
                      status="success"
                      durationMs={420}
                      args={{ date: 'today' }}
                      result={{ passing: 13, failing: ['bowling'] }}
                    />
                  </>
                )}
                <Markdown>{t.text}</Markdown>
              </div>
            </Message>
          ),
        )}
        {streaming && (
          <Message from="assistant" name="Sentinel agent" avatar={<Agent />}>
            <StreamingIndicator />
          </Message>
        )}
      </Conversation>
      <div className="grid gap-2 border-t p-3">
        <Suggestions items={['Show the bowling findings', 'Rerun the audit']} onSelect={ask} />
        <Composer
          onSubmit={ask}
          streaming={streaming}
          onStop={() => setStreaming(false)}
          placeholder="Ask the Sentinel agent…"
        />
      </div>
    </div>
  );
}

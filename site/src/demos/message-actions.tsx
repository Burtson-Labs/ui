import * as React from 'react';

import {
  Message,
  MessageActions,
  MessageAttachments,
  MessageEditor,
  type MessageFeedback,
} from '@burtson-labs/ui';

export default function MessageActionsDemo() {
  const [feedback, setFeedback] = React.useState<MessageFeedback>(null);
  const [editing, setEditing] = React.useState(false);
  const [question, setQuestion] = React.useState(
    'Which terminals had the longest waits this week?',
  );
  return (
    <div className="grid w-full max-w-xl gap-5">
      {editing ? (
        <MessageEditor
          defaultValue={question}
          onSubmit={(t) => {
            setQuestion(t);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <Message
          from="user"
          actions={<MessageActions copyText={question} onEdit={() => setEditing(true)} />}
        >
          {question}
          <MessageAttachments
            className="mt-2"
            files={[{ name: 'detention-week-38.csv', size: 18_204, type: 'text/csv' }]}
          />
        </Message>
      )}
      <Message
        from="assistant"
        name="Assistant"
        actions={
          <MessageActions
            copyText="Phillips 66 KC averaged 58 minutes."
            onRegenerate={() => setFeedback(null)}
            feedback={feedback}
            onFeedback={setFeedback}
          />
        }
      >
        Phillips 66 KC averaged 58 minutes, 13.6 hours over target across 30 visits.
      </Message>
    </div>
  );
}

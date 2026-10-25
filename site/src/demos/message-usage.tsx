import { Message, MessageActions, MessageUsage } from '@burtson-labs/ui';

export default function MessageUsageDemo() {
  return (
    <div className="grid w-full max-w-xl gap-6">
      <Message
        from="assistant"
        name="Assistant"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <MessageActions copyText="The surcharge moves to $0.41/mi on Monday." />
            <MessageUsage inputTokens={1204} outputTokens={356} cost={0.0042} durationMs={3240} />
          </div>
        }
      >
        The surcharge moves to $0.41/mi on Monday.
      </Message>
      <div className="grid gap-1.5">
        <MessageUsage
          inputTokens={18_532}
          outputTokens={2_048}
          cost={1.27}
          currency="EUR"
          locale="de-DE"
        />
        <MessageUsage outputTokens={512} durationMs={65_000} />
      </div>
      <p className="text-xs text-muted-foreground">
        Example counts. In an app, pass what your provider reported; unmeasured values are left out.
      </p>
    </div>
  );
}

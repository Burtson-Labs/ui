import { LoadingDots } from '@burtson-labs/ui';

export default function LoadingDotsDemo() {
  return (
    <div className="grid gap-5">
      <LoadingDots showLabel label="Thinking through your request" />
      <LoadingDots showLabel label="Waiting for a tool response" className="text-brand" />
      <div className="flex items-center gap-3">
        <span className="text-sm">Assistant</span>
        <LoadingDots label="Assistant is typing" />
      </div>
    </div>
  );
}

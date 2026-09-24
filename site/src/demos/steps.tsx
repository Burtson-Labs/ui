import { Steps } from '@burtson-labs/ui';

export default function StepsDemo() {
  return (
    <Steps
      className="w-full max-w-2xl"
      current={1}
      items={[
        { title: 'Sign in', description: 'Email or Google' },
        { title: 'Verify', description: 'One-time code' },
        { title: 'Done', description: 'Open your workspace' },
      ]}
    />
  );
}

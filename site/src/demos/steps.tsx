import { Steps } from '@burtson-labs/ui';

export default function StepsDemo() {
  // Below 640px this becomes "Step 2 of 5" with a progress bar.
  return (
    <Steps
      className="w-full max-w-3xl"
      current={1}
      items={[
        { title: 'Company', description: 'Name and domain' },
        { title: 'Sign-in', description: 'SSO or email' },
        { title: 'Mailbox', description: 'Where loads arrive' },
        { title: 'Brand', description: 'Logo and colours' },
        { title: 'Review' },
      ]}
    />
  );
}

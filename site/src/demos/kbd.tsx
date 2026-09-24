import { Kbd, KbdGroup } from '@burtson-labs/ui';

export default function KbdDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Open the command bar with{' '}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </p>
  );
}

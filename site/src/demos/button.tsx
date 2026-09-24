import ArrowRight from '@burtson-labs/icons/react/arrow-right';
import Plus from '@burtson-labs/icons/react/plus';
import Settings from '@burtson-labs/icons/react/settings';

import { Button, Spinner } from '@burtson-labs/ui';

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>
        Get started <ArrowRight />
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">
        <Plus /> New agent
      </Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Link</Button>
      <Button size="icon" variant="outline" aria-label="Settings">
        <Settings />
      </Button>
      <Button disabled>
        <Spinner /> Running
      </Button>
    </div>
  );
}

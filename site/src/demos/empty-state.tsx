import Plus from '@burtson-labs/icons/react/plus';
import TruckRoute from '@burtson-labs/icons/react/truck-route';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@burtson-labs/ui';

export default function EmptyStateDemo() {
  return (
    <EmptyState className="w-full max-w-lg">
      <EmptyStateIcon>
        <TruckRoute />
      </EmptyStateIcon>
      <EmptyStateTitle>No loads waiting</EmptyStateTitle>
      <EmptyStateDescription>
        New tenders from email and EDI land here for review. You can also add one by hand.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button>
          <Plus /> New load
        </Button>
        <Button variant="outline">Import CSV</Button>
      </EmptyStateActions>
    </EmptyState>
  );
}

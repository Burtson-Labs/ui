import BookOpen from '@burtson-labs/icons/react/book-open';
import Play from '@burtson-labs/icons/react/play';

import {
  Badge,
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderMain,
  PageHeaderTitle,
} from '@burtson-labs/ui';

export default function PageHeaderDemo() {
  return (
    <PageHeader className="w-full max-w-3xl">
      <PageHeaderMain>
        <PageHeaderEyebrow>Sentinel</PageHeaderEyebrow>
        <PageHeaderTitle>Repository audits</PageHeaderTitle>
        <PageHeaderDescription>
          Secrets, SAST and supply-chain checks across every Burtson Labs repository.
        </PageHeaderDescription>
      </PageHeaderMain>
      <PageHeaderActions>
        <Badge variant="success">14 passing</Badge>
        <Button variant="outline">
          <BookOpen /> Docs
        </Button>
        <Button>
          <Play /> Run audit
        </Button>
      </PageHeaderActions>
    </PageHeader>
  );
}

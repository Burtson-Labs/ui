import * as React from 'react';

import { Pagination } from '@burtson-labs/ui';

export default function PaginationDemo() {
  const [page, setPage] = React.useState(4);
  const pageSize = 25;
  const total = 312;
  const pageCount = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize + 1;
  return (
    <Pagination
      className="w-full max-w-2xl"
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
      summary={`${from}–${Math.min(page * pageSize, total)} of ${total} runs`}
    />
  );
}

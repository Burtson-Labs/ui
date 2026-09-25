import * as React from 'react';

import { Pagination } from '@burtson-labs/ui';

export default function PaginationDemo() {
  // Server paging: the app knows the total and asks for one page at a time.
  const [page, setPage] = React.useState(2);
  const [pageSize, setPageSize] = React.useState(25);
  const total = 312;
  return (
    <Pagination
      className="w-full max-w-2xl"
      page={page}
      pageCount={Math.ceil(total / pageSize)}
      onPageChange={setPage}
      total={total}
      pageSize={pageSize}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
    />
  );
}

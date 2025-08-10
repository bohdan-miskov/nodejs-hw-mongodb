export const calculatePaginationData = ({ count, page, perPage }) => {
  const total = Math.ceil(count / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < total;

  return {
    page,
    perPage,
    totalItems: count,
    totalPages: total,
    hasPreviousPage,
    hasNextPage,
  };
};

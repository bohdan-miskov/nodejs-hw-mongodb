import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);
  if (isKnownOrder) {
    return sortOrder;
  }

  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  const keyOfContacts = [
    '_id',
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
  ];
  if (keyOfContacts.includes(sortBy)) {
    return sortBy;
  }

  return '_id';
};

export const parseSortParams = (query) => {
  const { sortBy, sortOrder } = query;

  const parsedSortBy = parseSortBy(sortBy);
  const parsedSortOrder = parseSortOrder(sortOrder);

  return {
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder,
  };
};

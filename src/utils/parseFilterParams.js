const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) {
    return;
  }

  const isContactType = ['personal', 'home', 'work'].includes(type);
  if (isContactType) {
    return type;
  }
};

const parseBoolean = (isFavourite) => {
  const isString = typeof isFavourite === 'string';
  if (!isString) {
    return;
  }

  const parsedBoolean = isFavourite === 'true';
  return parsedBoolean;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedType = parseContactType(type);
  const parsedIsFavourite = parseBoolean(isFavourite);

  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
};

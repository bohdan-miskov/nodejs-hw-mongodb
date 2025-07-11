import createHttpError from 'http-errors';

const notFoundHandler = (req, res, next) => {
  next(createHttpError.status(404).message('Route not found'));
};

export default notFoundHandler;

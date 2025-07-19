import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    console.log('this');

    await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error) {
    throw createHttpError(400, 'Bad request', { errors: error.details });
  }
};

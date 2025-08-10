import fs from 'node:fs';
import { SWADDER_PATH } from '../constants/index.js';
import swaggerUi from 'swagger-ui-express';
import createHttpError from 'http-errors';

export const swaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWADDER_PATH).toString());
    return [...swaggerUi.serve, swaggerUi.setup(swaggerDoc)];
  } catch (err) {
    return (req, res, next) =>
      next(new createHttpError.InternalServerError("Can't load swagger docs"));
  }
};

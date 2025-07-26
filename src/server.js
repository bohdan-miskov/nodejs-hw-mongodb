import express from 'express';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import pino from 'pino-http';
import contactsRouter from './routers/contacts.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth.js';

export const startServer = () => {
  const PORT = getEnvVar('PORT', 3000);
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, (error) => {
    if (error) {
      console.error(error.message);
    } else {
      console.log(`Server is running on port ${PORT}`);
    }
  });
};

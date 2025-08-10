import mongoose from 'mongoose';
import { initMongoDB } from './db/initMongoDB.js';
import { ContactsCollection } from './db/models/contact.js';
import { startServer } from './server.js';

const bootstrap = async () => {
  await initMongoDB();
  startServer();
};

bootstrap();

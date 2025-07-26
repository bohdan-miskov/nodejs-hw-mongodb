import createHttpError from 'http-errors';
import { SessionCollection } from '../db/models/session.js';
import { UserCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw createHttpError(401, 'Please provide Authorization header');
  }

  const [bearer, token] = authHeader.split(' ', 2);
  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Auth header should be of type Bearer');
  }

  const session = await SessionCollection.findOne({ accessToken: token });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntill);
  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }

  const user = await UserCollection.findById(session.userId);
  if (!user) {
    throw new createHttpError.BadRequest('User not found');
  }
  req.user = user;

  next();
};

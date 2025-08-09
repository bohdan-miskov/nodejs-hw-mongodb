import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { UserCollection } from '../db/models/user.js';
import { randomBytes } from 'crypto';
import {
  FIFTEEN_MINUTES,
  ONE_MONTH,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';
import { SessionCollection } from '../db/models/session.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendMail } from '../utils/sendMail.js';
import path from 'path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntill: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntill: new Date(Date.now() + ONE_MONTH),
  };
};

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }
  await SessionCollection.deleteOne({ userId: user._id });
  const sessionData = createSession();
  return await SessionCollection.create({
    ...sessionData,
    userId: user._id,
  });
};

export const logoutUser = (sessionId) => {
  return SessionCollection.deleteOne({ _id: sessionId });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(404, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntill);
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSessionData = createSession();
  await SessionCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  return await SessionCollection.create({
    ...newSessionData,
    userId: session.userId,
  });
};

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw new createHttpError.NotFound('User is not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.hbs',
  );

  const tempalteSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const tempalte = handlebars.compile(tempalteSource);
  const html = tempalte({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });
  try {
    await sendMail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw new createHttpError.InternalServerError(
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ password, token }) => {
  let entries;

  try {
    entries = jwt.verify(token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError')
    ) {
      throw createHttpError.Unauthorized('Token is expired or invalid.');
    }
    throw err;
  }

  const user = await UserCollection.findOne({
    _id: entries.sub,
    email: entries.email,
  });

  if (!user) {
    throw new createHttpError.NotFound('User is not found');
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  await UserCollection.findByIdAndUpdate(user._id, {
    password: encryptedPassword,
  });
};

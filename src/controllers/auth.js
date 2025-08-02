import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(session.refreshTokenValidUntill),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(session.refreshTokenValidUntill),
  });
};

const clearSession = (res) => {
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  return res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    await logoutUser(sessionId);
  }

  clearSession(res);

  res.status(204).send();
};

export const refreshUserController = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const refreshToken = req.cookies.refreshToken;
  const newSession = await refreshUserSession({ sessionId, refreshToken });

  setupSession(res, newSession);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: newSession.accessToken },
  });
};

export const requestResetEmailController = async (req, res) => {
  const { email } = req.body;
  await requestResetToken(email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

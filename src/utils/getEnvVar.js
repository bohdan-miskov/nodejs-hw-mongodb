import 'dotenv/config';

export const getEnvVar = (name, defaultVal) => {
  const value = process.env[name];

  if (value) return value;
  if (defaultVal) return defaultVal;

  throw new Error(`Missing: process.env['${name}'].`);
};

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

export const createSecretToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '24h',
  });
};

export const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

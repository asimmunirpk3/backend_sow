import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/ubuntu/RISE_Backend/.env' });

const JWT_SECRET = process.env.SECRET_KEY;
const JWT_EXPIRES_IN = '10m'; // adjust as needed
console.log("jwt",JWT_SECRET) 
export function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

import jwt from 'jsonwebtoken';
import process from 'process';

const auth = (req, res, next) => {
  try {
    let token =
      req?.headers?.authorization || req?.cookies?.token || req?.body?.token;

    if (!token) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Token not found' });
    }

    // Remove 'Bearer ' prefix if it exists
    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
export default auth;
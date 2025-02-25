import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      res.status(401).json({ message: 'Please provide token' });
    }

    const token = req.headers.authorization.split(' ');
    if (token.length >= 2) {
      const decodedata = jwt.verify(token[1], process.env.JWTPHRASE);
      if (decodedata?.id) {
        req.userId = decodedata?.id;
        req.email = decodedata?.email;
        next();
      } else {
        res.status(401).json({ res: 'error', message: 'invalid token' });
      }
    } else {
      res.status(401).json({ res: 'error', message: 'invalid token' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      res: 'error',
      message: 'error in auth middleware',
    });
  }
};

export default auth;

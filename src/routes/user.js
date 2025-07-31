import express from 'express';
import {
  registerApi,
  loginApi,
  logoutApi,
  getCurrentUserApi,
  userSettigApi,
} from '../controllers/user.js';
import auth from '../middleware/auth.js';
import passport from 'passport';

const router = express.Router();

router.post('/signin', loginApi);
router.post('/register', registerApi);
router.post('/logout', auth, logoutApi);
router.get('/me', auth, getCurrentUserApi);
router.post('/setting', auth, userSettigApi);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard'); 
  }
);

export default router;

import express from 'express';
import {
  registerApi,
  loginApi,
  logoutApi,
  getCurrentUserApi,
  userSettigApi,
} from '../controllers/user.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', loginApi);
router.post('/register', registerApi);
router.post('/logout', auth, logoutApi);
router.get('/me', auth, getCurrentUserApi);
router.post('/setting', auth, userSettigApi);

export default router;

import express from 'express';
import userValidation from '../validation/user.js';
import { signin, register, changePassword } from '../controllers/user.js';

const router = express.Router();

router.post('/signin', userValidation, signin);
router.post('/register', register);
router.post('/changepassword', changePassword);

export default router;

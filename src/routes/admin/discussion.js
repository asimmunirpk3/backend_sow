import express from 'express';
import {
  getAllUsersApi,
  editUserApi,
  deleteUserApi,
} from '../../controllers/discussion.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/admin/discussions/reported', auth, getAllUsersApi);
router.delete('/admin/discussions/:id', auth, editUserApi);
router.put('/admin/discussions/:id', auth, deleteUserApi);

export default router;

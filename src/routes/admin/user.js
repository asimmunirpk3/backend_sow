import express from 'express';
import {
  getAllUsersApi,
  editUserApi,
  deleteUserApi,
  assignRoleApi,
} from '../../controllers/user.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/admin/users', auth, getAllUsersApi);
router.put('/admin/users/:id', auth, editUserApi);
router.delete('/admin/users/:id', auth, deleteUserApi);
router.post('/admin/users/:id/assign-role', auth, assignRoleApi);

export default router;

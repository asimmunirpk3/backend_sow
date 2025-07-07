import express from 'express';
import {
  getAllUsersApi,
  editUserApi,
  deleteUserApi,
  assignRoleApi,

  getAdminDetailsApi,
} from '../../controllers/admin/user.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/all-users', auth, getAllUsersApi);
router.put('/:id', auth, editUserApi);
router.delete('/:id', auth, deleteUserApi);
router.post('/:id/assign-role', auth, assignRoleApi);

// {globall setting}
router.get('/get-admin-details', auth , getAdminDetailsApi)
// router.put('/admin-setting-api', auth , adminSettigApi )

export default router;

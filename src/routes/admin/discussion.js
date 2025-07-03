import express from 'express';
import {
  getReportedDiscussionsApi,
  deleteDiscussionApi,
  moderateDiscussionApi,
} from '../../controllers/admin/discussion.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/reported', auth, getReportedDiscussionsApi);
router.delete('/:id', auth, deleteDiscussionApi);
router.put('/:id', auth, moderateDiscussionApi);

export default router;


// Export with corrected function names to match the routes
// export { getReportedDiscussionsApi as getAllUsersApi };
// export { deleteDiscussionApi as editUserApi };
// export { moderateDiscussionApi as deleteUserApi };
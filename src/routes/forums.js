import express from 'express';
import {
 postForumsApi,
 getForumsApibyCourseId
} from '../controllers/forums.js';

const router = express.Router();

router.post('/:courseId/add-forums', postForumsApi);
// In routes/courses.js
router.get('/:courseId/get-forums', getForumsApibyCourseId);
export default router;

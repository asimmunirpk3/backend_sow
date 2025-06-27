import express from 'express';
import {
  courselistingApi,
  getcoursesbyId,
  modulecompleApi,
  studentprogressApi,
  PostDiscussionsApi,
  GetDiscussionCourseApi,
} from '../controllers/courses.js';

const router = express.Router();

router.get('/courses-listing', courselistingApi);
router.get('/course/:id', getcoursesbyId);
router.post('/course/:id/module/:moduleId/complete', modulecompleApi);
router.post('/course/student/progress', studentprogressApi);

router.post('/course/:id/discussions', PostDiscussionsApi);
router.get('/course/:id/discussions', GetDiscussionCourseApi);

export default router;

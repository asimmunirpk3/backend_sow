import express from 'express';
import {
  courselistingApi,
  getcoursesbyId,
  modulecompleApi,
  studentprogressApi,
  CreateDiscussionApi,
  CreatePostApi,
  AddCommentApi,
  ToggleLikeApi,
  GetDiscussionsApi,
  getFeaturedCourses,
  getCourseCategories,
  getStudentDashboard
} from '../controllers/courses.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/courses-listing', courselistingApi);
router.get('/course/:id', getcoursesbyId);
router.post('/course/:id/module/:moduleId/complete', modulecompleApi);
router.post('/course/student/progress', studentprogressApi);
// {discussion api}
router.post('/course/:id/discussions', auth, CreateDiscussionApi);
router.post('/discussions/:discussionId/posts',auth, CreatePostApi)
router.post('/discussions/:discussionId/comments', auth, AddCommentApi);
router.put('/discussions/:discussionId/posts/:postId/like', auth, ToggleLikeApi)
router.get('/api/courses/:id/discussions', GetDiscussionsApi)
// {discussion api}
router.get('/top-courses', getFeaturedCourses);
router.get('/course-categories', getCourseCategories);
router.get('/student/dashboard', auth, getStudentDashboard);

export default router;

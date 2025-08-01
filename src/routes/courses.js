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
  getStudentDashboard,
  EnrolledtoCourseApi,
  OverallSerachApi,
  OverallInsertApi,
  OverallCurateApi
} from '../controllers/courses.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/courses-listing', courselistingApi);
router.get('/course/:id', getcoursesbyId);
router.post('/course/:id/module/:moduleId/complete', modulecompleApi);
router.post('/course/student/progress', studentprogressApi);

router.post('/course/student/enrollment', auth, EnrolledtoCourseApi)
// {discussion api}
router.post('/course/:id/discussions', auth, CreateDiscussionApi);
router.post('/discussions/:discussionId/posts',auth, CreatePostApi)
router.post('/discussions/:discussionId/comments', auth, AddCommentApi);
router.put('/discussions/:discussionId/posts/:postId/like', auth, ToggleLikeApi)
router.get('/api/courses/:id/discussions', GetDiscussionsApi)
// {discussion api}
router.get('/top-courses', getFeaturedCourses);
// router.get('/course-categories', getCourseCategories);

router.get('/student/dashboard', auth, getStudentDashboard);
router.post('/search', OverallSerachApi)
router.post('/insert', OverallInsertApi)
router.post('/curate' , OverallCurateApi)



export default router;

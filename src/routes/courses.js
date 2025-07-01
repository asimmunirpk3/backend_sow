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
} from '../controllers/courses.js';

const router = express.Router();

router.get('/courses-listing', courselistingApi);
router.get('/course/:id', getcoursesbyId);
router.post('/course/:id/module/:moduleId/complete', modulecompleApi);
router.post('/course/student/progress', studentprogressApi);

router.post('/course/:id/discussions', CreateDiscussionApi);
router.post('/discussions/:discussionId/posts',CreatePostApi)
router.post('/discussions/:discussionId/comments', AddCommentApi);
router.put('/discussions/:discussionId/posts/:postId/like', ToggleLikeApi)
router.get('/api/courses/:id/discussions', GetDiscussionsApi)


export default router;

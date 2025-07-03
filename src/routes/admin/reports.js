import express from 'express';
import {
  getEnrollmentsApi,
  coursePerformanceApi,
} from '../../controllers/admin/reports.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/enrollments', auth, getEnrollmentsApi);
router.get('/course-performance', auth, coursePerformanceApi);

export default router;

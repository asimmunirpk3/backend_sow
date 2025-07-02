import express from 'express';
import {
  getEnrollmentsApi,
  coursePerformanceApi,
} from '../../controllers/reports.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/admin/reports/enrollments', auth, getEnrollmentsApi);
router.get('/admin/reports/course-performance', auth, coursePerformanceApi);

export default router;

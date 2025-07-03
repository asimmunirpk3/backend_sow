import express from 'express';
import {
    getAllCoursesApi,
    getCoursebyIdApi,
    deleteCourseApi,
    editCourseApi,
    addCourseCategoriesApi,
    getCourseCategoriesApi
} from '../../controllers/admin/course.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/courses',auth, getAllCoursesApi);
router.get('/courses/:id', auth, getCoursebyIdApi);
router.put('/courses/:id', auth, editCourseApi);
router.delete('/courses/:id', auth, deleteCourseApi);
router.post('/course-categories' ,auth, addCourseCategoriesApi)
router.get('/course-categories',auth, getCourseCategoriesApi )

export default router;

import express from 'express';
import {
    getAllCoursesApi,
    getCoursebyIdApi,
    deleteCourseApi,
    editCourseApi,
    addCourseCategoriesApi,
    getCourseCategoriesApi
} from '../../controllers/course.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/admin/courses',auth, getAllCoursesApi);
router.get('/admin/courses/:id', auth, getCoursebyIdApi);
router.put('/admin/courses/:id', auth, editCourseApi);
router.delete('/admin/courses/:id', auth, deleteCourseApi);
router.post('/admin/course-categories' ,auth, addCourseCategoriesApi)
router.get('/admin/course-categories',auth, getCourseCategoriesApi )

export default router;

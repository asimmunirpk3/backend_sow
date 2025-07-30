import express from 'express';
import { CourseCategoryModel } from '../../models/courseCategory.js';
import {
    getAllCoursesApi,
    getCoursebyIdApi,
    deleteCourseApi,
    editCourseApi,
    addCourseCategoriesApi,
    getCourseCategoriesApi
} from '../../controllers/admin/course.js';
import auth from '../../middleware/auth.js';

const PREDEFINED_CATEGORIES = [
    'Technology & Data',
    'Business & Finance',
    'Health & Medicine',
    'Lifestyle & Skills',
    'Science & Engineering',
    'Arts & Humanities',
    'Law & Government',
    'Other'
];

const router = express.Router();

router.get('/courses', auth, getAllCoursesApi);
router.get('/courses/:id', auth, getCoursebyIdApi);
router.put('/courses/:id', auth, editCourseApi);
router.delete('/courses/:id', auth, deleteCourseApi);
router.post('/seed-categories', async (req, res) => {
    try {
        for (const categoryName of PREDEFINED_CATEGORIES) {
            const exists = await CourseCategoryModel.findOne({ name: categoryName });
            if (!exists) {
                await CourseCategoryModel.create({ name: categoryName });
            }
        }
        res.status(200).json({ message: 'Categories seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding categories', error });
    }
});
router.get('/course-categories', auth, getCourseCategoriesApi)
router.post('/course-categories', auth, addCourseCategoriesApi)

export default router;

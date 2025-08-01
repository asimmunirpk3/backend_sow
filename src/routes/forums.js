import express from 'express';
import {
 postForumsApi,
 getForumsApi
} from '../controllers/forums.js';

const router = express.Router();

router.post('/add-forums', postForumsApi);
// In routes/courses.js
router.get('/get-forums', getForumsApi);
export default router;

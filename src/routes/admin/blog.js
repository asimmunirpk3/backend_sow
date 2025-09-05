// routes/blogs.js
import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
  getFeaturedBlogs,
  searchBlogs,
  getBlogsByAuthor,
  getBlogsByCategory
} from '../../controllers/admin/blog.js';
import { upload } from '../../middleware/multer.js';


const router = express.Router();

// Blog routes
router.get('/stats', getBlogStats);
router.get('/featured', getFeaturedBlogs);
router.get('/search', searchBlogs);
router.get('/author/:author', getBlogsByAuthor);
router.get('/category/:category', getBlogsByCategory);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', upload.single("featuredImage") ,createBlog);
router.put('/:id', upload.single("featuredImage"), updateBlog);
router.delete('/:id', deleteBlog);

export default router;
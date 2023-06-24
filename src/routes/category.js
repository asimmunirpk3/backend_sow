import express from "express";
import { getAllCategories,addCategory,getCategoryById,updateCategory,deleteCategory } from "../controllers/category.js"
import categoryValidation from "../validation/category.js"
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/getallcagories", auth, getAllCategories);
router.get("/getcategory/:id", auth, getCategoryById);
router.post('/addcategory',categoryValidation,  auth, addCategory);
router.post('/updatecategory/:id', categoryValidation,auth, updateCategory);
router.post('/deletecategory/:id', auth, deleteCategory);

export default router;

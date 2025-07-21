import { CourseCategoryModel } from '../../models/courseCategory.js';
import { courseModel } from '../../models/courses.js';

// Get all courses
export const getAllCoursesApi = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { course_master_title: { $regex: search, $options: 'i' } },
        { course_master_description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await courseModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await courseModel.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// Get course by ID
export const getCoursebyIdApi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await courseModel.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// Edit course
export const editCourseApi = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await courseModel.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const updatedCourse = await courseModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// Delete course
export const deleteCourseApi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await courseModel.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    await courseModel.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// Add course category
export const addCourseCategoriesApi = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    const existingCategory = await CourseCategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }
    
    const category = new CourseCategoryModel({
      name,
      description
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Course category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course category',
      error: error.message
    });
  }
};

// Get course categories
export const getCourseCategoriesApi = async (req, res) => {
  try {
    const categories = await CourseCategoryModel.find({}).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course categories',
      error: error.message
    });
  }
};
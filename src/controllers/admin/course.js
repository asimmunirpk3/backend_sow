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

// Add course category to an existing course
export const addCourseCategoriesApi = async (req, res) => {
  try {
    const { course_master_Id, course_category_id } = req.body;

    const category = await CourseCategoryModel.findById(course_category_id);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const course = await courseModel.findById(course_master_Id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.course_category = course_category_id;
    course.course_name = category.name
    await course.save();

    res.status(200).json({
      message: 'Course category updated successfully',
      updatedCourse: course,
    });
  } catch (error) {
    console.error('Error updating course category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating course category',
      error: error.message,
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


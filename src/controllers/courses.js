import { courseModel } from "../models/courses.js";
import { DiscussionModel } from "../models/discussions.js";

 export const courselistingApi = async (req, res) => {
  try {
    const { category , keyword } = req.query;
    let query = {};
    
    if (keyword) {
      query.$or = [
        { course_master_title: { $regex: keyword, $options: 'i' } },
        { course_master_description: { $regex: keyword, $options: 'i' } },
        { chat_input: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.chat_input = { $regex: category, $options: 'i' };
    }
    
    const courses = await courseModel.find(query);
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

export const getcoursesbyId = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course details',
      error: error.message
    });
  }
};

export const modulecompleApi = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { userId, username, progress = 100 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const masterCourse = await courseModel.findById(id);
    if (!masterCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let moduleIndex = -1;
    let targetModule = null;

    for (let i = 0; i < masterCourse.courses.length; i++) {
      if (masterCourse.courses[i].row_number == moduleId) {
        moduleIndex = i;
        targetModule = masterCourse.courses[i];
        break;
      }
    }

    if (moduleIndex === -1 && !isNaN(moduleId) && moduleId >= 0 && moduleId < masterCourse.courses.length) {
      moduleIndex = parseInt(moduleId);
      targetModule = masterCourse.courses[moduleIndex];
    }

    if (!targetModule) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    if (!targetModule.completed_by) {
      targetModule.completed_by = [];
    }

    const existingCompletion = targetModule.completed_by.find(
      completion => completion.userId === userId
    );

    if (existingCompletion) {
      existingCompletion.completed_at = new Date();
      existingCompletion.progress = progress;
      existingCompletion.username = username || existingCompletion.username;
    } else {
      targetModule.completed_by.push({
        userId,
        username: username || 'Unknown User',
        completed_at: new Date(),
        progress
      });
    }

    targetModule.is_completed = progress >= 100;

    const updateQuery = {};
    updateQuery[`courses.${moduleIndex}.completed_by`] = targetModule.completed_by;
    updateQuery[`courses.${moduleIndex}.is_completed`] = targetModule.is_completed;

    const updatedCourse = await courseModel.findByIdAndUpdate(
      id,
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update course'
      });
    }

    const totalModules = updatedCourse.courses.length;
    const completedModules = updatedCourse.courses.filter(course => course.is_completed).length;
    const overallProgress = Math.round((completedModules / totalModules) * 100);

    res.json({
      success: true,
      message: 'Module marked as complete',
      data: {
        module: updatedCourse.courses[moduleIndex],
        completion_info: {
          user_id: userId,
          username: username || 'Unknown User',
          completed_at: new Date(),
          progress: progress
        },
        course_progress: {
          completed_modules: completedModules,
          total_modules: totalModules,
          overall_progress: overallProgress
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking module as complete',
      error: error.message
    });
  }
};

export const studentprogressApi =  async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const moduleProgress = course.courses.map((module, index) => {
      const userCompletion = module.completed_by?.find(
        completion => completion.userId === userId
      );

      return {
        module_index: index,
        row_number: module.row_number,
        course_title: module.course_title,
        is_completed: userCompletion ? userCompletion.progress >= 100 : false,
        progress: userCompletion ? userCompletion.progress : 0,
        completed_at: userCompletion ? userCompletion.completed_at : null
      };
    });

    const completedModules = moduleProgress.filter(m => m.is_completed).length;
    const totalModules = moduleProgress.length;
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    res.json({
      success: true,
      data: {
        course_id: courseId,
        course_title: course.course_master_title,
        user_id: userId,
        overall_progress: overallProgress,
        completed_modules: completedModules,
        total_modules: totalModules,
        modules: moduleProgress
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};


export const GetDiscussionCourseApi = async (req, res) => {
  try {
    const discussions = await DiscussionModel.find({ courseId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discussions',
      error: error.message
    });
  }
};

export const PostDiscussionsApi = async (req, res) => {
  try {
    const { userId, username, content, title, description } = req.body;

    let discussion;
    
    if (title && description) {
      discussion = new DiscussionModel({
        courseId: req.params.id,
        title,
        description,
        posts: []
      });
    
    } else {
      discussion = await DiscussionModel.findOne({ courseId: req.params.id });
      
      if (!discussion) {
        discussion = new DiscussionModel({
          courseId: req.params.id,
          title: 'General Discussion',
          description: 'Course discussion forum',
          posts: []
        });
      }
      
      discussion.posts.push({
        userId,
        username,
        content,
        timestamp: new Date()
      });
    }
    
    await discussion.save();

    res.json({
      success: true,
      message: 'Discussion post created successfully',
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating discussion post',
      error: error.message
    });
  }
};


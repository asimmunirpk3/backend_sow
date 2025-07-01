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

// POST - Create a new discussion topic
export const CreateDiscussionApi = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.id; // Assuming you have auth middleware

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const discussion = new DiscussionModel({
      courseId,
      title: title.trim(),
      description: description.trim(),
      createdBy: userId,
      posts: []
    });

    await discussion.save();

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating discussion',
      error: error.message
    });
  }
};

// POST - Create a new post in a discussion
export const CreatePostApi = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username || req.user?.name; // Adjust based on your user model

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username not found in user profile'
      });
    }

    // Check if discussion exists
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Create new post object
    const newPost = {
      userId,
      username,
      content: content.trim(),
      timestamp: new Date(),
      likes: 0,
      likedBy: [],
      replies: []
    };

    // Add post to discussion
    discussion.posts.push(newPost);
    await discussion.save();

    // Get the created post (last item in the array)
    const createdPost = discussion.posts[discussion.posts.length - 1];

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        discussionId: discussion._id,
        post: createdPost
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// POST - Add a comment/post to a discussion
export const AddCommentApi = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const username = req.user?.username;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const discussion = await DiscussionModel.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const newPost = {
      userId,
      username,
      content: content.trim(),
      timestamp: new Date(),
      likes: 0,
      likedBy: []
    };

    discussion.posts.push(newPost);
    await discussion.save();

    // Return the newly created post
    const createdPost = discussion.posts[discussion.posts.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: createdPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// PUT - Like/Unlike a post
export const ToggleLikeApi = async (req, res) => {
  try {
    const { discussionId, postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const discussion = await DiscussionModel.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const post = discussion.posts.id(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasLiked = post.likedBy.includes(userId);
    
    if (hasLiked) {
      // Unlike
      post.likedBy.pull(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await discussion.save();

    res.json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      data: {
        postId,
        likes: post.likes,
        hasLiked: !hasLiked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// GET - Fetch all discussions for a course
export const GetDiscussionsApi = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const discussions = await DiscussionModel.find({ courseId })
      .populate('posts.userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await DiscussionModel.countDocuments({ courseId })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discussions',
      error: error.message
    });
  }
};



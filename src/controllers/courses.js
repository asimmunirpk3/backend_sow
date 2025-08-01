import { courseModel } from "../models/courses.js";
import { DiscussionModel } from "../models/discussions.js";
import { userModel } from "../models/user.js";
import axios from 'axios'

export const courselistingApi = async (req, res) => {
  try {
    const { category, keyword } = req.query;
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

export const studentprogressApi = async (req, res) => {
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

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    const user = await userModel.findOne({ _id: userId })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'user not found'
      });
    }

    if (!user.firstName) {
      return res.status(400).json({
        success: false,
        message: 'Username not found in user profile'
      });
    }

    const firstName = user?.firstName
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
      firstName,
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
// Corrected API - Add reply to a specific post
export const AddCommentApi = async (req, res) => {
  try {
    const { discussionId } = req.params; // Need postId to specify which post to reply to
    const { content, postId } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const firstName = user?.firstName;

    // Find the discussion
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Find the specific post within the discussion
    const post = discussion.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newReply = {
      userId,
      firstName,
      content: content.trim(),
      timestamp: new Date()
    };

    // Add reply to the specific post
    post.replies.push(newReply);
    await discussion.save();

    // Return the newly created reply
    const createdReply = post.replies[post.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: createdReply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Alternative: If you want to add a new POST (not a reply), use this
export const AddPostApi = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const firstName = user?.firstName;

    // Find the discussion
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const newPost = {
      userId,
      firstName,
      content: content.trim(),
      timestamp: new Date(),
      likes: 0,
      likedBy: [],
      replies: []
    };

    // Add new post to the discussion
    discussion.posts.push(newPost);
    await discussion.save();

    // Return the newly created post
    const createdPost = discussion.posts[discussion.posts.length - 1];

    res.status(201).json({
      success: true,
      message: 'Post added successfully',
      data: createdPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding post',
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

// GET /api/courses/featured
export const getFeaturedCourses = async (req, res) => {
  try {
    const featuredCourses = await courseModel.aggregate([
      {
        $addFields: {
          // Count total courses in the array
          totalCourses: {
            $size: { $ifNull: ["$courses", []] }
          },
          // Count approved courses
          approvedCourses: {
            $size: {
              $filter: {
                input: { $ifNull: ["$courses", []] },
                cond: { $eq: ["$$this.status", "approved"] }
              }
            }
          },
          // Calculate approval rate as a metric for course quality
          approvalRate: {
            $cond: {
              if: { $eq: [{ $size: { $ifNull: ["$courses", []] } }, 0] },
              then: 0,
              else: {
                $divide: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$courses", []] },
                        cond: { $eq: ["$$this.status", "approved"] }
                      }
                    }
                  },
                  { $size: { $ifNull: ["$courses", []] } }
                ]
              }
            }
          }
        }
      },
      {
        $sort: {
          approvedCourses: -1,  // Sort by number of approved courses
          totalCourses: -1,     // Then by total courses
          approvalRate: -1      // Then by approval rate
        }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 1,
          course_master_title: 1,
          course_master_description: 1,
          course_objectives: 1,
          totalCourses: 1,
          approvedCourses: 1,
          approvalRate: 1,
          // Show first 3 courses as preview
          courses: {
            $slice: [
              {
                $map: {
                  input: { $ifNull: ["$courses", []] },
                  as: "course",
                  in: {
                    course_title: "$$course.course_title",
                    course_link: "$$course.course_link",
                    status: "$$course.status",
                    course_description: "$$course.course_description"
                  }
                }
              },
              3
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: featuredCourses,
      message: 'Featured courses retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    console.log("userId", userId)

    const enrolledCourses = await courseModel.aggregate([
      {
        $match: {
          "enrolled_users.userId": userId
        }
      },
      {
        $addFields: {
          enrolledCoursesOnly: {
            $map: {
              input: "$courses",
              as: "course",
              in: {
                $mergeObjects: [
                  "$$course",
                  {
                    userCompletionData: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$$course.completed_by",
                            as: "progress",
                            cond: { $eq: ["$$progress.userId", userId] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          course_master_title: 1,
          course_master_description: 1,
          course_objectives: 1,
          enrolledCourses: "$enrolledCoursesOnly"
        }
      }
    ]);

    // Summarize metrics
    let totalCourses = 0;
    let completedCourses = 0;
    let totalProgress = 0;
    const recentActivity = [];

    enrolledCourses.forEach(courseMaster => {
      courseMaster.enrolledCourses.forEach(course => {
        totalCourses++;
        const userData = course.userCompletionData;

        if (userData) {
          totalProgress += userData.progress || 0;
          if (userData.progress === 100) completedCourses++;

          recentActivity.push({
            courseMasterTitle: courseMaster.course_master_title,
            courseTitle: course.course_title,
            progress: userData.progress,
            lastActivity: userData.completed_at,
            isCompleted: userData.progress === 100
          });
        }
      });
    });

    // Sort by most recent activity
    recentActivity.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    // Discussion activity
    const discussionActivity = await DiscussionModel.aggregate([
      {
        $match: {
          $or: [
            { createdBy: userId },
            { "posts.userId": userId }
          ]
        }
      },
      {
        $project: {
          title: 1,
          courseId: 1,
          userPosts: {
            $filter: {
              input: "$posts",
              as: "post",
              cond: { $eq: ["$$post.userId", userId] }
            }
          },
          isCreator: { $eq: ["$createdBy", userId] }
        }
      },
      {
        $limit: 5
      }
    ]);

    const dashboardData = {
      user: {
        userId: userId,
        totalEnrolledCourses: totalCourses,
        completedCourses: completedCourses,
        overallProgress: totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0,
        completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
      },
      enrolledCourses,
      recentActivity: recentActivity.slice(0, 10),
      discussionActivity,
      metrics: {
        coursesInProgress: totalCourses - completedCourses,
        averageProgress: totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0,
        discussionsParticipated: discussionActivity.length
      }
    };

    return res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Student dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
;

export const EnrolledtoCourseApi = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("userID", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
    }

    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const course = await courseModel.findById(courseId);
    console.log("course 1007", course)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.enrolled_users) course.enrolled_users = [];

    const alreadyEnrolled = course.enrolled_users.some(
      (user) => user.userId === userId
    );
    console.log("already entrolled 1016", alreadyEnrolled)
    if (alreadyEnrolled) {
      return res.status(200).json({ message: 'User already enrolled' });
    }

    course.enrolled_users.push({
      userId,
      enrolled_at: new Date(),
    });

    await course.save();

    // ✅ Send success response
    return res.status(200).json({
      success: true,
      message: 'User enrolled to course successfully',
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const OverallSerachApi = async (req, res) => {
  try {
    const { search } = req.body;
    console.log("search", search);
    if (!search) {
      return res.status(400).json({ error: 'Search is Required' });
    }

    const aiApiResponse = await axios.post(
      "https://chicagou.app.n8n.cloud/webhook/search",
      { search },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000, // optional: 10 second timeout
      }
    );

    console.log("aiApiResponse", aiApiResponse.data);

    return res.status(200).json(aiApiResponse.data);

  } catch (error) {
    console.error("Error in OverallSerachApi:", error?.message || error);

    // Axios-specific handling
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        error: error.response.data || 'Upstream API error',
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({
        error: 'No response from upstream service',
      });
    } else {
      // Something else caused the error
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
};

export const OverallInsertApi = async (req, res) => {
  try {


    const aiApiResponse = await axios.post(
      "https://chicagou.app.n8n.cloud/webhook/insert",

      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000, // optional: 10 second timeout
      }
    );
    return res.status(200).json(aiApiResponse.data);

  } catch (error) {
    console.error("Error in OverallInsertApi:", error?.message || error);

    // Axios-specific handling
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        error: error.response.data || 'Upstream API error',
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({
        error: 'No response from upstream service',
      });
    } else {
      // Something else caused the error
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
};

export const OverallCurateApi = async (req, res) => {
  try {
    const { course } = req.body;
    console.log("course", course);
    if (!course) {
      return res.status(400).json({ error: 'Search is Required' });
    }


    const aiApiResponse = await axios.post(
      "https://chicagou.app.n8n.cloud/webhook/curate",
      { course },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000, // optional: 10 second timeout
      }
    );
    return res.status(200).json(aiApiResponse.data);

  } catch (error) {
    console.error("Error in OverallInsertApi:", error?.message || error);

    // Axios-specific handling
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        error: error.response.data || 'Upstream API error',
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({
        error: 'No response from upstream service',
      });
    } else {
      // Something else caused the error
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
};

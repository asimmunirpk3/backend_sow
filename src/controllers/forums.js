import { ForumModel } from "../models/forum.js";

export const postForumsApi = async (req, res) => {
    try {
        const { title, description, category, userId  } = req.body;

        const newForum = new ForumModel({
            title,
            description,
            category: category || 'General',
            createdBy: { userId },
            posts: []
        });

        const savedForum = await newForum.save();

        res.status(201).json({
            success: true,
            message: 'Forum topic created successfully',
            data: savedForum
        });

    } catch (error) {
        console.error('Error creating forum:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create forum topic',
            error: error.message
        });
    }
};


 export const getForumsApi= async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;

    // Build query
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    // Get forums with pagination
    const forums = await ForumModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const totalForums = await ForumModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: forums,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalForums / limit),
        totalForums,
        hasNext: page < Math.ceil(totalForums / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forums',
      error: error.message
    });
  }
};


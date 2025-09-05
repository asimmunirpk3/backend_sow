import Blog from "../../models/Blog.js";

const baseUrl = process.env.BASE_URL

export const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.author) filter.author = new RegExp(req.query.author, 'i');
        if (req.query.search) {
            filter.$or = [
                { title: new RegExp(req.query.search, 'i') },
                { content: new RegExp(req.query.search, 'i') }
            ];
        }

        const blogs = await Blog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBlogs: total,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Increment view count
        blog.viewCount += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
};

export const createBlog = async (req, res) => {
    console.log("formData", req.body)
    try {
        const {
            title,
            content,
            author,
            category,
            tags,
            status
        } = req.body;

        // Validation
        if (!title || !content || !author) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and author are required'
            });
        }

        const newBlog = new Blog({
            title,
            content,
            author,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            featuredImage: req.file ? `${baseUrl}/uploads/blogs/${req.file.filename}` : null,
        });

        const savedBlog = await newBlog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: savedBlog
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const {
            title,
            content,
            author,
            category,
            tags,
            featuredImage,
            status
        } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (author) updateData.author = author;
        if (category) updateData.category = category;
        if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
        if (featuredImage) updateData.featuredImage = featuredImage;
        if (status) updateData.status = status;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            data: updatedBlog
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully',
            data: deletedBlog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
};

export const getBlogStats = async (req, res) => {
    try {
        const totalBlogs = await blogModel.countDocuments();
        const publishedBlogs = await blogModel.countDocuments({ status: 'published' });
        const draftBlogs = await blogModel.countDocuments({ status: 'draft' });
        const totalViews = await blogModel.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
        ]);

        // Get top categories
        const topCategories = await blogModel.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Get recent blogs
        const recentBlogs = await blogModel.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title author createdAt viewCount');

        res.status(200).json({
            success: true,
            data: {
                totalBlogs,
                publishedBlogs,
                draftBlogs,
                totalViews: totalViews[0]?.totalViews || 0,
                topCategories,
                recentBlogs
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blog statistics',
            error: error.message
        });
    }
};

export const getFeaturedBlogs = async (req, res) => {
    try {
        const featuredBlogs = await blogModel.aggregate([
            {
                $match: { status: 'published' }
            },
            {
                $sort: {
                    viewCount: -1,
                    createdAt: -1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: { $substr: ["$content", 0, 200] }, // First 200 chars as excerpt
                    author: 1,
                    category: 1,
                    tags: 1,
                    featuredImage: 1,
                    readTime: 1,
                    viewCount: 1,
                    createdAt: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: featuredBlogs,
            message: 'Featured blogs retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching featured blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const searchBlogs = async (req, res) => {
    try {
        const { keyword, category } = req.query;
        let query = { status: 'published' };

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
                { author: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } }
            ];
        }

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        const blogs = await blogModel.find(query)
            .sort({ createdAt: -1 })
            .select('title content author category tags featuredImage readTime viewCount createdAt');

        res.json({
            success: true,
            data: blogs,
            count: blogs.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching blogs',
            error: error.message
        });
    }
};

export const getBlogsByAuthor = async (req, res) => {
    try {
        const { author } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const blogs = await blogModel.find({
            author: new RegExp(author, 'i'),
            status: 'published'
        })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await blogModel.countDocuments({
            author: new RegExp(author, 'i'),
            status: 'published'
        });

        res.json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalBlogs: total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs by author',
            error: error.message
        });
    }
};

export const getBlogsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const blogs = await blogModel.find({
            category: new RegExp(category, 'i'),
            status: 'published'
        })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await blogModel.countDocuments({
            category: new RegExp(category, 'i'),
            status: 'published'
        });

        res.json({
            success: true,
            data: {
                blogs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalBlogs: total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs by category',
            error: error.message
        });
    }
};


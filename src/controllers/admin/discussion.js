import { DiscussionModel } from '../../models/discussions.js';
import mongoose from 'mongoose';

// Get reported discussions
export const getReportedDiscussionsApi = async (req, res) => {
    try {
        const { page = 1, limit = 10, courseId } = req.query;
        console.log("courseID", courseId)
        let query = {};
        if (courseId) {
            query.courseId = courseId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const discussions = await DiscussionModel
            .find(query)
            .populate('courseId', 'course_master_title')
            .populate('createdBy', 'firstName lastName email')
            .populate('posts.userId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalDiscussions = await DiscussionModel.countDocuments(query);
        const totalPages = Math.ceil(totalDiscussions / parseInt(limit));

        // Transform data to highlight potentially problematic content
        const reportedDiscussions = discussions.map(discussion => {
            const problematicPosts = discussion.posts.filter(post => {
                console.log("post", post?.content)
                // Simple content filtering - in reality, you'd use more sophisticated methods
                const flagWords = ["spam", "inapporiate" , "notlike"]
                return flagWords.some(word =>
                    post?.content?.includes(word?.toLowerCase())
                );

            });

            return {
                _id: discussion._id,
                courseId: discussion.courseId,
                title: discussion.title,
                description: discussion.description,
                createdBy: discussion.createdBy,
                createdAt: discussion.createdAt,
                totalPosts: discussion.posts.length,
                problematicPostsCount: problematicPosts.length,
                problematicPosts: problematicPosts.map(post => ({
                    _id: post._id,
                    userId: post.userId,
                    firstName: post.firstName,
                    content: post.content,
                    timestamp: post.timestamp,
                    likes: post.likes,
                    repliesCount: post.replies.length
                })),
                reportScore: problematicPosts.length // Simple scoring system
            };
        });

        res.status(200).json({
            success: true,
            data: reportedDiscussions,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalDiscussions,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reported discussions',
            error: error.message
        });
    }
};

// Delete discussion
export const deleteDiscussionApi = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discussion ID'
            });
        }

        // Check if discussion exists
        const discussion = await DiscussionModel.findById(id);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: 'Discussion not found'
            });
        }

        // Delete the discussion
        await DiscussionModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Discussion deleted successfully',
            data: {
                deletedDiscussion: {
                    _id: discussion._id,
                    title: discussion.title,
                    courseId: discussion.courseId
                },
                reason: reason || 'No reason provided'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting discussion',
            error: error.message
        });
    }
};

// Moderate discussion (hide/show, lock/unlock)
export const moderateDiscussionApi = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // action: 'hide', 'show', 'lock', 'unlock'

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discussion ID'
            });
        }

        if (!['hide', 'show', 'lock', 'unlock'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be one of: hide, show, lock, unlock'
            });
        }

        // Check if discussion exists
        const discussion = await DiscussionModel.findById(id);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: 'Discussion not found'
            });
        }

        // Update discussion based on action
        let updateData = {};

        switch (action) {
            case 'hide':
                updateData.hidden = true;
                updateData.hiddenReason = reason;
                updateData.hiddenAt = new Date();
                break;
            case 'show':
                updateData.hidden = false;
                updateData.$unset = { hiddenReason: 1, hiddenAt: 1 };
                break;
            case 'lock':
                updateData.locked = true;
                updateData.lockedReason = reason;
                updateData.lockedAt = new Date();
                break;
            case 'unlock':
                updateData.locked = false;
                updateData.$unset = { lockedReason: 1, lockedAt: 1 };
                break;
        }

        const updatedDiscussion = await DiscussionModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('courseId', 'course_master_title')
            .populate('createdBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: `Discussion ${action}ed successfully`,
            data: {
                discussion: updatedDiscussion,
                action,
                reason: reason || 'No reason provided'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error moderating discussion',
            error: error.message
        });
    }
};

// Delete specific post from discussion
export const deletePostFromDiscussionApi = async (req, res) => {
    try {
        const { discussionId, postId } = req.params;
        const { reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discussion or post ID'
            });
        }

        // Find and update the discussion by removing the specific post
        const discussion = await DiscussionModel.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: 'Discussion not found'
            });
        }

        const postIndex = discussion.posts.findIndex(post => post._id.toString() === postId);
        if (postIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Post not found in discussion'
            });
        }

        const deletedPost = discussion.posts[postIndex];
        discussion.posts.splice(postIndex, 1);
        await discussion.save();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
            data: {
                deletedPost: {
                    _id: deletedPost._id,
                    content: deletedPost.content,
                    userId: deletedPost.userId,
                    timestamp: deletedPost.timestamp
                },
                reason: reason || 'No reason provided'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
            error: error.message
        });
    }
};

// Get discussion statistics
export const getDiscussionStatsApi = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Get basic stats
        const totalDiscussions = await DiscussionModel.countDocuments(dateFilter);
        const discussions = await DiscussionModel.find(dateFilter);

        let totalPosts = 0;
        let totalReplies = 0;
        let totalLikes = 0;

        discussions.forEach(discussion => {
            totalPosts += discussion.posts.length;
            discussion.posts.forEach(post => {
                totalReplies += post.replies.length;
                totalLikes += post.likes;
            });
        });

        // Get most active discussions
        const activeDiscussions = discussions
            .map(discussion => ({
                _id: discussion._id,
                title: discussion.title,
                courseId: discussion.courseId,
                postCount: discussion.posts.length,
                totalLikes: discussion.posts.reduce((sum, post) => sum + post.likes, 0),
                lastActivity: discussion.posts.length > 0 ?
                    Math.max(...discussion.posts.map(post => new Date(post.timestamp))) :
                    discussion.createdAt
            }))
            .sort((a, b) => b.postCount - a.postCount)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalDiscussions,
                    totalPosts,
                    totalReplies,
                    totalLikes,
                    averagePostsPerDiscussion: totalDiscussions > 0 ?
                        Math.round(totalPosts / totalDiscussions) : 0
                },
                activeDiscussions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching discussion statistics',
            error: error.message
        });
    }
};

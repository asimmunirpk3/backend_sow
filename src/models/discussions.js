import mongoose from 'mongoose';

// Discussion Schema
const discussionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: String,
  description: String,
  posts: [{
    userId: String,
    username: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    replies: [{
      userId: String,
      username: String,
      content: String,
      timestamp: { type: Date, default: Date.now }
    }]
  }]
}, { timestamps: true });

export const DiscussionModel = mongoose.model('Discussion', discussionSchema);


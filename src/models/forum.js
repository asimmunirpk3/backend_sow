import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['General', 'Lessons', 'Assignment', 'Discussion'], default: 'General' },
  posts: [
    {
      userId: { type: String, required: true },
      username: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      replies: [
        {
          userId: { type: String, required: true },
          username: { type: String, required: true },
          message: { type: String, required: true },
          timestamp: { type: Date, default: Date.now }
        }
      ]
    }
  ],
  isActive: { type: Boolean, default: true },
  createdBy: {
    userId: { type: String, required: true },
  }
}, {
  timestamps: true
});

export const ForumModel = mongoose.model('Forum', forumSchema);
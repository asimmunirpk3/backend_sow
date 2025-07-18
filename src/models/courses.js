import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    chat_input: String,
    course_master_title: String,
    course_master_description: String,
    course_objectives: [String],
    enrolled_users: [
      {
        userId: String,
        enrolled_at: { type: Date, default: Date.now },
      },
    ],
    courses: [
      {
        row_number: Number,
        chat_input: String,
        course_title: String,
        course_link: String,
        course_description: String,
        status: String,
        completed_by: [
          {
            userId: String,
            username: String,
            completed_at: { type: Date, default: Date.now },
            progress: { type: Number, default: 100 },
          },
        ],
        is_completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: false,
    strict: false,
  }
);

export const courseModel = mongoose.model('Courses', courseSchema);

import mongoose from 'mongoose';

// Course category model (you might need to create this)

const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CourseCategoryModel = mongoose.model('CourseCategory', courseCategorySchema);
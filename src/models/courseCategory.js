import mongoose from 'mongoose';

// Course category model (you might need to create this)

// Import the predefined categories
const PREDEFINED_CATEGORIES = [
  'Technology & Data',
  'Business & Finance',
  'Health & Medicine',
  'Lifestyle & Skills',
  'Science & Engineering',
  'Arts & Humanities',
  'Law & Government',
  'Other'
];


const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: PREDEFINED_CATEGORIES, // Restrict to predefined categories
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const CourseCategoryModel = mongoose.model('CourseCategory', courseCategorySchema);
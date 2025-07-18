import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  profilePicture: {
    type: String,
    default: '',
  },

  googleId: { type: String },
  facebookId: { type: String },
  password: {
    type: String,
    minlength: [8, 'Password must be apt least 8 characters long'],
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  verifyAt: {
    type: Date,
  },
  deletedAt: { type: Date, index: true },
});

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

export const userModel = mongoose.model('User', userSchema);

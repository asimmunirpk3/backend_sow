import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, default: "General" },
  tags: [{ type: String, trim: true }],
  featuredImage: { type: String, default: null },
  readTime: { type: Number, default: 5 },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

blogSchema.pre("save", function (next) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(" ").length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
  next();
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;

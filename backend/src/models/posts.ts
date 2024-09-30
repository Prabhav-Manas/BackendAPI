import mongoose, { Schema } from "mongoose";
import { trim } from "validator";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Post title is required"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    trim: true,
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);

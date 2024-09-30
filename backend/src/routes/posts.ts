import express from "express";
import { protect } from "../middlewares/authMiddleware";
const postController = require("../controllers/posts");

const router = express.Router();

router.post("/create-post", protect, postController.createPost);
router.get("/get-all-posts", protect, postController.getAllPosts);
router.get("/get-post/:id", protect, postController.getSinglePost);
router.patch("/update-post/:id", protect, postController.updatePost);
router.delete("/delete-post/:id", protect, postController.deletedPost);
router.get("/search-filter-post", protect, postController.searchAndFilterPost);

module.exports = router;

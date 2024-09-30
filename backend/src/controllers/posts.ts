import Post from "../models/posts";
import { Request, Response } from "express";

// ---Create New Posts---
exports.createPost = async (req: Request, res: Response) => {
  try {
    // Check if title and content are provided
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({
        status: "failed",
        message: "Fields cannot be empty",
      });
      return;
    }

    //Create new Post
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: (req as any).user._id,
    });

    //Save posts
    const savedPost = await post.save();

    // Send 'success response' & 'handle error'
    res.status(201).json({
      status: "success",
      data: {
        post: savedPost,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "failed!",
      message: {
        error: error.message,
      },
    });
  }
};

// ---Fetch All Posts---
exports.getAllPosts = async (req: Request, res: Response) => {
  try {
    // Get user ID from the authenticated user
    const userId = (req as any).user._id;

    //Extract pagination and sorting parameters from query
    const { sortBy, order, page, limit } = req.query;

    // Pagination Settings
    const pageNumber = parseInt(page as string) || 1; // Default to page 1
    const pageSize = parseInt(limit as string) || 10; // Posts per page is 10

    // Sorting Settings
    const sortField = typeof sortBy === "string" ? sortBy : "createdAt"; //Default sorting by 'createdAt'
    const sortOrder = order === "desc" ? -1 : 1; //Default ascending order

    // Fetch posts by user ID with pagination and sorting and populate the user details
    const posts = await Post.find({ author: userId })
      .populate("author", "name email")
      .sort({ [sortField]: sortOrder }) //Apply Sorting
      .skip((pageNumber - 1) * pageSize) //Skip Documents for pagination
      .limit(pageSize); //Limit number of documents

    //Get total number of posts for the user(for pagination)
    const totalPosts = await Post.countDocuments({ author: userId });

    // Send success response & handle error
    res.status(200).json({
      status: "success",
      totalPost: posts.length,
      data: {
        posts: posts,
        pagination: {
          totalPosts,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalPosts / pageSize),
          pageSize,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "failed!",
      message: {
        error: error.message,
      },
    });
  }
};

// ---Fetch A Single Post---
exports.getSinglePost = async (req: Request, res: Response) => {
  try {
    // Get Post ID from request parameter
    const postId = req.params.id;

    // Fetch the post by ID and populate the user details
    const post = await Post.findById(postId).populate("author", "name email");

    // Check if there is post
    if (!post) {
      res.status(400).json({
        status: "failed!",
        message: "No post found!",
      });
      return;
    }

    // Send success response and handle error
    res.status(200).json({
      status: "success",
      data: {
        post: post,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "failed!",
      message: {
        error: error.message,
      },
    });
  }
};

// ---Update A Post---
exports.updatePost = async (req: Request, res: Response) => {
  try {
    // Get post ID from URL params
    const postId = req.params.id; //Collect post ID

    // Get updated Data from request body
    const { title, content } = req.body;

    // Check if title and content are provided
    if (!title || !content) {
      res.status(400).json({
        status: "failed!",
        message: "At least one field must be provided to update",
      });
      return;
    }

    // Find the post by ID and update it
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        content,
      },
      { new: true }
    );

    if (!updatedPost) {
      res.status(404).json({
        status: "failed!",
        message: "No post found",
      });
      return;
    }

    await updatedPost.save();

    // Send success response and handle error
    res.status(200).json({
      status: "success",
      data: {
        updatedPost: updatedPost,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "failed!",
      message: {
        error: error.message,
      },
    });
  }
};

// ---Delete Post---
exports.deletedPost = async (req: Request, res: Response) => {
  try {
    //Get post ID from URL params
    const postId = req.params.id;

    // Find post by ID and Delete it
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      res.status(400).json({
        status: "failed!",
        message: "No post found to delete",
      });
      return;
    }

    // Send success response and handle error
    res.status(200).json({
      status: "success",
      message: "Post deleted!",
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "failed!",
      message: {
        error: error.message,
      },
    });
  }
};

// ---Search and Filter Posts
exports.searchAndFilterPost = async (req: Request, res: Response) => {
  try {
    // Get search parameter from the query string
    const { title, author, date } = req.query;

    // Create the filter object and ensure filter includes author
    const filter: any = { author: (req as any).user._id };

    // Add condition based on user-defined parameters
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // i is for case-insensitive for title search
    }

    if (author) {
      filter.author = author; //Filter by author ID provided
    }

    if (date) {
      filter.date = { $gte: new Date(date as string) }; // Filter by date, assuming you want posts from this date onward
    }

    // Fetch the post based on filter and populate it with user details
    const posts = await Post.find(filter).populate("author", "name email");

    // Send success response and handle error
    res.status(200).json({
      status: "success",
      data: {
        posts: posts,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "failed",
      message: {
        error: error.message,
      },
    });
  }
};

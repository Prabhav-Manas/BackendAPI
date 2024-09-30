const User = require("../models/user");
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email";

// ---SignUp---
exports.createUser = async (req: Request, res: Response) => {
  try {
    // Check if req.body is null or undefined
    if (!req.body || !req.body.password || !req.body.confirmPassword) {
      res.status(400).json({
        status: "failed!",
        message: "Invalid request data",
      });
      return;
    }

    // Check if password & confirmPassword matches
    if (req.body.password !== req.body.confirmPassword) {
      res.status(400).json({
        status: "failed!",
        message: "Password & confirmPassword do not match",
      });
      return;
    }

    // Hash Password using bcrypt @types/bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // Create a New User
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save User
    const savedUser = await user.save();

    // Generate Email Verificaion
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Send Verification Email
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/verify-email/${token}`;

    await sendEmail(
      savedUser.email,
      "Verify Your Email",
      `Click this link to verify your email: ${verificationUrl}`
    );

    // Send 'success response' or 'handle error'
    res.status(201).json({
      status: "success",
      message: "User created. Please verify your email",
      data: {
        user: savedUser,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: "failed",
      message: {
        error: error.message,
      },
    });
  }
};

// ---Email Verification---
exports.verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = (decoded as any).id;

    // Update User Verification Status
    const user = await User.findById(userId);
    if (!user) {
      res.status(400).json({
        status: "failed!",
        message: "Invalid token",
      });
      return;
    }

    user.isVerified = true;
    await user.save();

    // Send success response and handle error
    res.status(200).json({
      status: "success",
      message: "Email successfully verified",
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "failed!",
      message: {
        error: error.message,
      },
    });
  }
};

// ---LogIn---
exports.logInUser = async (req: Request, res: Response) => {
  try {
    // Check if req.body is valid
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: "failed!",
        message: "Email and Password are required",
      });
      return;
    }

    // Find the user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        status: "failed",
        message: "Invalid Credentials",
      });
      return;
    }

    // Compare the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        status: "failed!",
        message: "Invalid Credentials",
      });
      return;
    }

    // Create Token for Session Management
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h", //Expiration Time SET
    });

    // Send success response for user data and token
    res.status(200).json({
      status: "success",
      data: {
        user: user,
      },
      token: token,
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

// ---Forgot Password---
exports.forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        status: "failed",
        message: "User not found",
      });
      return;
    }

    // Generate password reset token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    // Send reset password email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${token}`;

    await sendEmail(
      user.email,
      "Password Reset",
      `Click this link to reset your password: ${resetUrl}`
    );

    res.status(200).json({
      status: "success",
      message: "Password reset link sent to email",
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

// ---Reset Password---
exports.resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      res.status(400).json({
        status: "failed",
        message: "Passwords do not match",
      });
      return;
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = (decoded as any).id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    const user = await User.findById(userId);
    if (!user) {
      res.status(400).json({
        status: "failed",
        message: "Invalid token",
      });
      return;
    }

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error: any) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
    return;
  }
};

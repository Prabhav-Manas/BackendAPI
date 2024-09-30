import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
const User = require("../models/user");

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({
      status: "failed!",
      message: "Unauthorized Access",
    });
    return;
  }

  try {
    // Ensure process.env.JWT_SECRET is defined
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        status: "failed!",
        message: "JWT_SECRET is not defined on the server",
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Retrieve user from decoded token
    const user = await User.findById(decoded.id).exec();

    if (!user) {
      res.status(401).json({
        status: "failed!",
        message: "User not found!",
      });
      return;
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: "failed!",
      message: "Invalid Token",
    });
  }
};

import mongoose, { Document } from "mongoose";
import validator from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string; //kept for validation purpose
  isVerified: boolean; // add isVerified property
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: [true, "User name is required"], trim: true },
  email: {
    type: String,
    required: [true, "User email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (this: IUser, ele: string): boolean {
        return ele === this.password;
      },
      message: "Password does not match",
    },
  },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model<IUser>("User", userSchema);

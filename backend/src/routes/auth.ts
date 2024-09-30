import express from "express";
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.createUser);
router.post("/login", authController.logInUser);

router.get("/verify-email/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;

const express = require("express");

const {
  register,
  verifyEmail,
  resendOtp,
  login,
  googleLogin,
  logout,
  getMe,

  forgotPassword,
  verifyResetOtp,
  resetPassword,

} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();


router.post(
  "/register",
  register
);


router.post(
  "/verify-email",
  verifyEmail
);


router.post(
  "/resend-otp",
  resendOtp
);


router.post(
  "/login",
  login
);


router.post(
  "/google",
  googleLogin
);


// FORGOT PASSWORD

router.post(
  "/forgot-password",
  forgotPassword
);


router.post(
  "/verify-reset-otp",
  verifyResetOtp
);


router.post(
  "/reset-password",
  resetPassword
);


// GOOGLE

router.post(
  "/google",
  googleLogin
);


// LOGOUT

router.post(
  "/logout",
  logout
);


// CURRENT USER

router.get(
  "/me",
  authMiddleware,
  getMe
);


module.exports = router;
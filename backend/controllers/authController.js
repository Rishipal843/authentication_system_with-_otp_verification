const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const {
  OAuth2Client,
} = require("google-auth-library");

const User =
  require("../models/User");

const generateToken =
  require("../utils/generateToken");

const {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../utils/sendOtp");


const googleClient =
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  );


// COOKIE OPTIONS

const cookieOptions = {

  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    "production",

  sameSite:
    process.env.NODE_ENV ===
    "production"
      ? "none"
      : "lax",

  maxAge:
    7 * 24 * 60 * 60 * 1000,
};


// GENERATE OTP

const generateOtp = () => {

  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();
};


// REGISTER

const register = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password,
    } = req.body;


    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        message:
          "All fields are required",
      });

    }


    if (password.length < 6) {

      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    let user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (
      user &&
      user.isVerified
    ) {

      return res.status(400).json({
        message:
          "Email is already registered",
      });

    }


    if (
      user?.lastOtpSentAt &&
      Date.now() -
        user.lastOtpSentAt.getTime() <
        60000
    ) {

      return res.status(429).json({
        message:
          "Please wait 60 seconds before requesting another OTP",
      });

    }


    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    const otp =
      generateOtp();


    const hashedOtp =
      await bcrypt.hash(
        otp,
        10
      );


    if (!user) {

      user =
        new User({

          name,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          authProvider:
            "local",

        });

    } else {

      user.name =
        name;

      user.password =
        hashedPassword;

      user.authProvider =
        "local";

    }


    user.emailOtp =
      hashedOtp;


    user.emailOtpExpires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );


    user.otpAttempts =
      0;


    user.lastOtpSentAt =
      new Date();


    await user.save();


    await sendOtpEmail(
      normalizedEmail,
      otp
    );


    res.status(201).json({

      message:
        "OTP sent to your email",

      email:
        normalizedEmail,

    });

  } catch (error) {

    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      message:
        "Registration failed",
    });

  }
};



// VERIFY EMAIL

const verifyEmail = async (
  req,
  res
) => {

  try {

    const {
      email,
      otp,
    } = req.body;


    if (!email || !otp) {

      return res.status(400).json({
        message:
          "Email and OTP are required",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (user.isVerified) {

      return res.status(400).json({
        message:
          "Email is already verified",
      });

    }


    if (
      !user.emailOtpExpires ||
      user.emailOtpExpires <
        new Date()
    ) {

      return res.status(400).json({
        message:
          "OTP has expired. Please request a new one.",
      });

    }


    if (
      user.otpAttempts >= 5
    ) {

      return res.status(429).json({
        message:
          "Too many incorrect attempts.",
      });

    }


    const correct =
      await bcrypt.compare(
        otp,
        user.emailOtp
      );


    if (!correct) {

      user.otpAttempts += 1;

      await user.save();

      return res.status(400).json({

        message:
          "Invalid OTP",

        attemptsRemaining:
          5 -
          user.otpAttempts,

      });

    }


    user.isVerified =
      true;

    user.emailOtp =
      null;

    user.emailOtpExpires =
      null;

    user.otpAttempts =
      0;

    user.lastOtpSentAt =
      null;


    await user.save();


    const token =
      generateToken(
        user._id
      );


    res.cookie(
      "token",
      token,
      cookieOptions
    );


    res.json({

      message:
        "Email verified successfully",

      user: {
        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        isVerified:
          user.isVerified,

        profileImage:
          user.profileImage,

        authProvider:
          user.authProvider,
      },

    });

  } catch (error) {

    console.error(
      "Verify email error:",
      error
    );

    res.status(500).json({
      message:
        "Email verification failed",
    });

  }
};


// RESEND OTP

const resendOtp = async (
  req,
  res
) => {

  try {

    const {
      email,
    } = req.body;


    if (!email) {

      return res.status(400).json({
        message:
          "Email is required",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    if (user.isVerified) {

      return res.status(400).json({
        message:
          "Email is already verified",
      });

    }


    if (
      user.lastOtpSentAt &&
      Date.now() -
        user.lastOtpSentAt.getTime() <
        60000
    ) {

      return res.status(429).json({
        message:
          "Please wait 60 seconds.",
      });

    }


    const otp =
      generateOtp();


    user.emailOtp =
      await bcrypt.hash(
        otp,
        10
      );


    user.emailOtpExpires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );


    user.otpAttempts =
      0;


    user.lastOtpSentAt =
      new Date();


    await user.save();


    await sendOtpEmail(
      normalizedEmail,
      otp
    );


    res.json({
      message:
        "New OTP sent successfully",
    });

  } catch (error) {

    console.error(
      "Resend OTP error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to resend OTP",
    });

  }
};


// LOGIN

const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password,
    } = req.body;


    if (!email || !password) {

      return res.status(400).json({
        message:
          "Email and password are required",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {

      return res.status(401).json({
        message:
          "Invalid email or password",
      });

    }


    if (
      user.authProvider ===
        "google" &&
      !user.password
    ) {

      return res.status(400).json({
        message:
          "This account uses Google Sign In. Please continue with Google.",
      });

    }


    if (!user.isVerified) {

      return res.status(403).json({
        message:
          "Please verify your email first",
      });

    }


    const correct =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!correct) {

      return res.status(401).json({
        message:
          "Invalid email or password",
      });

    }


    const token =
      generateToken(
        user._id
      );


    res.cookie(
      "token",
      token,
      cookieOptions
    );


    res.json({

      message:
        "Login successful",

      user: {
        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        isVerified:
          user.isVerified,

        profileImage:
          user.profileImage,

        authProvider:
          user.authProvider,
      },

    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Login failed",
    });

  }
};


// GOOGLE LOGIN

const googleLogin = async (
  req,
  res
) => {

  try {

    const {
      credential,
    } = req.body;


    if (!credential) {

      return res.status(400).json({
        message:
          "Google credential is required",
      });

    }


    const ticket =
      await googleClient.verifyIdToken({

        idToken:
          credential,

        audience:
          process.env.GOOGLE_CLIENT_ID,

      });


    const payload =
      ticket.getPayload();


    const {
      sub,
      email,
      name,
      picture,
      email_verified,
    } = payload;


    if (
      !email ||
      !email_verified
    ) {

      return res.status(400).json({
        message:
          "Google email could not be verified",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    let user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (user) {

      if (!user.googleId) {

        user.googleId =
          sub;

      }


      if (
        !user.profileImage &&
        picture
      ) {

        user.profileImage =
          picture;

      }


      user.isVerified =
        true;


      await user.save();

    } else {

      user =
        await User.create({

          name:
            name ||
            "Google User",

          email:
            normalizedEmail,

          password:
            null,

          authProvider:
            "google",

          googleId:
            sub,

          profileImage:
            picture ||
            null,

          isVerified:
            true,

        });

    }


    const token =
      generateToken(
        user._id
      );


    res.cookie(
      "token",
      token,
      cookieOptions
    );


    res.json({

      message:
        "Google login successful",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        isVerified:
          user.isVerified,

        profileImage:
          user.profileImage,

        authProvider:
          user.authProvider,

      },

    });

  } catch (error) {

    console.error(
      "Google login error:",
      error
    );

    res.status(401).json({
      message:
        "Google authentication failed",
    });

  }
};


// FORGOT PASSWORD


const forgotPassword = async (
  req,
  res
) => {

  try {

    const {
      email,
    } = req.body;


    if (!email) {

      return res.status(400).json({
        message:
          "Email is required",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    // Don't reveal whether account exists
    if (!user) {

      return res.json({
        message:
          "If an account exists, a reset OTP has been sent.",
      });

    }


    if (
      user.authProvider ===
        "google" &&
      !user.password
    ) {

      return res.status(400).json({
        message:
          "This account uses Google Sign In. Please continue with Google.",
      });

    }


    if (!user.isVerified) {

      return res.status(403).json({
        message:
          "Please verify your email first.",
      });

    }


    if (
      user.passwordResetLastOtpSentAt &&
      Date.now() -
        user.passwordResetLastOtpSentAt.getTime() <
        60000
    ) {

      return res.status(429).json({
        message:
          "Please wait 60 seconds before requesting another OTP.",
      });

    }


    const otp =
      generateOtp();


    user.passwordResetOtp =
      await bcrypt.hash(
        otp,
        10
      );


    user.passwordResetOtpExpires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );


    user.passwordResetOtpAttempts =
      0;


    user.passwordResetLastOtpSentAt =
      new Date();


    user.passwordResetVerified =
      false;


    await user.save();


    await sendPasswordResetOtpEmail(
      normalizedEmail,
      otp
    );


    res.json({
      message:
        "If an account exists, a reset OTP has been sent.",
    });

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to process password reset",
    });

  }
};


// VERIFY RESET OTP

const verifyResetOtp = async (
  req,
  res
) => {

  try {

    const {
      email,
      otp,
    } = req.body;


    if (!email || !otp) {

      return res.status(400).json({
        message:
          "Email and OTP are required",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {

      return res.status(400).json({
        message:
          "Invalid or expired OTP",
      });

    }


    if (
      user.passwordResetOtpAttempts >= 5
    ) {

      return res.status(429).json({
        message:
          "Too many incorrect attempts.",
      });

    }


    if (
      !user.passwordResetOtp ||
      !user.passwordResetOtpExpires
    ) {

      return res.status(400).json({
        message:
          "Invalid or expired OTP",
      });

    }


    if (
      user.passwordResetOtpExpires <
      new Date()
    ) {

      return res.status(400).json({
        message:
          "OTP has expired.",
      });

    }


    const correct =
      await bcrypt.compare(
        otp,
        user.passwordResetOtp
      );


    if (!correct) {

      user.passwordResetOtpAttempts += 1;

      await user.save();

      return res.status(400).json({

        message:
          "Invalid OTP",

        attemptsRemaining:
          5 -
          user.passwordResetOtpAttempts,

      });

    }


    user.passwordResetVerified =
      true;


    user.passwordResetOtp =
      null;


    user.passwordResetOtpExpires =
      null;


    user.passwordResetOtpAttempts =
      0;


    await user.save();


    res.json({
      message:
        "OTP verified successfully",
    });

  } catch (error) {

    console.error(
      "Verify reset OTP error:",
      error
    );

    res.status(500).json({
      message:
        "OTP verification failed",
    });

  }
};


// RESET PASSWORD

const resetPassword = async (
  req,
  res
) => {

  try {

    const {
      email,
      newPassword,
    } = req.body;


    if (
      !email ||
      !newPassword
    ) {

      return res.status(400).json({
        message:
          "Email and new password are required",
      });

    }


    if (
      newPassword.length < 6
    ) {

      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });

    }


    const normalizedEmail =
      email.toLowerCase().trim();


    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    if (!user) {

      return res.status(400).json({
        message:
          "Unable to reset password",
      });

    }


    if (
      !user.passwordResetVerified
    ) {

      return res.status(403).json({
        message:
          "Please verify the OTP first",
      });

    }


    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );


    user.passwordResetVerified =
      false;


    user.passwordResetOtp =
      null;


    user.passwordResetOtpExpires =
      null;


    user.passwordResetOtpAttempts =
      0;


    user.passwordResetLastOtpSentAt =
      null;


    await user.save();


    res.json({
      message:
        "Password reset successfully",
    });

  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to reset password",
    });

  }
};


// LOGOUT

const logout = (
  req,
  res
) => {

  res.clearCookie(
    "token",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
    }
  );


  res.json({
    message:
      "Logged out successfully",
  });
};


// GET CURRENT USER

const getMe = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.userId
      ).select(
        "-password -emailOtp -passwordResetOtp"
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found",
      });

    }


    res.json({
      user,
    });

  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to get user",
    });

  }
};


module.exports = {

  register,

  verifyEmail,

  resendOtp,

  login,

  googleLogin,

  forgotPassword,

  verifyResetOtp,

  resetPassword,

  logout,

  getMe,

};
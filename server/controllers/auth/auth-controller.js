
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const sendEmail = require("../../helpers/send-email");


const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    // Check if the user already exists
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with the same email! Please try again.",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first.",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again.",
      });
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      CLIENT_SECRET_KEY,
      { expiresIn: "1d" } // Token valid for 15 minutes
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: checkUser._id },
      CLIENT_SECRET_KEY,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      accessToken,
      refreshToken,
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided.",
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, CLIENT_SECRET_KEY);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      CLIENT_SECRET_KEY,
      { expiresIn: "1d" } // Access token expires in 15 minutes
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Error verifying refresh token:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
    });
  }
};


const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, CLIENT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    res.status(401).json({
      success: false,
      message: "Unauthorized user! Invalid or expired token.",
    });
  }
};

const logoutUser = (req, res) => {

  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please clear your session on the client.",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If a user with that email exists, you will receive password reset instructions.",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, CLIENT_SECRET_KEY, { expiresIn: "1h" });
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;


    const message = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #fed1d6; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dhkdsvdvr/image/upload/v1740216811/logo3_moey1d.png" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
        <h2 style="margin-bottom: 5px;">Reset Your Password</h2>
        <p style="font-size: 16px; margin-top: 0;">We received a request to reset your password.</p>
      </div>

      <div style="padding: 20px;">
        <p style="font-size: 14px; color: #2c3315; text-align: center;">Click the button below to reset your password:</p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #fed1d6; color: #2c3315; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>

        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px;">
          If the button above doesn't work, copy and paste the following link in your browser:
        </p>

        <p style="word-wrap: break-word; font-size: 12px; text-align: center; color: #777; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin: 15px auto; display: inline-block;">
          ${resetUrl}
        </p>

        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px;">
          This link is valid for 1 hour. If you didn't request this, please ignore this email or contact our support team.
        </p>
      </div>

      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p>If you need help, please contact our support team.</p>
      </div>
    </div>
`;



    // Send the reset email using the internal email utility.
    await sendEmail({
      email: user.email,
      subject: "Password Reset Instructions",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
      return res.status(400).json({
          success: false,
          message: "Token and new password are required.",
      });
  }
  try {
      // Verify the password reset token.
      const decoded = jwt.verify(token, CLIENT_SECRET_KEY);
      // Find the user using the ID from the token.
      const user = await User.findById(decoded.id);
      if (!user) {
          return res.status(400).json({
              success: false,
              message: "Invalid token or user no longer exists.",
          });
      }

      // Hash the new password before saving it.
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
          success: true,
          message: "Password reset successful.",
      });
  } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(400).json({
          success: false,
          message: "Invalid or expired token.",
      });
  }
};


const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const userId = req.user.id;

    // Find the user by ID but exclude the password field
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return the user profile data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user profile."
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
  getUserProfile
};

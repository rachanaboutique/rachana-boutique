
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
    <div style="font-family: 'Inter', Arial, sans-serif; color: #1f2937; background-color: #f9fafb; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h1 style="text-align: center; color: #1d4ed8; font-size: 1.875rem; font-weight: 700; margin-bottom: 20px; letter-spacing: 1px;">
        Rachana Boutique
      </h1>
      <p style="font-size: 1rem; line-height: 1.5; margin-top: 20px; text-align: center; color: #4b5563;">
        You requested a password reset.
      </p>
      <p style="font-size: 0.95rem; line-height: 1.5; text-align: center; color: #6b7280;">
        Please click the button below to reset your password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #1d4ed8; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-size: 1rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 0.85rem; line-height: 1.4; text-align: center; color: #9ca3af;">
        Please note: This link will expire in 1 hour.
      </p>
      <p style="font-size: 0.9rem; line-height: 1.4; text-align: center; color: #6b7280;">
        If the button doesn't work, copy and paste the link below into your browser:
      </p>
      <p style="word-wrap: break-word; font-size: 0.9rem; text-align: center; color: #9ca3af; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin: 15px auto; display: inline-block;">
        ${resetUrl}
      </p>
      <p style="font-size: 0.9rem; line-height: 1.4; text-align: center; color: #6b7280; margin-top: 20px;">
        If you did not request this, please ignore this email or contact support for assistance.
      </p>
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

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, authMiddleware, forgotPassword, resetPassword };

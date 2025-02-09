
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");


const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;


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

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, authMiddleware };

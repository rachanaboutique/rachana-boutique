const InstaFeed = require("../../models/InstaFeed");

// Create or Add Posts to the InstaFeed
const createInstaFeed = async (req, res) => {
  try {
    const { posts } = req.body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Posts array is required and must contain at least one post.",
      });
    }

    const updatedInstaFeed = await InstaFeed.findOneAndUpdate(
      {}, // Target the single document
      { $push: { posts: { $each: posts } } }, // Append new posts to the array
      { new: true, upsert: true } // Create the document if it doesn't exist
    );

    res.status(200).json({
      success: true,
      data: updatedInstaFeed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding posts to InstaFeed",
    });
  }
};

// Update the InstaFeed by replacing the posts array
const updateInstaFeed = async (req, res) => {
  try {
    const { posts } = req.param;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Posts array is required and must contain at least one post.",
      });
    }

    const updatedInstaFeed = await InstaFeed.findOneAndUpdate(
      {}, // Target the single document
      { posts }, // Replace the entire posts array
      { new: true }
    );

    if (!updatedInstaFeed) {
      return res.status(404).json({
        success: false,
        message: "InstaFeed not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedInstaFeed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating InstaFeed",
    });
  }
};

// Delete a specific post from the posts array
const deleteInstaFeed = async (req, res) => {
    try {
      const { postUrl } = req.params;
  
      if (!postUrl) {
        return res.status(400).json({
          success: false,
          message: "Post URL is required to delete a post.",
        });
      }
  
      const updatedInstaFeed = await InstaFeed.findOneAndUpdate(
        {}, // Find the single InstaFeed document
        { $pull: { posts: postUrl } }, // Remove the specified postUrl
        { new: true } // Return the updated document
      );
  
      if (!updatedInstaFeed) {
        return res.status(404).json({
          success: false,
          message: "InstaFeed not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
        data: updatedInstaFeed,
      });
    } catch (error) {
      console.error("Error deleting InstaFeed post:", error);
      res.status(500).json({
        success: false,
        message: "Error occurred while deleting InstaFeed post",
      });
    }
  };
  

// Retrieve all posts in the InstaFeed
const getAllInstaFeeds = async (req, res) => {
  try {
    const instaFeed = await InstaFeed.findOne({}); // Retrieve the single document
    if (!instaFeed) {
      return res.status(404).json({
        success: false,
        message: "InstaFeed not found",
      });
    }

    res.status(200).json({
      success: true,
      data: instaFeed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching InstaFeed",
    });
  }
};

module.exports = {
  createInstaFeed,
  updateInstaFeed,
  deleteInstaFeed,
  getAllInstaFeeds,
};

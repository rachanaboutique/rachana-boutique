const { imageUploadUtil } = require("../../helpers/cloudinary");
const Banner = require("../../models/Banner");
const cloudinary = require("cloudinary").v2;

// Helper: extract Cloudinary public ID from a resource URL
function extractPublicIdFromUrl(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    const right = url.substring(uploadIndex + '/upload/'.length);
    const parts = right.split('/');
    // Skip transformation segments (commonly contain commas, underscores, or colons)
    while (parts.length > 1 && (/[,:_]/.test(parts[0]))) {
      parts.shift();
    }
    // Skip version segment (v12345)
    if (parts.length > 1 && /^v\d+$/.test(parts[0])) {
      parts.shift();
    }
    const last = parts.pop();
    const withoutExt = last.replace(/\.[^/.]+$/, '');
    parts.push(withoutExt);
    return parts.join('/');
  } catch {
    return null;
  }
}


// Create a new banner
const createBanner = async (req, res) => {
  try {
    // Extract image and description from the request body
    const { image, description } = req.body;

    // Optionally, you can use imageUploadUtil if you need to upload the image
    // Example (uncomment if required):
    // const uploadedImage = await imageUploadUtil(image);
    // const bannerImage = uploadedImage.secure_url || image;

    const newBanner = new Banner({
      image,
      description
    });

    const savedBanner = await newBanner.save();
    res.status(201).json({
      success: true,
      data: savedBanner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating banner",
    });
  }
};

// Update an existing banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, description } = req.body;

    // Fetch current banner to detect image changes
    const current = await Banner.findById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const updateData = { image, description };

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // If image changed, best-effort delete old Cloudinary asset
    try {
      const beforeUrl = current.image;
      const afterUrl = updatedBanner.image;
      if (beforeUrl && beforeUrl !== afterUrl) {
        const publicId = extractPublicIdFromUrl(beforeUrl);
        if (publicId) {
          await cloudinary.api.delete_resources([publicId], { resource_type: 'image' });
        }
      }
    } catch (cleanupErr) {
      console.warn('Cloudinary banner image cleanup (update) failed:', cleanupErr?.message || cleanupErr);
    }

    res.status(200).json({ success: true, data: updatedBanner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ success: false, message: "Error occurred while updating banner" });
  }
};

// Delete a banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Best-effort: delete associated Cloudinary image
    try {
      const url = deletedBanner.image;
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        await cloudinary.api.delete_resources([publicId], { resource_type: 'image' });
      }
    } catch (cloudErr) {
      console.warn('Cloudinary banner image cleanup (delete) failed:', cloudErr?.message || cloudErr);
    }

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: "Error occurred while deleting banner" });
  }
};

// Retrieve all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching banners",
    });
  }
};

module.exports = {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
};
import React, { useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { getOptimizedImageUrl, getOptimizedVideoUrl } from "../../lib/utils";
import { optimizeImageForUpload, isValidImageFile, isValidFileSize } from "../../lib/imageOptimization";


function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  stateOptions = [],
  cityOptions = [],
  formErrors = {}
}) {
  const [passwordVisibility, setPasswordVisibility] = useState({});
  // Track upload status for color items (by index) and video upload status.
  const [colorsUploadStatus, setColorsUploadStatus] = useState({});
  const [videoUploadStatus, setVideoUploadStatus] = useState("idle"); // idle, uploading, uploaded, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Helper function for uploading a color image directly to Cloudinary with optimization.
  const uploadColorImage = async (file, idx, controlItem) => {
    // Validate file type and size using the same logic as backend
    if (!isValidImageFile(file)) {
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "error" }));
      console.error(`Unsupported file format: ${file.type || 'unknown'}`);
      return;
    }

    if (!isValidFileSize(file)) {
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "error" }));
      console.error(`File size exceeds 1MB limit. Please select a smaller image.`);
      return;
    }

    setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "uploading" }));

    try {
      // Apply the same optimization logic as backend
      const optimizedFile = await optimizeImageForUpload(file);

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", optimizedFile);
      cloudinaryFormData.append("upload_preset", "upload_product_image");
      cloudinaryFormData.append("resource_type", "image");

      // Upload directly to Cloudinary using environment variable for cloud name
      const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        cloudinaryFormData
      );

      if (response?.data?.secure_url) {
        const secureUrl = response.data.secure_url;
        const optimizedUrl = getOptimizedImageUrl(secureUrl); // Apply q_auto,f_auto transformations
        const colorsArray = Array.isArray(formData[controlItem.name]) ? formData[controlItem.name] : [];
        const updatedColors = [...colorsArray];
        updatedColors[idx] = { ...updatedColors[idx], image: optimizedUrl };

        setFormData({
          ...formData,
          [controlItem.name]: updatedColors,
        });

        setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "uploaded" }));
      }
    } catch (err) {
      console.error("Error uploading color image: ", err);
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "error" }));

      // Log specific error for HEIC files
      if (err.message.includes('HEIC')) {
        console.warn('HEIC file processing failed. User should convert to JPEG/PNG first.');
      }
    }
  };


  // Helper function for uploading video to Cloudinary.

// Updated uploadVideo function with file size limit and progress tracking
const uploadVideo = async (file) => {
  // Check file size - limit to 10MB (10 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    setVideoUploadStatus("error");
    setUploadError(`File size exceeds 10MB limit. Please select a smaller file.`);
    return;
  }

  setVideoUploadStatus("uploading");
  setUploadProgress(0);

  try {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "watch_any_buy");
    cloudinaryFormData.append("resource_type", "video");

    // Transformations will be applied at delivery time via getOptimizedVideoUrl

    // Use XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          // Set the Cloudinary URL in the form data with optimizations
          const optimizedVideoUrl = getOptimizedVideoUrl(data.secure_url);
          setFormData((prevFormData) => ({
            ...prevFormData,
            video: optimizedVideoUrl,
          }));

          setVideoUploadStatus("uploaded");
          resolve({ url: data.secure_url, public_id: data.public_id });
        } else {
          setVideoUploadStatus("error");
          setUploadError("Failed to upload video to Cloudinary. Please try again.");
          reject(new Error("Failed to upload video to Cloudinary"));
        }
      };

      xhr.onerror = () => {
        setVideoUploadStatus("error");
        setUploadError("Network error during upload. Please check your connection and try again.");
        reject(new Error("Network error during upload"));
      };

      xhr.open("POST", `https://api.cloudinary.com/v1_1/dxfeyj7hl/video/upload`, true);
      xhr.send(cloudinaryFormData);
    });
  } catch (err) {
    console.error("Error uploading video: ", err);
    setVideoUploadStatus("error");
    setUploadError("An unexpected error occurred. Please try again.");
    throw err;
  }
};




  function togglePasswordVisibility(name) {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  }

  function renderInputsByComponentType(controlItem) {
    let element = null;
    // For colors, default to empty array; otherwise default to empty string.
    const value = formData[controlItem.name] || (controlItem.componentType === "colors" ? [] : "");

    switch (controlItem.componentType) {
      case "input":
        element = (
          <Input
            name={controlItem.name}
            placeholder={controlItem.placeholder}
            id={controlItem.name}
            type={controlItem.type}
            value={value}
            onChange={(event) => {
              if (typeof setFormData === 'function') {
                // Check if setFormData is the custom handler (for address form)
                if (setFormData.length === 2) {
                  setFormData(controlItem.name, event.target.value);
                } else {
                  setFormData({
                    ...formData,
                    [controlItem.name]: event.target.value,
                  });
                }
              }
            }}
            className={formErrors[controlItem.name] ? "border-red-500" : ""}
          />
        );
        break;


        case "password":
          element = (
            <div className="relative">
              <Input
                name={controlItem.name}
                placeholder={controlItem.placeholder}
                id={controlItem.name}
                type={passwordVisibility[controlItem.name] ? "text" : "password"} // Toggle between text and password
                value={value}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    [controlItem.name]: event.target.value,
                  })
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => togglePasswordVisibility(controlItem.name)}
              >
                {passwordVisibility[controlItem.name] ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          );
          break;

      case "select":
        let selectOptions = [];

        // Handle state and city dropdowns
        if (controlItem.name === "state") {
          selectOptions = stateOptions; // Already in correct format from locationUtils
        } else if (controlItem.name === "city") {
          selectOptions = cityOptions; // Already in correct format from locationUtils
        } else {
          selectOptions = controlItem.options || [];
        }

        element = (
          <Select
            onValueChange={(val) => {
              if (typeof setFormData === 'function') {
                if (controlItem.name === "state" || controlItem.name === "city") {
                  // Use the custom handler for state/city changes
                  setFormData(controlItem.name, val);
                } else {
                  setFormData({
                    ...formData,
                    [controlItem.name]: val,
                  });
                }
              }
            }}
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={controlItem.placeholder || controlItem.label} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              className="z-50 max-h-60 overflow-auto"
            >
              {selectOptions && selectOptions.length > 0
                ? selectOptions.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : (
                    <SelectItem value="no-options" disabled>
                      {controlItem.name === "city" && !formData.state
                        ? "Please select a state first"
                        : "No options available"}
                    </SelectItem>
                  )}
            </SelectContent>
          </Select>
        );
        break;
      case "textarea":
        element = (
          <Textarea
            name={controlItem.name}
            placeholder={controlItem.placeholder}
            id={controlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
      case "toggle":
        element = (
          <Switch
            checked={!!value}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                [controlItem.name]: checked,
              })
            }
          />
        );
        break;
        case "colors": {
          const colorsArray = Array.isArray(value) ? value : [];
          element = (
            <div>
              {colorsArray.map((color, idx) => (
                <div key={idx} className="flex flex-col gap-2 mb-2 border p-2 rounded">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Color Title"
                      value={color.title || ""}
                      onChange={({ target }) => {
                        const updatedColors = [...colorsArray];
                        updatedColors[idx] = { ...updatedColors[idx], title: target.value };
                        setFormData({
                          ...formData,
                          [controlItem.name]: updatedColors,
                        });
                      }}
                    />
                    <Input
                      placeholder="Inventory"
                      type="number"
                      min="0"
                      value={color.inventory || ""}
                      onChange={({ target }) => {
                        const updatedColors = [...colorsArray];
                        updatedColors[idx] = { ...updatedColors[idx], inventory: parseInt(target.value) || 0 };
                        setFormData({
                          ...formData,
                          [controlItem.name]: updatedColors,
                        });
                      }}
                      className="w-24"
                    />
                    {color.image && (
                      <img
                        src={color.image}
                        alt={`Color ${idx}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    {!color.image && colorsUploadStatus[idx] !== "uploading" && (
                      <Input
                        type="file"
                        accept="image/*,.heic,.heif"
                        onChange={async (event) => {
                          const file = event.target.files[0];
                          if (file) {
                            await uploadColorImage(file, idx, controlItem);
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {colorsUploadStatus[idx] === "uploading" && "Uploading..."}
                      {colorsUploadStatus[idx] === "uploaded" && "Uploaded"}
                      {colorsUploadStatus[idx] === "error" && (
                        <span className="text-red-600">Upload failed (check file format/size)</span>
                      )}
                    </span>
                    <Button
                      type="button"
                      onClick={() => {
                        const updatedColors = colorsArray.filter((_, index) => index !== idx);
                        setFormData({ ...formData, [controlItem.name]: updatedColors });
                        setColorsUploadStatus((prevStatus) => {
                          const newStatus = { ...prevStatus };
                          delete newStatus[idx];
                          return newStatus;
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => {
                  const updatedColors = [...colorsArray, { title: "", image: "" }];
                  setFormData({ ...formData, [controlItem.name]: updatedColors });
                }}
              >
                Add New Color
              </Button>
            </div>
          );
          break;
        }
        case "video": {
          if (formData.isWatchAndBuy) {
            element = (
              <div>
                {formData.video && (
                  <div style={{ marginBottom: "10px" }}>
                    <video
                      src={formData.video}
                      controls
                      width="200"
                      style={{ borderRadius: "8px", border: "1px solid #ccc" }}
                    />
                    <button
                      onClick={() => {
                        setFormData({ ...formData, video: "" });
                        setVideoUploadStatus("idle");
                      }}
                    >
                      Remove Video
                    </button>
                  </div>
                )}

                {!formData.video && (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (event) => {
                      const file = event.target.files[0];
                      if (file) {
                        setVideoUploadStatus("uploading");
                        setUploadError(""); // Clear any previous errors
                        await uploadVideo(file); // Upload function
                        // No need to set the blob URL here
                      }
                    }}
                  />
                )}

                {videoUploadStatus === "uploading" && (
                  <div className="mt-2">
                    <p>Processing... {uploadProgress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {videoUploadStatus === "error" && (
                  <div className="mt-2">
                    <p className="text-red-600">{uploadError}</p>
                  </div>
                )}
                {videoUploadStatus === "uploaded" && <p className="mt-2 text-green-600">Uploaded Successfully</p>}
              </div>
            );
          } else {
            element = null;
          }
          break;
        }

      default:
        element = null;
    }
    return element;
  }

  // Helper function to check if video upload is required and completed
  const isVideoUploadRequired = () => {
    const hasVideoField = formControls.some(control => control.componentType === "video");
    return hasVideoField && formData.isWatchAndBuy && !formData.video;
  };

  // Determine if button should be disabled
  const shouldDisableButton = isBtnDisabled || isVideoUploadRequired() || videoUploadStatus === "uploading";

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
            {formErrors[controlItem.name] && (
              <span className="text-red-500 text-sm">{formErrors[controlItem.name]}</span>
            )}
          </div>
        ))}
      </div>
      <Button disabled={shouldDisableButton} type="submit" className="mt-2 w-full hover:bg-accent">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
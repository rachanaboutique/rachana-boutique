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


function CommonForm({ formControls, formData, setFormData, onSubmit, buttonText, isBtnDisabled }) {
  const [passwordVisibility, setPasswordVisibility] = useState({});
  // Track upload status for color items (by index) and video upload status.
  const [colorsUploadStatus, setColorsUploadStatus] = useState({});
  const [videoUploadStatus, setVideoUploadStatus] = useState("idle"); // idle, uploading, uploaded, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Helper function for uploading a color image to Cloudinary.
  const uploadColorImage = async (file, idx, controlItem) => {
    setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "uploading" }));
    const data = new FormData();
    data.append("my_file", file);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/products/upload-image`,
        data
      );
  
      if (response?.data?.success) {
        const secureUrl = response.data.result[0].secure_url; // Use secure_url for HTTPS
        const colorsArray = Array.isArray(formData[controlItem.name]) ? formData[controlItem.name] : [];
        const updatedColors = [...colorsArray];
        updatedColors[idx] = { ...updatedColors[idx], image: secureUrl };
  
        setFormData({
          ...formData,
          [controlItem.name]: updatedColors,
        });
  
        setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "uploaded" }));
      }
    } catch (err) {
      console.error("Error uploading color image: ", err);
      setColorsUploadStatus((prevStatus) => ({ ...prevStatus, [idx]: "idle" }));
    }
  };
  

  // Helper function for uploading video to Cloudinary.
/*   const uploadVideo = async (file) => {
    setVideoUploadStatus("uploading");
    const data = new FormData();
    data.append("my_file", file);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/products/upload-video`,
        data
      );

      if (response?.data?.success) {
        setFormData({
          ...formData,
          video: response.data.result.url,
        });
        setVideoUploadStatus("uploaded");
      }
    } catch (err) {
      console.error("Error uploading video: ", err);
      setVideoUploadStatus("idle");
    }
  };
 */

// Updated uploadVideo function with file size limit and progress tracking
const uploadVideo = async (file) => {
  // Check file size - limit to 25MB (25 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    setVideoUploadStatus("error");
    setUploadError(`File size exceeds 25MB limit. Please select a smaller file.`);
    return;
  }

  setVideoUploadStatus("uploading");
  setUploadProgress(0);

  try {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "watch_any_buy");
    cloudinaryFormData.append("resource_type", "video");

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

          // Set the Cloudinary URL in the form data
          setFormData((prevFormData) => ({
            ...prevFormData,
            video: data.secure_url,
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

      xhr.open("POST", "https://api.cloudinary.com/v1_1/dhkdsvdvr/video/upload", true);
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
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlItem.name]: event.target.value,
              })
            }
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
        element = (
          <Select
            onValueChange={(val) =>
              setFormData({
                ...formData,
                [controlItem.name]: val,
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={controlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {controlItem.options && controlItem.options.length > 0
                ? controlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
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
                        accept="image/*"
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

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>
      <Button disabled={isBtnDisabled} type="submit" className="mt-2 w-full hover:bg-accent">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
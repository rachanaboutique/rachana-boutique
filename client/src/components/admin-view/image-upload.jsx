import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFiles,
  setImageFiles,
  imageLoadingStates,
  uploadedImageUrls,
  setUploadedImageUrls,
  setImageLoadingStates,
  isCustomStyling = false,
  isSingleImage = false, // Controls single vs. multiple uploads
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      if (isSingleImage) {
        setImageFiles([selectedFiles[0]]);
        setImageLoadingStates([false]);
      } else {
        setImageFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
        setImageLoadingStates((prevStates) => [
          ...prevStates,
          ...selectedFiles.map(() => false),
        ]);
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      if (isSingleImage) {
        setImageFiles([droppedFiles[0]]);
        setImageLoadingStates([false]);
      } else {
        setImageFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
        setImageLoadingStates((prevStates) => [
          ...prevStates,
          ...droppedFiles.map(() => false),
        ]);
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleRemoveImage(index) {
    console.log("Before Removing:", {
      imageFiles,
      uploadedImageUrls,
      imageLoadingStates,
    });

    if (!Array.isArray(imageLoadingStates)) {
      console.error("imageLoadingStates is not an array! Resetting...");
      setImageLoadingStates([]);
      return;
    }

    if (isSingleImage) {
      setImageFiles([]);
      setUploadedImageUrls([]);
      setImageLoadingStates([]);
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
      setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
      setImageLoadingStates((prev) => prev.filter((_, i) => i !== index));
    }

    console.log("After Removing:", {
      imageFiles,
      uploadedImageUrls,
      imageLoadingStates,
    });
  }

  async function uploadImageToCloudinary(file, index) {
    setImageLoadingStates((prevStates) => {
      const updatedStates = [...prevStates];
      updatedStates[index] = true;
      return updatedStates;
    });
    setIsUploading(true);

    const data = new FormData();
    data.append("my_file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/products/upload-image`,
        data
      );
      if (response?.data?.success) {
        setUploadedImageUrls((prevUrls) => {
          if (isSingleImage) {
            return [response.data.result[0].url];
          } else {
            const updatedUrls = [...prevUrls];
            updatedUrls[index] = response.data.result[0].url;
            return updatedUrls;
          }
        });
      }
    } finally {
      setImageLoadingStates((prevStates) => {
        const updatedStates = [...prevStates];
        updatedStates[index] = false;
        return updatedStates;
      });
      setIsUploading(false);
    }
  }

  useEffect(() => {
    imageFiles?.forEach((file, index) => {
      if (!uploadedImageUrls[index] && file) {
        uploadImageToCloudinary(file, index);
      }
    });
    // We intentionally leave out dependencies such as uploadedImageUrls to avoid re-triggering uploads unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">
        Upload Image{isSingleImage ? "" : "s"}
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4"
      >
        {isUploading && (
          <div className="text-center text-muted-foreground mb-4">
            Uploading... Please wait...
          </div>
        )}

        {/* Display existing uploaded images */}
        {uploadedImageUrls && uploadedImageUrls.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {uploadedImageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-md bg-gray-100 absolute top-0 right-0 text-muted-foreground hover:bg-foreground hover:text-background"
                  onClick={() => handleRemoveImage(index)}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove Image</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Always display the upload option so that users can add/replace images */}
        <Label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center h-32 cursor-pointer border border-dashed rounded-lg p-4"
        >
          <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
          <span>
            Drag & drop or click to upload {isSingleImage ? "an image" : "images"}
          </span>
        </Label>

        {/* File input; remains hidden */}
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple={!isSingleImage}
        />
      </div>
    </div>
  );
}

export default ProductImageUpload;
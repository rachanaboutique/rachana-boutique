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
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      setImageFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
      setImageLoadingStates((prevStates) => [
        ...prevStates,
        ...selectedFiles.map(() => false),
      ]);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setImageFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
      setImageLoadingStates((prevStates) => [
        ...prevStates,
        ...droppedFiles.map(() => false),
      ]);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleRemoveImage(index) {
    const updatedFiles = [...imageFiles];
    const updatedUrls = [...uploadedImageUrls];
    const updatedLoadingStates = [...(imageLoadingStates || [])]; // Ensure it's an array

    updatedFiles.splice(index, 1);
    updatedUrls.splice(index, 1);
    updatedLoadingStates.splice(index, 1);

    setImageFiles(updatedFiles);
    setUploadedImageUrls(updatedUrls);
    setImageLoadingStates(updatedLoadingStates);
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
      console.log("Cloudinary Response:", response.data);
      if (response?.data?.success) {
        setUploadedImageUrls((prevUrls) => {
          const updatedUrls = [...prevUrls];
          updatedUrls[index] = response.data.result[0].url;
          console.log("Updated URLs:", updatedUrls); // Debug log
          return updatedUrls;
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
    imageFiles.forEach((file, index) => {
      if (!uploadedImageUrls[index] && file) {
        uploadImageToCloudinary(file, index);
      }
    });
  }, [imageFiles]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">Upload Images</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-4"
      >
        {/* Display the uploading text */}
        {isUploading && <div className="text-center text-muted-foreground mb-4">Uploading... Please wait...</div>}

        {/* Display the uploaded images */}
        {uploadedImageUrls.map((url, index) => (
          <div key={index} className="relative mb-4">
            <img
              src={url}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => handleRemoveImage(index)}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove Image</span>
            </Button>
          </div>
        ))}

        {/* Show the upload area */}
        <Label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center h-32 cursor-pointer"
        >
          <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
          <span>Drag & drop or click to upload images</span>
        </Label>
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          multiple
        />
      </div>
    </div>
  );
}

export default ProductImageUpload;

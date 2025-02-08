import React from "react";
import { Button } from "../ui/button";

function AdminBannerTile({ image, description, handleEdit, handleDelete }) {
  return (
    <div className="relative w-full h-[350px] rounded-t-lg">
      {/* Background Image */}
      <img
        src={image}
        alt="Banner"
        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <p className="text-lg md:text-2xl max-w-3xl mb-6 break-words">{description}</p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleEdit}
            className="bg-primary text-white hover:bg-accent"
          >
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminBannerTile;

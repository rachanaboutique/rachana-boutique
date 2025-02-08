import React from "react";
import { Button } from "../ui/button";

function InstafeedTile({ postUrl, handleDelete }) {
  return (
    <div className="relative w-full p-4 border border-gray-200 rounded-lg shadow-lg">
      {/* Post URL */}
      <p className="text-lg md:text-xl break-words">{postUrl}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-4">

        <Button
          onClick={handleDelete}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default InstafeedTile;

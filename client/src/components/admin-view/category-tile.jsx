import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Trash, Edit } from "lucide-react";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

function AdminCategoryTile({
  category,
  setFormData,
  setOpenCreateCategoriesDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  const confirmDelete = () => {
    handleDelete(category?._id);
    setModalOpen(false);
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          <img
            src={category?.image}
            alt={category?.name}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{category?.name}</h2>
          <p className="text-base text-secondary">{category?.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => {
              setOpenCreateCategoriesDialog(true); // Open the Edit form dialog
              setCurrentEditedId(category?._id); // Set the current category ID
              setFormData({
                name: category?.name,
                description: category?.description,
                image: category?.image,
              }); // Set the category data for editing
            }}
            className="text-primary border border-primary rounded hover:bg-accent"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setModalOpen(true)}
            className="text-red-600 border border-red-600 rounded hover:bg-red-700"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </div>
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this category?"
      />
    </Card>
  );
}

export default AdminCategoryTile;

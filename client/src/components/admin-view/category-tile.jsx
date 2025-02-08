import React from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

function AdminCategoryTile({
  category,
  setFormData,
  setOpenCreateCategoriesDialog,
  setCurrentEditedId,
  handleDelete,
}) {
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
          className="bg-primary hover:bg-accent"
            onClick={() => {
              setOpenCreateCategoriesDialog(true); // Open the Edit form dialog
              setCurrentEditedId(category?._id); // Set the current category ID
              setFormData({
                name: category?.name,
                description: category?.description,
                image: category?.image,
              }); // Set the category data for editing
            }}
          >
            Edit
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(category?._id)}>Delete</Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminCategoryTile;

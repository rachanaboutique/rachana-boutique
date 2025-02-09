import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Trash2, Edit } from "lucide-react";
import  DeleteConfirmationModal  from "@/components/common/delete-confirmation-modal";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  const confirmDelete = () => {
    handleDelete(product?._id);
    setModalOpen(false);
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            {product?.isNewArrival && (
              <div className="px-2 py-1 rounded-full text-sm font-semibold bg-background text-rose-700">
                New Arrival
              </div>
            )}
            {product?.isFeatured && (
              <div className="px-2 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700">
                Featured
              </div>
            )}
            {product?.isFastMoving && (
              <div className="px-2 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700">
                Fast Moving
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-bold">${product?.salePrice}</span>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
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
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </div>
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this product?"
      />
    </Card>
  );
}

export default AdminProductTile;

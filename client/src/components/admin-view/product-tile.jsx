import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";


function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  // Handle the Edit action by setting the current product in form data and opening the edit dialog
  const handleEdit = (e) => {
    // Prevent propagation to avoid interference with overlay behavior
    e.stopPropagation();
    setOpenCreateProductsDialog(true);
    setCurrentEditedId(product?._id);
    setFormData(product);
  };



  // Confirm deletion and close modal
  const confirmDelete = () => {
    handleDelete(product?._id);
    setModalOpen(false);
  };

  // For admin, clicking the image need not navigate elsewhere, so onClick is prevented.
  return (
    <Card className="w-full max-w-[320px] mx-auto shadow-lg rounded-lg overflow-hidden ">
      {/* Image container with overlay for admin action buttons */}
      <div className="relative group cursor-pointer overflow-hidden">
        <img
          src={product?.image[0]}
          alt={product?.title}
          className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Dynamic Badges */}
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-sm py-1 px-2 rounded">
            Out Of Stock
          </Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-sm py-1 px-2 rounded">
            {`Only ${product?.totalStock} left`}
          </Badge>
        ) : product?.salePrice > 0 ? (
          <>

            {product?.isNewArrival && (
              <div className="absolute top-2 left-2 bg-rose-50 text-rose-700 text-sm py-1 px-2 rounded-full font-semibold">
                New Arrival
              </div>
            )}
            {product?.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-green-50 text-green-700 text-sm py-1 px-2 rounded-full font-semibold">
                Featured
              </Badge>
            )}

          </>
        ) : null}

        {/* Overlay for admin action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="ghost"
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="text-white  rounded bg-foreground hover:bg-accent"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setModalOpen(true)}
            className="text-white bg-red-600 rounded hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product details area */}
      <CardContent className="p-4 bg-white">
        <div className="flex justify-between gap-2 items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {product?.title}
        </h2>
        {product?.productCode && (
          <div className="bg-rose-50 text-rose-700 text-sm py-1 px-2 rounded-full font-semibold">
           Code: {product?.productCode}             </div>
        )}
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className={`${product?.salePrice > 0 ? "line-through text-gray-500" : "text-gray-600"} text-lg font-medium`}>
            ₹{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-semibold text-foreground">
              ₹{product?.salePrice}
            </span>
          )}
        </div>

        {/* Color Inventory Status */}
        {product?.colors && product.colors.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Color Inventory:</h4>
            <div className="flex flex-wrap gap-1">
              {product.colors.map((color, index) => {
                const isOutOfStock = color.inventory <= 0;
                const isLowStock = color.inventory > 0 && color.inventory < 5;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : isLowStock
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}
                    title={`${color.title}: ${color.inventory || 0} items`}
                  >
                    {color.image && (
                      <div className="w-3 h-3 rounded-full overflow-hidden border border-gray-300">
                        <img
                          src={color.image}
                          alt={color.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="truncate max-w-[60px]">{color.title}</span>
                    <span className="font-bold">
                      {isOutOfStock ? '0' : color.inventory || 0}
                    </span>
                    {isOutOfStock && <span className="text-red-600">⚠️</span>}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-2 text-xs text-gray-600">
              {product.colors.filter(c => c.inventory <= 0).length > 0 && (
                <span className="text-red-600 font-medium">
                  {product.colors.filter(c => c.inventory <= 0).length} color(s) out of stock
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

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
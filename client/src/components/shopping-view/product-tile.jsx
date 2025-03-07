import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "../ui/use-toast";

function ShoppingProductTile({ product, handleAddtoCart }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleAddToCartClick = (productId, totalStock) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
    } else {
      handleAddtoCart(productId, totalStock);
    }
  };

  return (
    <Card className="w-full max-w-[320px] mx-auto shadow-lg rounded-none overflow-hidden">
      {/* Image container */}
      <div className="relative group cursor-pointer overflow-hidden" onClick={() => handleViewDetails(product?._id)}>
        <img
          src={product?.image[0]}
          alt={product?.title}
          className="w-full h-[250px] md:h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
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
            <Badge className="absolute top-2 left-2 bg-green-500 text-white text-sm py-1 px-2 rounded">
              Sale
            </Badge>
            {product?.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-green-50 text-green-700 text-sm py-1 px-2 rounded-full font-semibold">
                Featured
              </Badge>
            )}
          </>
        ) : null}

        {/* Overlay for action buttons (Only Visible on Hover in Desktop) */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center gap-4 bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(product?._id);
            }}
            className="bg-foreground hover:bg-accent text-white px-4 py-2 rounded-md shadow"
          >
            View Details
          </Button>
          {product?.totalStock === 0 ? (
            <Button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed shadow"
            >
              Out Of Stock
            </Button>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCartClick(product?._id, product?.totalStock);
              }}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:scale-105 px-4 py-2 rounded-md"
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>

      {/* Product details area */}
      <CardContent className="p-4 bg-white">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 truncate">
          {product?.title}
        </h2>
        <div className="flex justify-between items-center">
          <span className={`${product?.salePrice > 0 ? "line-through text-gray-500" : "text-gray-600"} text-lg font-medium`}>
            ₹{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-semibold text-foreground">
              ₹{product?.salePrice}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ShoppingProductTile;

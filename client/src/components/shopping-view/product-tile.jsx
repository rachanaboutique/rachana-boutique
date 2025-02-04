import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  return (
    <Card className="w-full max-w-[320px] mx-auto shadow-lg rounded-lg overflow-hidden transition-transform transform">
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="relative cursor-pointer"
      >
        <div className="relative group overflow-hidden">
          {/* Product Image */}
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Badges */}
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-sm py-1 px-2 rounded">
            Out Of Stock
          </Badge>
        ) : product?.totalStock < 10 ? (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-sm py-1 px-2 rounded">
            {`Only ${product?.totalStock} left`}
          </Badge>
        ) : product?.salePrice > 0 ? (
          <Badge className="absolute top-2 left-2 bg-green-500 text-white text-sm py-1 px-2 rounded">
            Sale
          </Badge>
        ) : null}
      </div>
      {/* Card Content */}
      <CardContent className="p-4 bg-white">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 truncate">
          {product?.title}
        </h2>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          {/* <span>{categoryOptionsMap[product?.category]}</span>
          <span>{brandOptionsMap[product?.brand]}</span> */}
        </div>
        <div className="flex justify-between items-center">
          <span
            className={`${
              product?.salePrice > 0 ? "line-through" : ""
            } text-lg font-medium text-gray-600`}
          >
            ₹{product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-semibold text-foreground">
              ₹{product?.salePrice}
            </span>
          )}
        </div>
      </CardContent>
      {/* Line */}
      <div className="border-t border-gray-200"></div>
      {/* Card Footer */}
      <CardFooter className="flex items-center gap-2 p-4">
        {product?.totalStock === 0 ? (
          <Button
            className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
            disabled
          >
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full bg-foreground hover:bg-accent text-white"
          >
            Add to Cart
          </Button>
        )}
        <Button
          onClick={() => handleViewDetails(product?._id)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;

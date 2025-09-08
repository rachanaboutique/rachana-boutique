import { Minus, Plus, Trash, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { useToast } from "../ui/use-toast";
import { useState, useRef, useEffect, memo, useMemo, useCallback } from "react";
import { updateTempCartQuantity, removeFromTempCart, changeTempCartColor } from "@/utils/tempCartManager";
import { isTempCartItemOutOfStock } from "@/utils/cartValidation";

// Helper function to format currency
const formatCurrency = (amount) => {
  return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
};

// Helper function to get initial selection based on tempItem and available colors
const getInitialSelection = (tempItem, availableColors) => {
  if (!tempItem?.productDetails?.image) {
    return { defaultColor: null, defaultImage: "default-image-url.jpg" };
  }

  if (availableColors && availableColors.length > 0) {
    // Try to find the exact color that was selected for this temp item
    const matchingColor = availableColors.find(
      (color) => color._id === tempItem.colorId
    );
    const defaultColor = matchingColor || availableColors[0];

    // Use the color's image directly if available
    if (defaultColor?.image) {
      return { defaultColor, defaultImage: defaultColor.image };
    }
  }

  // If no colors available, use the product image
  return { defaultColor: null, defaultImage: tempItem.productDetails.image };
};

const TempCartItemsContent = memo(function TempCartItemsContent({ 
  tempItem, 
  onUpdate 
}) {
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const dropdownRef = useRef(null);

  // Find the product in productList to get available colors
  const currentProduct = useMemo(() => {
    return productList?.find(product => product._id === tempItem.productId);
  }, [productList, tempItem.productId]);

  const availableColors = useMemo(() => {
    return currentProduct?.colors || [];
  }, [currentProduct]);

  // Check if this temp cart item is out of stock
  const isOutOfStock = useMemo(() => {
    return isTempCartItemOutOfStock(tempItem, productList);
  }, [tempItem, productList]);

  // Initialize selected color and image
  const { defaultColor, defaultImage } = useMemo(() => {
    return getInitialSelection(tempItem, availableColors);
  }, [tempItem, availableColors]);

  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update selected color when tempItem changes
  useEffect(() => {
    if (availableColors.length > 0) {
      const matchingColor = availableColors.find(
        (color) => color._id === tempItem.colorId
      );
      if (matchingColor) {
        setSelectedColor(matchingColor);
        setSelectedImage(matchingColor.image || tempItem.productDetails.image);
      }
    }
  }, [tempItem.colorId, availableColors, tempItem.productDetails.image]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle color change
  const handleColorChange = useCallback((color) => {
    setDropdownOpen(false);

    if (selectedColor?._id === color._id) {
      return;
    }

    setIsUpdating(true);
    setSelectedColor(color);
    setSelectedImage(color.image || tempItem.productDetails.image);

    // Update temporary cart with new color using the dedicated function
    const success = changeTempCartColor(
      tempItem.productId,
      tempItem.colorId,
      color._id,
      {
        ...tempItem.productDetails,
        image: color.image || tempItem.productDetails.image
      }
    );

    if (success) {
      toast({
        title: "Color updated successfully",
      });
      onUpdate(); // Refresh the cart
    } else {
      toast({
        title: "Failed to update color",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  }, [tempItem, selectedColor, toast, onUpdate]);

  // Handle quantity change
  const handleQuantityChange = useCallback((newQuantity) => {
    if (newQuantity === tempItem.quantity || newQuantity < 1) {
      return;
    }

    setIsUpdating(true);

    // Use the updated function with inventory validation
    const result = updateTempCartQuantity(
      tempItem.productId,
      tempItem.colorId,
      newQuantity,
      productList // Pass productList for inventory validation
    );

    if (result.success) {
      toast({
        title: result.message,
      });
      onUpdate(); // Refresh the cart
    } else {
      toast({
        title: result.message,
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  }, [tempItem, productList, toast, onUpdate]);

  // Handle delete item
  const handleDeleteItem = useCallback(() => {
    setIsDeleting(true);

    const success = removeFromTempCart(tempItem.productId, tempItem.colorId);

    if (success) {
      toast({
        title: "Item removed from cart",
      });
      onUpdate(); // Refresh the cart
    } else {
      toast({
        title: "Failed to remove item",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setIsDeleting(false);
    }, 300);
  }, [tempItem, toast, onUpdate]);

  const itemPrice = tempItem.productDetails?.salePrice || tempItem.productDetails?.price || 0;
  const totalPrice = itemPrice * tempItem.quantity;

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-gray-100">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
        <img 
          src={selectedImage} 
          alt={tempItem.productDetails?.title || 'Product'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = tempItem.productDetails?.image || "default-image-url.jpg";
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start w-full">
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-medium mb-1 line-clamp-2">
              {tempItem.productDetails?.title || 'Product'}
            </h3>
            {tempItem.productDetails?.productCode && (
              <p className="text-xs text-gray-500 mb-1">
                Code: {tempItem.productDetails.productCode}
              </p>
            )}
          </div>

          {/* Delete Button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-black transition-colors flex-shrink-0 rounded-md hover:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
            onClick={handleDeleteItem}
            disabled={isDeleting}
            aria-label="Remove item"
          >
            {isDeleting ? (
              <span className="w-4 h-4 block animate-pulse">...</span>
            ) : (
              <Trash className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600">
            {formatCurrency(itemPrice)}
            {tempItem.quantity > 1 && <span> × {tempItem.quantity}</span>}
          </p>
          <p className="text-sm font-medium">
            {formatCurrency(totalPrice)}
          </p>
        </div>

        {/* Color Selection and Quantity Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Color Dropdown */}
          {availableColors.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs hover:border-black transition-colors disabled:opacity-50"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={isUpdating}
              >
                {selectedColor && selectedColor.image && (
                  <img
                    src={selectedColor.image}
                    alt={selectedColor.title}
                    className="w-4 h-4 object-cover border border-gray-300 rounded-sm"
                  />
                )}
                <span>{selectedColor?.title || 'Select Color'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
                  {availableColors.map((color) => (
                    <button
                      key={color._id}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                      onClick={() => handleColorChange(color)}
                    >
                      {color.image && (
                        <img
                          src={color.image}
                          alt={color.title}
                          className="w-4 h-4 object-cover border border-gray-300 rounded-sm"
                        />
                      )}
                      <span>{color.title}</span>
                      {color.inventory <= 0 && (
                        <span className="text-red-500 text-xs">(Out of stock)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quantity Controls or Out of Stock Message */}
          <div className="flex items-center gap-1">
            {isOutOfStock ? (
              <div className="px-3 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 font-medium">
                Out of Stock
              </div>
            ) : isUpdating ? (
              <div className="flex items-center justify-center w-24">
                <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
              </div>
            ) : (
              <>
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded touch-manipulation"
                  disabled={tempItem.quantity === 1}
                  onClick={() => handleQuantityChange(tempItem.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm">{tempItem.quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded touch-manipulation"
                  onClick={() => handleQuantityChange(tempItem.quantity + 1)}
                  disabled={selectedColor && selectedColor.inventory <= 0}
                  aria-label={selectedColor && selectedColor.inventory <= 0 ? "Color is out of stock" : "Increase quantity"}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Out of Stock Warning */}
        {selectedColor && selectedColor.inventory <= 0 && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            This color is currently out of stock
          </div>
        )}
      </div>
    </div>
  );
});

export default TempCartItemsContent;

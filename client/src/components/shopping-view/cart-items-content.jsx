
import { Minus, Plus, Trash, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { useState, useRef, useEffect } from "react";

// Helper function to compute initial selection based on cartItem and available colors
const getInitialSelection = (cartItem, availableColors) => {
  if (availableColors.length > 0) {
    const matchingColor = availableColors.find(
      (color) => color._id === cartItem.colors?._id
    );
    const colorIndex = matchingColor ? availableColors.indexOf(matchingColor) : 0;
    const defaultColor = matchingColor || availableColors[0];
    // Calculate image index using provided formula: index * 2
    const desiredImageIndex = colorIndex * 2;
    const defaultImage =
      cartItem?.image && cartItem.image.length > desiredImageIndex
        ? cartItem.image[desiredImageIndex]
        : cartItem?.image?.[0] || "default-image-url.jpg";
    return { defaultColor, defaultImage };
  }
  return { defaultColor: null, defaultImage: cartItem?.image?.[0] || "default-image-url.jpg" };
};

function UserCartItemsContent({ cartItem }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { productList } = useSelector((state) => state.shopProducts);
  const dropdownRef = useRef(null);

  // Find the product in productList to get available colors
  const currentProduct = productList.find(
    (product) => product._id === cartItem.productId
  );
  const availableColors = currentProduct?.colors || [];

  // Initialize state by computing defaults using our helper function
  const { defaultColor, defaultImage } = getInitialSelection(cartItem, availableColors);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(defaultImage);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle color change from dropdown selection
  const handleColorChange = (color, index) => {
    setSelectedColor(color);
    setDropdownOpen(false);

    // Calculate desired image index based on the index of the selected color
    const desiredImageIndex = index * 2;
    if (cartItem?.image && cartItem.image.length > desiredImageIndex) {
      setSelectedImage(cartItem.image[desiredImageIndex]);
    } else {
      setSelectedImage(cartItem?.image?.[0] || "default-image-url.jpg");
    }

    // Update cart with the selected color
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        quantity: cartItem?.quantity,
        colorId: color._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart updated successfully" });
        dispatch(fetchCartItems(user?.id));
      }
    });
  };

  const handleQuantityChange = (newQuantity) => {
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        quantity: newQuantity,
        colorId: selectedColor?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart updated successfully" });
        dispatch(fetchCartItems(user?.id)); // Fetch updated cart
      }
    });
  };

  const handleCartItemDelete = () => {
    dispatch(deleteCartItem({ userId: user?.id, productId: cartItem?.productId })).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Cart item deleted successfully" });
        dispatch(fetchCartItems(user?.id)); // Fetch updated cart
      }
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="flex flex-col w-full border-b border-gray-200 last:border-b-0 py-4 px-2">
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={selectedImage || "default-image-url.jpg"}
            alt={cartItem?.title || "Product"}
            className="w-full h-full object-cover border border-gray-200"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start w-full">
            <h3 className="text-sm font-medium mb-1 line-clamp-2 pr-6">{cartItem?.title}</h3>

            {/* Delete Button - Top Right */}
            <button
              className="p-1 text-gray-400 hover:text-black transition-colors flex-shrink-0"
              onClick={handleCartItemDelete}
              aria-label="Remove item"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price */}
          <p className="text-sm font-medium mb-2">
            {formatCurrency((cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price || 0) * cartItem?.quantity)}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            {/* Color Selection */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-28 px-2 py-1 border border-gray-300 rounded-sm hover:border-black transition-colors"
                disabled={availableColors.length === 0}
              >
                <div className="flex items-center gap-1.5">
                  {selectedColor?.image ? (
                    <div className="relative w-4 h-4 overflow-hidden rounded-sm border border-gray-300">
                      <img
                        src={selectedColor.image}
                        alt={selectedColor.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-sm border border-gray-300"
                      style={{ backgroundColor: selectedColor?.colorCode || '#ccc' }}
                    ></div>
                  )}
                  <span className="text-xs uppercase tracking-wide truncate">{selectedColor?.title || "Color"}</span>
                </div>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>

              {dropdownOpen && availableColors.length > 0 && (
                <div className="absolute left-0 w-40 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-2 pb-1 mb-1 border-b border-gray-100">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Select Color</span>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                      {availableColors.map((color, index) => (
                        <div
                          key={color._id}
                          onClick={() => handleColorChange(color, index)}
                          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative flex items-center">
                            {color.image ? (
                              <div className="relative w-6 h-6 overflow-hidden rounded-sm border border-gray-200">
                                <img
                                  src={color.image}
                                  alt={color.title}
                                  className="w-full h-full object-cover"
                                />
                                {selectedColor?._id === color._id && (
                                  <div className="absolute inset-0 border-2 border-black"></div>
                                )}
                              </div>
                            ) : (
                              <div
                                className={`w-6 h-6 rounded-sm ${selectedColor?._id === color._id ? 'border-2 border-black' : 'border border-gray-300'}`}
                                style={{ backgroundColor: color?.colorCode || '#ccc' }}
                              ></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs uppercase tracking-wide block truncate">{color.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1">
              <button
                className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cartItem?.quantity === 1}
                onClick={() => handleQuantityChange(cartItem?.quantity - 1)}
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="w-6 text-center text-xs">{cartItem?.quantity}</span>
              <button
                className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
                onClick={() => handleQuantityChange(cartItem?.quantity + 1)}
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;


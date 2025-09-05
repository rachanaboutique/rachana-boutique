import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import UserCartItemsContent from "./cart-items-content";
import TempCartItemsContent from "./temp-cart-items-content";
import { memo } from "react";
import { useSelector } from "react-redux";
import { getTempCartItems, getTempCartTotal, getTempCartCount } from "@/utils/tempCartManager";

// Custom overlay component
const CartOverlay = memo(({ isOpen, onClose }) => {
  // Close the cart when clicking on the overlay
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    />
  );
});

// Custom cart drawer component
const CustomCartDrawer = memo(function CustomCartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  isLoading
}) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempCartItems, setTempCartItems] = useState([]);
  const drawerRef = useRef(null);
  const prevCartLength = useRef(cartItems.length);

  // Get authentication status
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Track if this is the initial load or a subsequent update
  const isInitialLoad = useRef(true);

  // Function to refresh temporary cart items
  const refreshTempCart = () => {
    if (!isAuthenticated) {
      const tempItems = getTempCartItems();
      setTempCartItems(tempItems);
    } else {
      // Clear temp cart items when authenticated
      setTempCartItems([]);
    }
  };

  // Load temporary cart items when drawer opens or authentication changes
  useEffect(() => {
    if (isOpen) {
      // If drawer is opening, mark as initial load
      isInitialLoad.current = true;

      // Force refresh temp cart items when drawer opens
      refreshTempCart();
    }
  }, [isOpen, isAuthenticated]);

  // Separate effect to handle authentication state changes
  useEffect(() => {
    // Always refresh temp cart when authentication state changes
    refreshTempCart();

    // Force a small delay to ensure localStorage is accessible
    setTimeout(() => {
      refreshTempCart();
    }, 50);
  }, [isAuthenticated]);

  // Listen for temp cart updates
  useEffect(() => {
    const handleTempCartUpdate = () => {
      if (!isAuthenticated) {
        refreshTempCart();
      }
    };

    // Listen for custom temp cart update events
    window.addEventListener('tempCartUpdated', handleTempCartUpdate);

    return () => {
      window.removeEventListener('tempCartUpdated', handleTempCartUpdate);
    };
  }, [isAuthenticated]);

  // Track cart updates with debounce to prevent flickering
  // Only show loading state if it persists for more than a short delay
  useEffect(() => {
    let timer;

    // Check if cart length has changed to determine if this is an update or initial load
    const cartLengthChanged = prevCartLength.current !== cartItems.length;
    prevCartLength.current = cartItems.length;

    // If cart length changed, this is definitely not an initial load
    if (cartLengthChanged) {
      isInitialLoad.current = false;
    }

    // If we have cart items, we're ready for checkout regardless of loading state
    const hasCartItems = cartItems.length > 0;

    if (isLoading) {
      // Only show loading indicator for updates, not initial loads
      // or if the loading persists for a while
      timer = setTimeout(() => {
        // Only show updating message for non-initial loads or if loading takes too long
        // But don't show it if we're just opening the cart with items already in it
        if ((!isInitialLoad.current && cartLengthChanged) || cartItems.length === 0) {
          setIsUpdating(true);
        }
      }, 400); // Only show loading if it takes longer than 400ms
    } else {
      // When loading completes, mark as not initial load and hide updating message
      isInitialLoad.current = false;

      // When loading completes, remove the indicator after a short delay
      timer = setTimeout(() => {
        setIsUpdating(false);
      }, 200);
    }

    return () => clearTimeout(timer);
  }, [isLoading, cartItems.length]);

  // Calculate total with proper type conversion and error handling
  // Use useMemo to prevent recalculation on every render
  const { formattedTotal, totalItems } = useMemo(() => {
    // Calculate regular cart total
    const cartTotal = cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
          // Get the price (sale price if available, otherwise regular price)
          const itemPrice = currentItem?.salePrice > 0
            ? parseFloat(currentItem.salePrice)
            : parseFloat(currentItem?.price || 0);

          // Get the quantity with fallback to 0
          const itemQuantity = parseInt(currentItem?.quantity || 0, 10);

          // Calculate item total and add to sum
          return sum + (itemPrice * itemQuantity);
        }, 0)
      : 0;

    // Calculate temporary cart total for non-authenticated users
    const tempTotal = !isAuthenticated ? getTempCartTotal() : 0;

    // Combine totals
    const total = cartTotal + tempTotal;
    const itemCount = cartItems.length + tempCartItems.length;

    return {
      totalCartAmount: total,
      formattedTotal: total.toFixed(2),
      totalItems: itemCount
    };
  }, [cartItems, tempCartItems, isAuthenticated]);

  // Memoize the checkout handler to prevent unnecessary re-renders
  const handleCheckout = useMemo(() => {
    return () => {
      // If we have items in the cart (regular or temporary), proceed to checkout
      if (cartItems.length > 0 || tempCartItems.length > 0) {
        navigate("/shop/checkout");
        onClose();
      }
    };
  }, [navigate, onClose, cartItems.length, tempCartItems.length]);

  // Memoize cart items to prevent unnecessary re-renders
  const cartItemElements = useMemo(() => {
    const hasRegularItems = cartItems && cartItems.length > 0;
    const hasTempItems = tempCartItems && tempCartItems.length > 0;

    if (!hasRegularItems && !hasTempItems) {
      return <p className="text-center text-gray-500">Your cart is empty</p>;
    }

    const elements = [];

    // Add regular cart items for authenticated users
    if (hasRegularItems) {
      cartItems.forEach((item) => {
        elements.push(
          <UserCartItemsContent
            key={`${item.productId}-${item.colors?._id || 'default'}`}
            cartItem={item}
          />
        );
      });
    }

    // Add temporary cart items for non-authenticated users
    if (hasTempItems && !isAuthenticated) {
      if (hasRegularItems) {
        elements.push(
          <div key="temp-cart-header" className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-3">Temporary items:</p>
          </div>
        );
      }

      tempCartItems.forEach((item, index) => {
        elements.push(
          <TempCartItemsContent
            key={`temp-${item.productId}-${item.colorId || 'default'}-${index}`}
            tempItem={item}
            onUpdate={refreshTempCart}
          />
        );
      });
    }

    return elements;
  }, [cartItems, tempCartItems, isAuthenticated]);

  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Create portal for the drawer
  return createPortal(
    <>
      <CartOverlay isOpen={isOpen} onClose={onClose} />
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-playground p-4 shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex flex-col space-y-2 text-center sm:text-left">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Your Cart</h2>
            <button
              onClick={onClose}
              className="cart-close-button p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              aria-label="Close cart"
            >
              <X className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Only show updating message when items are being modified, not on initial load */}
          {isUpdating && !isInitialLoad.current && cartItems.length > 0 && (
            <div className="flex items-center justify-center w-full mt-2 mb-1">
              <div className="h-[1px] bg-black/10 w-full relative overflow-hidden">
                <div className="h-full bg-black absolute animate-loading-bar"></div>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap px-2">Updating cart</span>
              <div className="h-[1px] bg-black/10 w-full relative overflow-hidden">
                <div className="h-full bg-black absolute animate-loading-bar"></div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="mt-6 space-y-4 min-h-[200px]">
          {/* Show loading spinner only when cart is empty and we're fetching initial data */}
          {isLoading && cartItems.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-8">
              <div className="mb-4 h-10 w-10 border-2 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading your cart...</p>
            </div>
          ) : (
            /* Otherwise show cart items - they'll update automatically when data changes */
            cartItemElements
          )}
        </div>

        {/* Total */}
        <div className="mt-8 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{formattedTotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>₹{formattedTotal}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cartItems.length === 0 && tempCartItems.length === 0}
          className="w-full mt-6 px-6 py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors duration-300 uppercase tracking-wider text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Only show loading state in the button when we're actually processing a checkout */}
          {isUpdating && (cartItems.length > 0 || tempCartItems.length > 0) ? (
            <span className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              Checkout
            </span>
          ) : (
            "Checkout"
          )}
        </button>
      </div>
    </>,
    document.body
  );
});

export default CustomCartDrawer;
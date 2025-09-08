import Address from "@/components/shopping-view/address";
import img from "../../assets/jamandi.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import TempCartItemsContent from "@/components/shopping-view/temp-cart-items-content";
import { useState, useEffect } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "../../components/ui/loader";
import { Helmet } from "react-helmet-async";
import { MapPin, CreditCard, LogIn } from "lucide-react";
import { getTempCartItems, getTempCartTotal, clearTempCart } from "@/utils/tempCartManager";
import { addToCart } from "@/store/shop/cart-slice";
import { ShoppingCart as ShoppingBag } from "lucide-react";
import { getStateNameByCode } from "@/utils/locationUtils";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { runCartDebug } from "@/utils/cartDebugHelper";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { productList } = useSelector((state) => state.shopProducts);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [razorpayInstance, setRazorpayInstance] = useState(null);
  const { isPaymentLoading } = useSelector((state) => state.shopOrder);
  const [tempCartItems, setTempCartItems] = useState([]);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate total with proper type conversion and error handling
  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
        // Get the price (sale price if available, otherwise regular price)
        const itemPrice = currentItem?.salePrice > 0
          ? parseFloat(currentItem.salePrice)
          : parseFloat(currentItem?.price || 0);

        // Get the quantity with fallback to 0
        const itemQuantity = parseInt(currentItem?.quantity || 0, 10);

        // Calculate item total and add to sum
        const itemTotal = itemPrice * itemQuantity;




        return sum + itemTotal;
      }, 0)
      : 0;

  // Format the total to 2 decimal places for display
  const formattedTotal = totalCartAmount.toFixed(2);

  // Load temporary cart items on component mount
  useEffect(() => {
    const tempItems = getTempCartItems();
    setTempCartItems(tempItems);
  }, []);

  // Auto-select address if user has only one address
  useEffect(() => {
    if (isAuthenticated && addressList && addressList.length === 1 && !currentSelectedAddress) {
      setCurrentSelectedAddress(addressList[0]);
    }
  }, [isAuthenticated, addressList, currentSelectedAddress]);

  // Refresh product data when checkout page loads to ensure latest inventory
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({}));
  }, [dispatch]);

  // Calculate temporary cart total
  const tempCartTotal = getTempCartTotal();

  // Function to validate inventory before placing order
  const validateInventory = () => {
    const errors = [];

    // Run comprehensive debug to understand data structure
    runCartDebug({ cartItems, tempCartItems, productList });

    // Debug: Log cart items structure to understand data format
    console.log('🔍 Validating inventory for cart items:', cartItems);
    if (cartItems.length > 0) {
      console.log('🔍 First cart item structure:', cartItems[0]);
    }

    if (isAuthenticated && cartItems.length > 0) {
      // Validate actual cart items
      cartItems.forEach((item, index) => {
        // Enhanced debugging for title issue
        console.log(`🔍 Cart item ${index}:`, {
          title: item.title,
          productId: item.productId,
          hasColors: !!item.colors,
          colorTitle: item.colors?.title,
          quantity: item.quantity,
          productColors: item.productColors,
          totalStock: item.totalStock,
          fullItem: item
        });

        // Get product title with multiple fallbacks, including from productList
        const productFromList = productList.find(p => p._id === item.productId);
        const productTitle = item.title ||
                           item.productTitle ||
                           item.name ||
                           productFromList?.title ||
                           `Product ${item.productId || 'Unknown'}`;

        if (item.colors && item.colors._id) {
          // For items with colors, check against color inventory
          const availableInventory = item.productColors
            ? item.productColors.find(color => color._id === item.colors._id)?.inventory || 0
            : item.colors.inventory || 0;

          console.log(`🔍 Color inventory check:`, {
            productTitle,
            colorTitle: item.colors.title,
            requestedQuantity: item.quantity,
            availableInventory
          });

          if (item.quantity > availableInventory) {
            const colorTitle = item.colors.title || 'Selected Color';
            if (availableInventory === 0) {
              errors.push(`Sorry, "${productTitle}" in ${colorTitle} is currently out of stock.`);
            } else {
              errors.push(`Sorry, only ${availableInventory} item${availableInventory === 1 ? '' : 's'} of "${productTitle}" in ${colorTitle} ${availableInventory === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
            }
          }
        } else {
          // For items without colors OR items with colors but no color selected
          // Check if this product actually has colors in the product list
          const productFromList = productList.find(p => p._id === item.productId);

          // Also check if the cart item has productColors data (more reliable)
          const hasColorsInCartItem = item.productColors && item.productColors.length > 0;
          const hasColorsInProductList = productFromList?.colors && productFromList.colors.length > 0;

          console.log(`🔍 Color data analysis:`, {
            productTitle,
            hasColorsInCartItem,
            hasColorsInProductList,
            cartItemProductColors: item.productColors?.length || 0,
            productListColors: productFromList?.colors?.length || 0,
            cartItemHasColors: !!item.colors,
            cartItemColorId: item.colors?._id,
            // Additional debugging
            productColorsData: item.productColors,
            productListColorsData: productFromList?.colors,
            totalStock: item.totalStock
          });

          if (hasColorsInCartItem) {
            // Use cart item's productColors data (most reliable)
            const totalAvailableStock = item.productColors.reduce((sum, color) => sum + (color.inventory || 0), 0);

            console.log(`🔍 Using cart item productColors:`, {
              productTitle,
              requestedQuantity: item.quantity,
              totalAvailableStock,
              colorsCount: item.productColors.length,
              colorInventories: item.productColors.map(c => ({ title: c.title, inventory: c.inventory }))
            });

            if (item.quantity > totalAvailableStock) {
              if (totalAvailableStock === 0) {
                errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
              } else {
                errors.push(`Sorry, only ${totalAvailableStock} item${totalAvailableStock === 1 ? '' : 's'} of "${productTitle}" ${totalAvailableStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
              }
            }
          } else if (hasColorsInProductList) {
            // Fallback to product list colors
            const totalAvailableStock = productFromList.colors.reduce((sum, color) => sum + (color.inventory || 0), 0);

            console.log(`🔍 Using product list colors:`, {
              productTitle,
              requestedQuantity: item.quantity,
              totalAvailableStock,
              colorsCount: productFromList.colors.length,
              colorInventories: productFromList.colors.map(c => ({ title: c.title, inventory: c.inventory }))
            });

            if (item.quantity > totalAvailableStock) {
              if (totalAvailableStock === 0) {
                errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
              } else {
                errors.push(`Sorry, only ${totalAvailableStock} item${totalAvailableStock === 1 ? '' : 's'} of "${productTitle}" ${totalAvailableStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
              }
            }
          } else {
            // Product truly has no colors, check total stock
            // Use current product list data instead of potentially stale cart item data
            const totalStock = productFromList?.totalStock || item.totalStock || 0;

            console.log(`🔍 Product without colors - total stock check:`, {
              productTitle,
              requestedQuantity: item.quantity,
              totalStock,
              cartItemTotalStock: item.totalStock,
              productListTotalStock: productFromList?.totalStock,
              usingSource: productFromList?.totalStock !== undefined ? 'productList' : 'cartItem'
            });

            if (item.quantity > totalStock) {
              if (totalStock === 0) {
                errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
              } else {
                errors.push(`Sorry, only ${totalStock} item${totalStock === 1 ? '' : 's'} of "${productTitle}" ${totalStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
              }
            }
          }
        }
      });
    } else if (!isAuthenticated && tempCartItems.length > 0) {
      // Validate temp cart items against productList
      tempCartItems.forEach((tempItem, index) => {
        const product = productList.find(p => p._id === tempItem.productId);

        // Enhanced debugging for temp cart items
        console.log(`🔍 Temp cart item ${index}:`, {
          productId: tempItem.productId,
          productDetailsTitle: tempItem.productDetails?.title,
          productTitle: product?.title,
          colorId: tempItem.colorId,
          quantity: tempItem.quantity
        });

        const productTitle = tempItem.productDetails?.title ||
                           product?.title ||
                           `Product ${tempItem.productId || 'Unknown'}`;

        if (product && tempItem.colorId) {
          const color = product.colors?.find(c => c._id === tempItem.colorId);
          if (color && tempItem.quantity > color.inventory) {
            const colorTitle = color.title || 'Selected Color';
            if (color.inventory === 0) {
              errors.push(`Sorry, "${productTitle}" in ${colorTitle} is currently out of stock.`);
            } else {
              errors.push(`Sorry, only ${color.inventory} item${color.inventory === 1 ? '' : 's'} of "${productTitle}" in ${colorTitle} ${color.inventory === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
            }
          }
        } else if (product && !tempItem.colorId) {
          // For temp cart items without colors
          const totalStock = product.colors && product.colors.length > 0
            ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
            : product.totalStock || 0;

          if (tempItem.quantity > totalStock) {
            if (totalStock === 0) {
              errors.push(`Sorry, "${productTitle}" is currently out of stock.`);
            } else {
              errors.push(`Sorry, only ${totalStock} item${totalStock === 1 ? '' : 's'} of "${productTitle}" ${totalStock === 1 ? 'is' : 'are'} available. Please reduce the quantity.`);
            }
          }
        }
      });
    }

    // Log final errors for debugging
    if (errors.length > 0) {
      console.log('🚨 Inventory validation errors:', errors);
    }

    return errors;
  };



  // Function to reset payment state
  const resetPaymentState = () => {
    setIsPaymentStart(false);
    setRazorpayInstance(null);
  };

  // Handle window beforeunload event to reset payment state
  window.addEventListener('beforeunload', resetPaymentState);

  function handleInitiateRazorpayPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Validate inventory before proceeding
    const inventoryErrors = validateInventory();
    if (inventoryErrors.length > 0) {
      toast({
        title: "Unable to Complete Order",
        description: inventoryErrors[0], // Show first error with user-friendly message
        variant: "destructive",
      });
      return;
    }

    setIsPaymentStart(true);

    const orderData = {
      userId: user?.id,
      email: user?.email,
      cartId: cartItems?._id,
      cartItems: cartItems.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image[0],
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
        productCode: item?.productCode || null,
        colors: item?.colors ? {
          _id: item.colors._id,
          title: item.colors.title,
          image: item.colors.image
        } : null,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        state: currentSelectedAddress?.state || "",
        city: currentSelectedAddress?.city || "",
        pincode: currentSelectedAddress?.pincode || "",
        phone: currentSelectedAddress?.phone || "",
      },
      totalAmount: totalCartAmount,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        const { razorpayOrderId, amount, currency } = data.payload;

        // Check if Razorpay is available in the global scope
        if (typeof window.Razorpay === "undefined") {
          toast({
            title: "Razorpay SDK is not loaded. Please refresh the page.",
            variant: "destructive",
          });
          setIsPaymentStart(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: "Rachana Boutique",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: function (response) {
            dispatch(
              capturePayment({
                paymentId: response.razorpay_payment_id,
                orderId: data.payload.orderId,
              })
            ).then((captureResponse) => {
              if (captureResponse?.payload?.success) {
                // Set payment success flags for protected route access
                sessionStorage.setItem('paymentSuccess', 'true');
                sessionStorage.setItem('recentPaymentTimestamp', Date.now().toString());

                toast({
                  title: "Payment successful! Redirecting to the success page...",
                  variant: "success",
                });
                navigate("/shop/payment-success");
              } else {
                toast({
                  title: "Payment was successful, but order confirmation failed. Please contact support.",
                  variant: "destructive",
                });
                resetPaymentState();
              }
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: "#000000",
          },
        };

        try {
          // Create and store the Razorpay instance
          const razorpay = new window.Razorpay(options);
          setRazorpayInstance(razorpay);

          // Open the payment modal
          razorpay.open();

          // Handle payment failure
          razorpay.on("payment.failed", function (response) {
            toast({
              title: "Payment failed. Please try again.",
              description: response.error.description,
              variant: "destructive",
            });
            resetPaymentState();
          });

          // Handle modal close event
          razorpay.on("modal.close", function () {
            // Reset payment state when modal is closed without completing payment
            resetPaymentState();
            toast({
              title: "Payment process was cancelled.",
              variant: "warning",
            });
          });

          // Set a safety timeout to reset the state if other handlers fail
          setTimeout(() => {
            // Check if payment is still in progress after 5 minutes
            if (isPaymentStart) {
              resetPaymentState();
              toast({
                title: "Payment process timed out.",
                description: "Please try again.",
                variant: "warning",
              });
            }
          }, 5 * 60 * 1000); // 5 minutes timeout
        } catch (error) {
          console.error("Razorpay error:", error);
          resetPaymentState();
          toast({
            title: "Payment initialization failed.",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Order creation failed. Please try again.",
          variant: "destructive",
        });
        setIsPaymentStart(false);
      }
    });
  }

  // Cleanup effect to reset payment state when component unmounts
  useEffect(() => {
    return () => {
      if (razorpayInstance) {
        // Try to close the Razorpay modal if it's open
        try {
          razorpayInstance.close();
        } catch (error) {
          console.error("Error closing Razorpay instance:", error);
        }
      }
      resetPaymentState();
      window.removeEventListener('beforeunload', resetPaymentState);
    };
  }, [razorpayInstance]);

  if (isPaymentLoading) return <Loader />;

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Rachana Boutique</title>
        <meta name="description" content="Complete your purchase at Rachana Boutique. Secure checkout process for your selected items." />
      </Helmet>

      <div className="bg-white">
        {/* Banner */}
        <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
          <img
            src={img}
            alt="Checkout"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">
                Checkout
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>



        {/* Checkout Content */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Checkout Steps */}
            <div className="mb-12">
              <div className="flex justify-between items-center max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide">Cart</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide">Address</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-wide">Payment</span>
                </div>
              </div>
            </div>

            {/* Sign In Section for Non-Authenticated Users */}
            {!isAuthenticated && tempCartItems.length > 0 && (
              <div className="mb-8 bg-white border border-gray-200 p-6 md:p-8 rounded-md shadow-sm">
                <div className="text-center">
                  <LogIn className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-light uppercase tracking-wide mb-4 text-gray-900">
                    Sign In to Continue
                  </h2>
                  <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>
                  <p className="text-gray-700 mb-6">
                    You have {tempCartItems.length} item{tempCartItems.length > 1 ? 's' : ''} in your cart.
                    Please sign in to complete your purchase.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/auth/login?redirect=checkout')}
                      className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate('/auth/register?redirect=checkout')}
                      className="px-8 py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                    >
                      Create Account
                    </button>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Your Cart Items:</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {tempCartItems.map((item, index) => (
                        <TempCartItemsContent
                          key={`checkout-temp-${item.productId}-${item.colorId || 'default'}-${index}`}
                          tempItem={item}
                          onUpdate={() => {
                            // Refresh temp cart items
                            const updatedItems = getTempCartItems();
                            setTempCartItems(updatedItems);
                          }}
                        />
                      ))}
                    </div>
                    <div className="border-t border-gray-300 pt-4 mt-4">
                      <div className="flex justify-between text-lg font-medium text-gray-900">
                        <span>Total:</span>
                        <span>₹{tempCartTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Main Content - Only show if authenticated */}
            {isAuthenticated && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Address Selection */}
                <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-md shadow-sm">
                  <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Shipping Address</h2>
                  <div className="w-16 h-0.5 bg-black mb-6"></div>
                  <Address
                    setCurrentSelectedAddress={setCurrentSelectedAddress}
                    selectedId={currentSelectedAddress}
                  />

              </div>

              {/* Right Side: Order Summary */}
              <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-md shadow-sm">
                <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Order Summary</h2>
                <div className="w-16 h-0.5 bg-black mb-6"></div>

                {/* Cart Items */}
                <div className="space-y-4 mb-8">
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                      <UserCartItemsContent key={index} cartItem={item} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Your cart is empty
                    </div>
                  )}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
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
                <div className="mt-8">
                  <button
                    onClick={handleInitiateRazorpayPayment}
                    disabled={isPaymentStart || cartItems.length === 0}
                    className="w-full px-8 py-4 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors duration-300 uppercase tracking-wider text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaymentStart ? "Processing Payment..." : "Proceed to Payment"}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    By proceeding, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ShoppingCheckout;

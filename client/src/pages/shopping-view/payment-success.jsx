import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Package, Home, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { purchaseEvent } from "@/utils/metaPixelEvents";
import { getOrderDetails } from "@/store/shop/order-slice";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderDetails } = useSelector((state) => state.shopOrder);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  // Enhanced purchase tracking with order details fetching
  useEffect(() => {
    const trackPurchaseEvent = async () => {
      // Prevent duplicate tracking
      if (purchaseTracked) return;

      let finalOrderDetails = orderDetails;

      // If no order details in state, try to get from session storage
      if (!finalOrderDetails || !finalOrderDetails.orderItems) {
        const sessionOrderId = sessionStorage.getItem('currentOrderId');
        if (sessionOrderId) {
          try {
            const orderIdParsed = JSON.parse(sessionOrderId);
            const orderResponse = await dispatch(getOrderDetails(orderIdParsed));
            if (orderResponse?.payload?.success) {
              finalOrderDetails = orderResponse.payload.data;
            }
          } catch (error) {
            console.error('Error fetching order details:', error);
          }
        }
      }

      // Track purchase with comprehensive data
      if (finalOrderDetails && finalOrderDetails.orderItems && finalOrderDetails.orderItems.length > 0) {
        const totalValue = finalOrderDetails.totalAmount || 0;
        const contentIds = finalOrderDetails.orderItems.map(item => item.productId);
        const numItems = finalOrderDetails.orderItems.reduce((total, item) => total + item.quantity, 0);

        purchaseEvent({
          content_ids: contentIds,
          content_type: 'product',
          value: totalValue,
          currency: 'INR',
          num_items: numItems,
          transaction_id: finalOrderDetails._id
        });

        console.log('Meta Pixel: Purchase event tracked with full details', {
          orderId: finalOrderDetails._id,
          totalValue,
          numItems,
          contentIds,
          orderItems: finalOrderDetails.orderItems
        });
      } else {
        // Fallback purchase tracking
        purchaseEvent({
          content_type: 'product',
          currency: 'INR',
          value: 0
        });

        console.log('Meta Pixel: Purchase event tracked (fallback - no order details)');
      }

      setPurchaseTracked(true);

      // Clean up session storage after successful tracking
      setTimeout(() => {
        sessionStorage.removeItem('currentOrderId');
      }, 5000);
    };

    // Track purchase event with a delay to ensure all data is loaded and page is ready
    const timeoutId = setTimeout(trackPurchaseEvent, 1000);

    return () => clearTimeout(timeoutId);
  }, [orderDetails, dispatch, purchaseTracked]);

  return (
    <>
      <Helmet>
        <title>Payment Successful | Rachana Boutique</title>
        <meta name="description" content="Your payment has been successfully processed. Thank you for shopping with Rachana Boutique." />
      </Helmet>

      <div className="bg-white min-h-[80vh] flex flex-col">
        {/* Page Header */}
        <div className="mt-12 bg-gray-50 py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-light uppercase tracking-wide text-center mb-2">Payment Successful</h1>
            <div className="w-16 h-0.5 bg-black mx-auto"></div>
          </div>
        </div>

     x

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Thank You For Your Order</h2>
              <div className="w-12 h-0.5 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600 mb-8">
                Your payment has been successfully processed. We'll send you a confirmation email with your order details shortly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/shop/account")}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black bg-qhite text-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                <Package className="h-4 w-4" />
                <span>View Orders</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccessPage;

# Meta Pixel AddToCart & Purchase Event Implementation

## 🎯 Issue Resolved

**Problem**: Meta Pixel `AddToCart` and `Purchase` events were not being captured because they were only tracked automatically by route changes, not by actual user actions.

**Solution**: Implemented proper event tracking by integrating Meta Pixel events into the actual cart and purchase functions throughout the application.

## 🔧 Implementation Details

### **AddToCart Event Tracking** ✅

Added `trackAddToCart()` calls to all components where users can add items to cart:

#### 1. **Listing Page** (`pages/shopping-view/listing.jsx`)
```javascript
// Added import
import { useMetaPixelCart } from "@/hooks/useMetaPixelCart";

// Added hook usage
const { trackAddToCart } = useMetaPixelCart();

// Added tracking in handleAddToCart function
if (data?.payload?.success) {
  // Track Meta Pixel AddToCart event
  trackAddToCart(productId, colorId, 1);
  
  // Existing success handling...
}
```

#### 2. **Product Details Page** (`pages/shopping-view/product-details-page.jsx`)
```javascript
// Added import and hook usage
import { useMetaPixelCart } from "@/hooks/useMetaPixelCart";
const { trackAddToCart } = useMetaPixelCart();

// Added tracking in handleAddToCart function
if (data?.payload?.success) {
  // Track Meta Pixel AddToCart event
  trackAddToCart(currentProductId, selectedColor?._id, quantity);
  
  // Existing success handling...
}
```

#### 3. **Search Page** (`pages/shopping-view/search.jsx`)
```javascript
// Added import and hook usage
import { useMetaPixelCart } from "@/hooks/useMetaPixelCart";
const { trackAddToCart } = useMetaPixelCart();

// Added tracking in handleAddToCart function
if (data?.payload?.success) {
  // Track Meta Pixel AddToCart event
  trackAddToCart(getCurrentProductId, colorId, 1);
  
  // Existing success handling...
}
```

#### 4. **New Arrivals Page** (`pages/shopping-view/new-arrivals.jsx`)
```javascript
// Added import and hook usage
import { useMetaPixelCart } from "@/hooks/useMetaPixelCart";
const { trackAddToCart } = useMetaPixelCart();

// Added tracking in handleAddToCart function
if (data?.payload?.success) {
  // Track Meta Pixel AddToCart event
  trackAddToCart(productId, colorId, 1);
  
  // Existing success handling...
}
```

### **Purchase Event Tracking** ✅

#### **Payment Success Page** (`pages/shopping-view/payment-success.jsx`)
```javascript
// Added imports
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { purchaseEvent } from "@/utils/metaPixelEvents";

// Added purchase tracking
const { orderDetails } = useSelector((state) => state.shopOrder);

useEffect(() => {
  // Track purchase with order details if available
  if (orderDetails && orderDetails.orderItems) {
    const totalValue = orderDetails.totalAmount || 0;
    const contentIds = orderDetails.orderItems.map(item => item.productId);
    const numItems = orderDetails.orderItems.reduce((total, item) => total + item.quantity, 0);
    
    purchaseEvent({
      content_ids: contentIds,
      content_type: 'product',
      value: totalValue,
      currency: 'INR',
      num_items: numItems,
      transaction_id: orderDetails._id
    });
  } else {
    // Fallback purchase tracking
    purchaseEvent({
      content_type: 'product',
      currency: 'INR'
    });
  }
}, [orderDetails]);
```

## 📊 **Event Data Captured**

### **AddToCart Events Include:**
- `content_ids`: Product ID(s) added to cart
- `content_type`: 'product'
- `value`: Product price × quantity
- `currency`: 'INR'
- `content_name`: Product title
- `content_category`: Product category
- `num_items`: Quantity added

### **Purchase Events Include:**
- `content_ids`: All product IDs in the order
- `content_type`: 'product'
- `value`: Total order amount
- `currency`: 'INR'
- `num_items`: Total quantity of items
- `transaction_id`: Order ID

## 🔄 **Event Flow**

### **AddToCart Flow:**
1. User clicks "Add to Cart" button
2. Redux action `addToCart()` is dispatched
3. If successful → `trackAddToCart()` is called
4. Meta Pixel `fbq('track', 'AddToCart', {...})` fires
5. Event is sent to Facebook with product details

### **Purchase Flow:**
1. User completes payment successfully
2. User is redirected to `/shop/payment-success`
3. `PaymentSuccessPage` component mounts
4. `useEffect` checks for order details
5. `purchaseEvent()` is called with order data
6. Meta Pixel `fbq('track', 'Purchase', {...})` fires
7. Event is sent to Facebook with order details

## 🧪 **Testing & Verification**

### **Browser Console Logs:**
```javascript
// AddToCart events
Meta Pixel: AddToCart tracked {content_ids: ["123"], value: 29.99, currency: "INR"}

// Purchase events  
Meta Pixel: Purchase event tracked {orderId: "order_123", totalValue: 89.97, numItems: 3}
```

### **Meta Pixel Helper Extension:**
- Shows `AddToCart` events when items are added to cart
- Shows `Purchase` events on payment success page
- Displays event parameters for verification

### **Events Manager:**
- Real-time events appear in Meta Events Manager
- Test Events tab shows live event data
- Conversion tracking data is available for ads

## 🎯 **Key Benefits**

1. **Accurate Tracking**: Events fire only when actual actions occur
2. **Rich Data**: Includes product details, prices, quantities
3. **Conversion Optimization**: Facebook can optimize for actual purchases
4. **Retargeting**: Create audiences based on cart abandoners
5. **ROI Measurement**: Track actual revenue from Facebook ads

## 📈 **Facebook Ads Integration**

### **Now Possible:**
- **Conversion Campaigns**: Optimize for actual purchases
- **Dynamic Product Ads**: Retarget cart abandoners
- **Lookalike Audiences**: Based on actual purchasers
- **Value-Based Bidding**: Optimize for high-value customers
- **Attribution Reporting**: Track customer journey from ad to purchase

## 🔍 **Debugging**

### **Check Events Are Firing:**
1. Open browser console
2. Look for "Meta Pixel: AddToCart tracked" messages
3. Use Meta Pixel Helper extension
4. Check Events Manager Test Events tab

### **Common Issues:**
- **Events not firing**: Check console for errors
- **Missing data**: Verify product/order data is available
- **Duplicate events**: Ensure tracking only happens on success

## 📝 **Next Steps**

1. **Test thoroughly** on staging environment
2. **Monitor Events Manager** for event quality
3. **Set up conversion campaigns** in Facebook Ads
4. **Create custom audiences** for retargeting
5. **Implement Conversion API** for server-side tracking (future enhancement)

The Meta Pixel integration is now complete and will provide accurate tracking for your Facebook advertising campaigns! 🚀

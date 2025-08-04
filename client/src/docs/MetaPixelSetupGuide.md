# Meta Pixel Integration Setup Guide

## 🎯 Overview

This guide covers the complete Meta Pixel integration for your React + Vite application. The integration provides automatic tracking for key e-commerce events and is compatible with Meta's Event Setup Tool.

## ✅ What's Already Implemented

### 1. Base Pixel Setup
- ✅ Meta Pixel script added to `index.html` with Pixel ID: `2456284341419492`
- ✅ Advanced matching enabled for better conversion tracking
- ✅ Noscript fallback for users with JavaScript disabled

### 2. Automatic Tracking (MetaPixelTracker)
- ✅ **PageView**: Tracked on every route change
- ✅ **ViewContent**: Tracked on product details pages (`/shop/details/:id`)
- ✅ **InitiateCheckout**: Tracked on checkout page (`/shop/checkout`)
- ✅ **Purchase**: Tracked on payment success page (`/shop/payment-success`)
- ✅ **Category Views**: Tracked on category pages (`/shop/collections/*`)
- ✅ **Search**: Tracked on search page with query parameters

### 3. Utility Functions
- ✅ Centralized event functions in `utils/metaPixelEvents.js`
- ✅ Cart tracking hook in `hooks/useMetaPixelCart.js`
- ✅ Safety checks for SSR compatibility
- ✅ Console logging for debugging

## 🔧 Manual Integration Required

To complete the integration, you need to add tracking calls to your existing components:

### 1. Add to Cart Tracking

**File**: `src/components/shopping-view/product-tile.jsx` (and similar components)

```javascript
import { useMetaPixelCart } from '@/hooks/useMetaPixelCart';

// In your component
const { trackAddToCart } = useMetaPixelCart();

// In your handleAddToCart function
const handleAddToCart = async (productId, colorId, quantity = 1) => {
  try {
    const result = await dispatch(addToCart({
      userId: user?.id,
      productId,
      quantity,
      colorId
    }));
    
    if (result?.payload?.success) {
      // 🎯 ADD THIS LINE
      trackAddToCart(productId, colorId, quantity);
      
      toast({ title: "Product added to cart" });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};
```

### 2. Cart View Tracking

**File**: `src/components/shopping-view/custom-cart-drawer.jsx`

```javascript
import { useMetaPixelCart } from '@/hooks/useMetaPixelCart';
import { useEffect } from 'react';

// In your component
const { trackCartView } = useMetaPixelCart();

// 🎯 ADD THIS EFFECT
useEffect(() => {
  if (isOpen && cartItems.length > 0) {
    trackCartView();
  }
}, [isOpen, trackCartView, cartItems.length]);
```

### 3. Search Tracking

**File**: `src/pages/shopping-view/search.jsx`

```javascript
import { searchEvent } from '@/utils/metaPixelEvents';

// In your search handler
const handleSearch = (searchQuery) => {
  // Your existing search logic
  dispatch(fetchAllFilteredProducts({ /* params */ }));
  
  // 🎯 ADD THIS LINE
  if (searchQuery && searchQuery.trim()) {
    searchEvent({
      search_string: searchQuery.trim()
    });
  }
};
```

### 4. Registration Tracking

**File**: `src/pages/auth/register.jsx`

```javascript
import { completeRegistrationEvent } from '@/utils/metaPixelEvents';

// In your registration handler
const handleRegistration = async (formData) => {
  try {
    const result = await dispatch(registerUser(formData));
    
    if (result?.payload?.success) {
      // 🎯 ADD THIS LINE
      completeRegistrationEvent({
        content_name: 'User Registration'
      });
      
      navigate('/shop/home');
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

### 5. Contact Form Tracking

**File**: `src/pages/shopping-view/contact.jsx`

```javascript
import { contactFormSubmitEvent, leadEvent } from '@/utils/metaPixelEvents';

// In your contact form handler
const handleContactSubmit = async (formData) => {
  try {
    const result = await submitContactForm(formData);
    
    if (result.success) {
      // 🎯 ADD THESE LINES
      contactFormSubmitEvent();
      leadEvent({
        content_name: 'Contact Form',
        value: 0,
        currency: 'INR'
      });
      
      toast({ title: "Message sent successfully!" });
    }
  } catch (error) {
    console.error('Contact form error:', error);
  }
};
```

### 6. Purchase Tracking Enhancement

**File**: `src/pages/shopping-view/payment-success.jsx`

```javascript
import { purchaseEvent } from '@/utils/metaPixelEvents';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// In your component
const { orderDetails } = useSelector((state) => state.shopOrder);

// 🎯 ADD THIS EFFECT
useEffect(() => {
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
  }
}, [orderDetails]);
```

## 🧪 Testing & Verification

### 1. Browser Testing
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
2. Navigate through your site and check for pixel fires
3. Verify events are firing with correct parameters

### 2. Events Manager Testing
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your pixel (ID: 2456284341419492)
3. Check "Test Events" tab for real-time event data
4. Verify events are being received with correct parameters

### 3. Event Setup Tool
1. In Events Manager, go to "Data Sources" → "Pixels"
2. Click "Set up events" → "From the pixel"
3. Enter your website URL
4. The overlay should load, allowing visual event setup

## 🔍 Debugging

### Console Logs
All events log to console for debugging:
```
Meta Pixel: PageView tracked
Meta Pixel: ViewContent tracked {content_ids: ["123"], value: 29.99, currency: "INR"}
```

### Common Issues
1. **Events not firing**: Check browser console for errors
2. **Pixel Helper shows no pixel**: Verify script is loaded in Network tab
3. **Event Setup Tool not working**: Ensure no ad blockers are interfering

## 📊 Available Events

### Standard Events (Auto-tracked)
- `PageView` - Every page visit
- `ViewContent` - Product detail pages
- `AddToCart` - When items added to cart
- `InitiateCheckout` - Checkout page visits
- `Purchase` - Order completion
- `Search` - Search queries
- `CompleteRegistration` - User registration

### Custom Events (Manual integration)
- `Category-View` - Category page visits
- `Newsletter-Signup` - Newsletter subscriptions
- `Contact-Form-Submit` - Contact form submissions
- `AddToWishlist` - Wishlist additions

## 🚀 Advanced Features

### Advanced Matching
Automatically enabled for better conversion tracking using:
- Email addresses (when available)
- Phone numbers (when available)
- User IDs (when available)

### Conversion API Ready
The current setup is compatible with Conversion API for server-side tracking if needed in the future.

## 📝 Next Steps

1. Implement the manual tracking calls in your components
2. Test thoroughly with Meta Pixel Helper
3. Set up conversion campaigns in Meta Ads Manager
4. Monitor performance in Events Manager
5. Consider implementing Conversion API for enhanced tracking

## 🆘 Support

For issues or questions:
1. Check browser console for error messages
2. Verify events in Meta Events Manager
3. Use Meta Pixel Helper for debugging
4. Refer to [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)

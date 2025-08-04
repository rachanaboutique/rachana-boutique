/**
 * Meta Pixel Integration Examples
 * 
 * This file shows how to integrate Meta Pixel tracking into your existing components.
 * Copy these examples into your actual components where the events occur.
 * 
 * IMPORTANT: This is an example file - implement these patterns in your actual components!
 */

// Example 1: Add to Cart Button Integration
// Use this in your product tiles, product details, etc.

import { useMetaPixelCart } from '../hooks/useMetaPixelCart';
import { addToCartEvent } from '../utils/metaPixelEvents';

// In your product component (e.g., ShoppingProductTile, ProductDetailsPage)
const ExampleProductComponent = () => {
  const { trackAddToCart } = useMetaPixelCart();
  
  const handleAddToCart = async (productId, colorId, quantity = 1) => {
    try {
      // Your existing add to cart logic
      const result = await dispatch(addToCart({
        userId: user?.id,
        productId,
        quantity,
        colorId
      }));
      
      if (result?.payload?.success) {
        // Track the Meta Pixel event AFTER successful cart addition
        trackAddToCart(productId, colorId, quantity);
        
        // Your existing success handling
        toast({ title: "Product added to cart" });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  return (
    <button onClick={() => handleAddToCart('product123', 'color456', 1)}>
      Add to Cart
    </button>
  );
};

// Example 2: Cart Drawer Integration
// Use this in your CustomCartDrawer component

import { useEffect } from 'react';

const ExampleCartDrawer = ({ isOpen, cartItems }) => {
  const { trackCartView } = useMetaPixelCart();
  
  // Track when cart drawer opens
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      trackCartView();
    }
  }, [isOpen, trackCartView, cartItems.length]);
  
  return (
    <div>
      {/* Your cart drawer content */}
    </div>
  );
};

// Example 3: Search Integration
// Use this in your SearchProducts component

import { searchEvent } from '../utils/metaPixelEvents';

const ExampleSearchComponent = () => {
  const handleSearch = (searchQuery) => {
    // Your existing search logic
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: {} }));
    
    // Track the search event
    if (searchQuery && searchQuery.trim()) {
      searchEvent({
        search_string: searchQuery.trim()
      });
    }
  };
  
  return (
    <input 
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search products..."
    />
  );
};

// Example 4: Registration Integration
// Use this in your AuthRegister component

import { completeRegistrationEvent } from '../utils/metaPixelEvents';

const ExampleRegistrationComponent = () => {
  const handleRegistration = async (formData) => {
    try {
      // Your existing registration logic
      const result = await dispatch(registerUser(formData));
      
      if (result?.payload?.success) {
        // Track successful registration
        completeRegistrationEvent({
          content_name: 'User Registration'
        });
        
        // Your existing success handling
        navigate('/shop/home');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };
  
  return (
    <form onSubmit={handleRegistration}>
      {/* Your registration form */}
    </form>
  );
};

// Example 5: Contact Form Integration
// Use this in your Contact component

import { contactFormSubmitEvent, leadEvent } from '../utils/metaPixelEvents';

const ExampleContactForm = () => {
  const handleContactSubmit = async (formData) => {
    try {
      // Your existing contact form submission logic
      const result = await submitContactForm(formData);
      
      if (result.success) {
        // Track contact form submission
        contactFormSubmitEvent();
        
        // Also track as a lead
        leadEvent({
          content_name: 'Contact Form',
          value: 0,
          currency: 'INR'
        });
        
        // Your existing success handling
        toast({ title: "Message sent successfully!" });
      }
    } catch (error) {
      console.error('Contact form error:', error);
    }
  };
  
  return (
    <form onSubmit={handleContactSubmit}>
      {/* Your contact form */}
    </form>
  );
};

// Example 6: Newsletter Signup Integration
// Use this wherever you have newsletter signup

import { newsletterSignupEvent, leadEvent } from '../utils/metaPixelEvents';

const ExampleNewsletterSignup = () => {
  const handleNewsletterSignup = async (email) => {
    try {
      // Your existing newsletter signup logic
      const result = await subscribeToNewsletter(email);
      
      if (result.success) {
        // Track newsletter signup
        newsletterSignupEvent();
        
        // Also track as a lead
        leadEvent({
          content_name: 'Newsletter Signup',
          value: 0,
          currency: 'INR'
        });
        
        toast({ title: "Successfully subscribed!" });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
    }
  };
  
  return (
    <div>
      <input type="email" placeholder="Enter your email" />
      <button onClick={() => handleNewsletterSignup('user@example.com')}>
        Subscribe
      </button>
    </div>
  );
};

// Example 7: Order Success Integration
// Use this in your PaymentSuccessPage component

import { purchaseEvent } from '../utils/metaPixelEvents';

const ExampleOrderSuccessPage = () => {
  const { orderDetails } = useSelector((state) => state.shopOrder);
  
  useEffect(() => {
    // Track purchase when order success page loads
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
  
  return (
    <div>
      <h1>Order Successful!</h1>
      {/* Your order success content */}
    </div>
  );
};

// Example 8: Category View Integration
// This is already handled by MetaPixelTracker, but you can also track manually

import { categoryViewEvent } from '../utils/metaPixelEvents';

const ExampleCategoryPage = ({ categorySlug }) => {
  useEffect(() => {
    if (categorySlug) {
      const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      categoryViewEvent(categoryName);
    }
  }, [categorySlug]);
  
  return (
    <div>
      {/* Your category page content */}
    </div>
  );
};

/**
 * INTEGRATION CHECKLIST:
 * 
 * ✅ 1. MetaPixelTracker is added to App.jsx (automatic tracking)
 * ✅ 2. Base pixel script is in index.html
 * 
 * TODO - Implement these in your actual components:
 * 
 * 🔲 3. Add trackAddToCart() calls in:
 *    - ShoppingProductTile component
 *    - ProductDetailsPage component
 *    - Any other "Add to Cart" buttons
 * 
 * 🔲 4. Add trackCartView() in:
 *    - CustomCartDrawer component (when opened)
 * 
 * 🔲 5. Add searchEvent() in:
 *    - SearchProducts component
 * 
 * 🔲 6. Add completeRegistrationEvent() in:
 *    - AuthRegister component
 * 
 * 🔲 7. Add contactFormSubmitEvent() in:
 *    - Contact component
 * 
 * 🔲 8. Add newsletterSignupEvent() in:
 *    - Newsletter signup forms
 * 
 * 🔲 9. Add purchaseEvent() in:
 *    - PaymentSuccessPage component
 * 
 * 🔲 10. Test with Meta Pixel Helper browser extension
 */

export {
  ExampleProductComponent,
  ExampleCartDrawer,
  ExampleSearchComponent,
  ExampleRegistrationComponent,
  ExampleContactForm,
  ExampleNewsletterSignup,
  ExampleOrderSuccessPage,
  ExampleCategoryPage
};

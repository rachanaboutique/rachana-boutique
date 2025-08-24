/**
 * ProtectedPaymentRoute Component
 * 
 * Protects the payment success route to ensure users can only access it
 * after a successful payment transaction, not by direct URL navigation.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from '@/components/ui/loader';

const ProtectedPaymentRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isValidAccess, setIsValidAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Get order state from Redux
  const { orderDetails, isPaymentLoading } = useSelector((state) => state.shopOrder);
  
  useEffect(() => {
    const checkPaymentAccess = () => {
      // Check multiple indicators of a valid payment flow
      const hasOrderDetails = orderDetails && orderDetails._id;
      const hasSessionOrderId = sessionStorage.getItem('currentOrderId');
      const hasPaymentSuccess = sessionStorage.getItem('paymentSuccess') === 'true';
      const hasRecentPayment = sessionStorage.getItem('recentPaymentTimestamp');
      
      // Check if the payment was recent (within last 10 minutes)
      const isRecentPayment = hasRecentPayment && 
        (Date.now() - parseInt(hasRecentPayment)) < 10 * 60 * 1000;
      
      // Allow access if any of these conditions are met:
      // 1. Has valid order details in Redux state
      // 2. Has payment success flag in session storage
      // 3. Has recent payment timestamp
      // 4. Currently in payment loading state (payment in progress)
      const isValidPaymentAccess = hasOrderDetails || 
                                   hasPaymentSuccess || 
                                   isRecentPayment || 
                                   isPaymentLoading;
      
      console.log('Payment Route Access Check:', {
        hasOrderDetails: !!hasOrderDetails,
        hasSessionOrderId: !!hasSessionOrderId,
        hasPaymentSuccess,
        isRecentPayment,
        isPaymentLoading,
        isValidPaymentAccess
      });
      
      if (isValidPaymentAccess) {
        setIsValidAccess(true);
        
        // Set payment success flag and timestamp for future checks
        sessionStorage.setItem('paymentSuccess', 'true');
        sessionStorage.setItem('recentPaymentTimestamp', Date.now().toString());
        
        // Clean up the payment success flag after 10 minutes
        setTimeout(() => {
          sessionStorage.removeItem('paymentSuccess');
          sessionStorage.removeItem('recentPaymentTimestamp');
        }, 10 * 60 * 1000);
        
      } else {
        // Invalid access - redirect to home
        console.warn('Invalid access to payment success page - redirecting to home');
        navigate('/', { replace: true });
      }
      
      setIsChecking(false);
    };
    
    // Small delay to allow Redux state to populate
    const timeoutId = setTimeout(checkPaymentAccess, 100);
    
    return () => clearTimeout(timeoutId);
  }, [orderDetails, isPaymentLoading, navigate]);
  
  // Show loader while checking access
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  // Render children only if access is valid
  return isValidAccess ? children : null;
};

export default ProtectedPaymentRoute;

# Meta Pixel Events Debugging Guide

## 🎯 Issue: Events Show in Extension but Not in Events Manager

**Problem**: Meta Pixel Helper extension detects events, but they don't appear in Meta Events Manager.

**Common Causes**:
1. Duplicate events being fired (automatic + manual)
2. Invalid event parameters
3. Event timing issues
4. Facebook's event deduplication

## 🔧 **Fixes Applied**

### **1. Removed Duplicate Event Tracking**
- ✅ Removed automatic AddToCart from MetaPixelTracker
- ✅ Removed automatic Purchase from MetaPixelTracker  
- ✅ Only manual events fire now (from actual user actions)

### **2. Enhanced Event Parameter Validation**
```javascript
// AddToCart Event - Now validates:
- content_ids: Ensures array format
- value: Converts to number, validates positive
- Removes null/undefined values

// Purchase Event - Now validates:
- content_ids: Ensures array format  
- value: Ensures positive number (min 0.01)
- num_items: Ensures positive integer
- Removes null/undefined values
```

### **3. Added Event Timing Delays**
- ✅ AddToCart: 100ms delay after cart action
- ✅ Purchase: 1000ms delay after page load
- ✅ Ensures proper event sequencing

## 🧪 **Testing Steps**

### **Step 1: Test Events Manually**
Open browser console and run:
```javascript
window.testMetaPixelEvents()
```

This will fire test AddToCart and Purchase events. Check:
1. **Meta Pixel Helper**: Should show events ✅
2. **Events Manager**: Should receive events ✅

### **Step 2: Test Real AddToCart**
1. Go to any product page
2. Click "Add to Cart" button
3. Check browser console for: `Meta Pixel: AddToCart tracked from ProductTile`
4. Check Meta Pixel Helper for AddToCart event
5. Wait 2-3 minutes, check Events Manager

### **Step 3: Test Real Purchase**
1. Complete a test purchase
2. Reach payment success page
3. Check console for: `Meta Pixel: Purchase event tracked with full details`
4. Check Meta Pixel Helper for Purchase event
5. Wait 2-3 minutes, check Events Manager

## 🔍 **Debugging Checklist**

### **Browser Console Logs to Look For**:
```
✅ Meta Pixel: AddToCart tracked from ProductTile
✅ Meta Pixel: Purchase event tracked with full details
✅ Test function available: window.testMetaPixelEvents()
```

### **Meta Pixel Helper Should Show**:
```
✅ AddToCart event (not "Button Click Automatically Detected")
✅ Purchase event with transaction data
✅ Proper event parameters
```

### **Events Manager Checks**:
1. **Test Events Tab**: Real-time event monitoring
2. **Event Quality**: Check match quality scores
3. **Attribution**: Verify conversion attribution
4. **Timing**: Events may take 2-3 minutes to appear

## 🚨 **Common Issues & Solutions**

### **Issue 1: Events in Helper but Not Events Manager**
**Cause**: Facebook's event deduplication or invalid parameters
**Solution**: 
- Use test function to verify basic functionality
- Check event parameters match Facebook requirements
- Ensure no duplicate events from other sources

### **Issue 2: "Button Click Automatically Detected"**
**Cause**: Facebook's automatic event detection interfering
**Solution**: 
- ✅ Fixed by adding proper manual tracking
- Disable automatic event detection in Events Manager if needed

### **Issue 3: Purchase Events Not Firing**
**Cause**: Missing order data or route protection issues
**Solution**:
- ✅ Enhanced order data fetching
- ✅ Added fallback tracking
- Check browser console for errors

### **Issue 4: Delayed Event Appearance**
**Cause**: Normal Facebook processing delay
**Solution**: 
- Wait 2-3 minutes for events to appear
- Use Test Events tab for real-time monitoring
- Check during business hours for faster processing

## 📊 **Event Data Validation**

### **Valid AddToCart Event**:
```javascript
{
  content_ids: ["product_123"],
  content_type: "product",
  value: 2999,
  currency: "INR",
  content_name: "Product Name",
  content_category: "sarees",
  num_items: 1
}
```

### **Valid Purchase Event**:
```javascript
{
  content_ids: ["prod1", "prod2"],
  content_type: "product",
  value: 5998,
  currency: "INR",
  num_items: 2,
  transaction_id: "order_123"
}
```

## 🔧 **Advanced Debugging**

### **Check Facebook Pixel Status**:
```javascript
// Run in console
console.log('Pixel loaded:', typeof window.fbq !== 'undefined');
console.log('Pixel version:', window.fbq?.version);
console.log('Pixel queue:', window.fbq?.queue?.length);
```

### **Monitor Network Requests**:
1. Open DevTools → Network tab
2. Filter by "facebook.com"
3. Look for pixel fire requests
4. Check request parameters

### **Verify Pixel ID**:
- Ensure Pixel ID `2456284341419492` is correct
- Check it matches your Events Manager
- Verify domain verification is complete

## 🎯 **Expected Results**

After implementing these fixes:

### **Immediate (0-30 seconds)**:
- ✅ Console logs show event tracking
- ✅ Meta Pixel Helper detects events
- ✅ Network requests to Facebook

### **Short Term (2-3 minutes)**:
- ✅ Events appear in Test Events tab
- ✅ Event parameters are validated
- ✅ No duplicate events

### **Medium Term (5-10 minutes)**:
- ✅ Events appear in main Events Manager
- ✅ Conversion data is recorded
- ✅ Attribution reports update

## 📞 **If Issues Persist**

1. **Run Manual Test**: `window.testMetaPixelEvents()`
2. **Check Console**: Look for error messages
3. **Verify Pixel Helper**: Ensure events are detected
4. **Wait Longer**: Facebook processing can take up to 15 minutes
5. **Check Domain Verification**: Ensure your domain is verified in Business Manager
6. **Review Event Quality**: Check for parameter validation errors

## 🚀 **Next Steps**

Once events are working:
1. **Set up Conversion Campaigns** in Facebook Ads
2. **Create Custom Audiences** based on events
3. **Monitor Event Quality** scores
4. **Implement Conversion API** for server-side tracking (optional)

The enhanced tracking should now properly send events to Meta Events Manager! 🎉

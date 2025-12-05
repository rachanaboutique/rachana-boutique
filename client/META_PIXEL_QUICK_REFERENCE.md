# Meta Pixel Advanced Matching - Quick Reference

## 🎯 What Meta Asked For

Meta Pixel sent you a message asking to implement **manual advanced matching** with user data:

```javascript
fbq('init', '2456284341419492', {
  em: 'email@email.com',   // Email (hashed automatically)
  ph: '1234567890',        // Phone (hashed automatically)
  // ... other data
});
```

## ✅ What We Implemented

We've set up **complete manual advanced matching** that:

1. ✅ Captures user data when they login/register
2. ✅ Sends email, phone, name, address to Meta Pixel
3. ✅ Automatically hashes all data (SHA-256)
4. ✅ Persists data across sessions
5. ✅ Clears data on logout

## 📁 Files Created/Modified

### Created:
- `client/src/utils/metaPixelAdvancedMatching.js` - Main utility
- `client/src/docs/META_PIXEL_ADVANCED_MATCHING.md` - Full documentation
- `client/src/docs/META_PIXEL_SETUP_SUMMARY.md` - Implementation summary
- `client/META_PIXEL_QUICK_REFERENCE.md` - This file

### Modified:
- `client/index.html` - Updated pixel initialization
- `client/src/pages/auth/login.jsx` - Added user data on login
- `client/src/pages/auth/register.jsx` - Added user data on register
- `client/src/App.jsx` - Added data restoration and logout handling

## 🧪 How to Test

### 1. Test in Browser Console

```javascript
// Verify setup is working
window.metaPixelAdvancedMatching.verify()

// Set test data
window.metaPixelAdvancedMatching.setUserData({
  email: 'test@example.com',
  phone: '9876543210',
  firstName: 'Test',
  lastName: 'User'
})

// Check what's stored
window.metaPixelAdvancedMatching.getStoredUserData()

// Clear data
window.metaPixelAdvancedMatching.clearUserData()
```

### 2. Test with Meta Pixel Helper

1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgodlnavgvnmofbfbgfgpppjoccnchg)
2. Login to your website
3. Open Meta Pixel Helper
4. Go to "Events" tab
5. You should see user data being sent

### 3. Test the Flow

1. **Login**: User logs in → User data sent to Meta Pixel
2. **Register**: User registers → User data sent to Meta Pixel
3. **Logout**: User logs out → User data cleared
4. **Page Reload**: User data restored from localStorage

## 📊 Data Being Sent

When user logs in, Meta Pixel receives:

```javascript
{
  em: 'user@example.com',      // Email (hashed)
  ph: '9876543210',            // Phone (hashed)
  fn: 'john',                  // First name (hashed)
  ln: 'doe',                   // Last name (hashed)
  ct: 'mumbai',                // City (hashed)
  st: 'mh',                    // State (hashed)
  zp: '400001',                // Zip code (hashed)
  country: 'IN',               // Country code
  external_id: 'user_123'      // Your internal user ID
}
```

**All data is automatically hashed by Meta Pixel using SHA-256 before sending to Meta servers.**

## 🔒 Privacy

- ✅ No raw personal data is sent to Meta
- ✅ All data is hashed (SHA-256)
- ✅ GDPR compliant
- ✅ User privacy protected

## 🚀 Next Steps

1. **Test the implementation** (see "How to Test" above)
2. **Verify in Meta Business Suite**:
   - Go to your Pixel settings
   - Check "Advanced Matching" is enabled
   - Monitor data quality score
3. **Monitor performance**:
   - Track conversion rates
   - Monitor ROAS
   - Check audience matching quality

## 📞 Troubleshooting

### Data not being sent?
```javascript
// Check if Meta Pixel is loaded
typeof window.fbq === 'function'  // Should be true

// Check if data is stored
window.metaPixelAdvancedMatching.getStoredUserData()

// Check browser console for errors
```

### Data not persisting?
```javascript
// Check localStorage
localStorage.getItem('metaPixelUserData')

// Check if localStorage is enabled
typeof localStorage !== 'undefined'
```

## 📚 Full Documentation

For detailed information, see:
- `client/src/docs/META_PIXEL_ADVANCED_MATCHING.md` - Complete guide
- `client/src/docs/META_PIXEL_SETUP_SUMMARY.md` - Implementation details

## 🔗 Resources

- [Meta Pixel Advanced Matching](https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching)
- [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgodlnavgvnmofbfbgfgpppjoccnchg)
- [Meta Business Suite](https://business.facebook.com/)

---

**Status**: ✅ Complete and Ready to Test


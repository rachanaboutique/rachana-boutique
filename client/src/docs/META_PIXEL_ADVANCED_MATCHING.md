# Meta Pixel Advanced Matching Setup

## Overview

Advanced matching allows Meta to match your website visitors with their Facebook accounts using hashed data (email, phone, name, address, etc.) for better ad targeting and conversion tracking.

**All data is automatically hashed by Meta Pixel using SHA-256 before being sent to Meta.**

## Implementation Details

### 1. **Pixel Initialization** (`client/index.html`)

The Meta Pixel is initialized with advanced matching enabled:

```javascript
fbq('init', '2456284341419492', {
  em: 'auto',           // Enable automatic advanced matching for form fields
  external_id: 'auto'   // Enable external ID matching
});
```

### 2. **Manual Advanced Matching Utility** (`client/src/utils/metaPixelAdvancedMatching.js`)

This utility provides functions to manually set user data for advanced matching:

#### **setUserData(userData)**
Sets user data for advanced matching. Call this when user logs in or provides their information.

```javascript
import { setUserData } from '@/utils/metaPixelAdvancedMatching';

setUserData({
  email: 'user@example.com',        // Email address
  phone: '9876543210',              // Phone number (10+ digits)
  firstName: 'John',                // First name
  lastName: 'Doe',                  // Last name
  city: 'Mumbai',                   // City
  state: 'MH',                      // State code
  zipCode: '400001',                // Postal code
  country: 'IN',                    // Country code
  externalId: 'user_123'            // Your internal user ID
});
```

#### **clearUserData()**
Clears user data when user logs out.

```javascript
import { clearUserData } from '@/utils/metaPixelAdvancedMatching';

clearUserData();
```

#### **getStoredUserData()**
Retrieves stored user data from localStorage.

```javascript
import { getStoredUserData } from '@/utils/metaPixelAdvancedMatching';

const userData = getStoredUserData();
```

#### **restoreUserDataOnPageLoad()**
Automatically restores user data on page load for persistence across sessions.

```javascript
import { restoreUserDataOnPageLoad } from '@/utils/metaPixelAdvancedMatching';

restoreUserDataOnPageLoad();
```

### 3. **Integration Points**

#### **Login Page** (`client/src/pages/auth/login.jsx`)
- Automatically sets user data when user logs in successfully
- Sends email, phone, name, address, and external ID to Meta Pixel

#### **Register Page** (`client/src/pages/auth/register.jsx`)
- Tracks `CompleteRegistration` event
- Sets user data with registration information
- Sends email and name to Meta Pixel

#### **App Component** (`client/src/App.jsx`)
- Restores user data on page load
- Updates Meta Pixel when authentication state changes
- Clears user data on logout

### 4. **Data Hashing**

All data is automatically hashed by Meta Pixel using SHA-256:

- **Email**: Normalized (lowercase, trimmed) then hashed
- **Phone**: Normalized (digits only) then hashed
- **Names**: Normalized (lowercase, trimmed) then hashed
- **Address**: Normalized then hashed

**Example:**
```
Input: "John@Example.COM"
Normalized: "john@example.com"
Hashed: [SHA-256 hash]
Sent to Meta: [SHA-256 hash]
```

### 5. **Data Persistence**

User data is stored in localStorage and automatically restored on page load:

```javascript
// Stored in localStorage as:
localStorage.getItem('metaPixelUserData')
// Returns: { em: 'user@example.com', ph: '9876543210', ... }
```

### 6. **Testing & Debugging**

#### **Verify Setup**
```javascript
// In browser console:
window.metaPixelAdvancedMatching.verify()
```

#### **Set Test Data**
```javascript
// In browser console:
window.metaPixelAdvancedMatching.setUserData({
  email: 'test@example.com',
  phone: '9876543210',
  firstName: 'Test',
  lastName: 'User'
})
```

#### **Check Stored Data**
```javascript
// In browser console:
window.metaPixelAdvancedMatching.getStoredUserData()
```

#### **Clear Data**
```javascript
// In browser console:
window.metaPixelAdvancedMatching.clearUserData()
```

### 7. **Meta Pixel Events with User Data**

You can track events with user data:

```javascript
import { trackEventWithUserData } from '@/utils/metaPixelAdvancedMatching';

trackEventWithUserData(
  'Purchase',
  {
    value: 999.99,
    currency: 'INR',
    content_ids: ['product_123']
  },
  {
    email: 'user@example.com',
    phone: '9876543210'
  }
);
```

## Data Fields Supported

| Field | Parameter | Example | Notes |
|-------|-----------|---------|-------|
| Email | `em` | user@example.com | Automatically hashed |
| Phone | `ph` | 9876543210 | 10+ digits, automatically hashed |
| First Name | `fn` | John | Automatically hashed |
| Last Name | `ln` | Doe | Automatically hashed |
| City | `ct` | Mumbai | Automatically hashed |
| State | `st` | MH | Automatically hashed |
| Zip Code | `zp` | 400001 | Automatically hashed |
| Country | `country` | IN | 2-letter code |
| External ID | `external_id` | user_123 | Your internal user ID |

## Privacy & Compliance

- **Data Hashing**: All personally identifiable information is hashed using SHA-256
- **No Raw Data Sent**: Meta Pixel never sends raw email, phone, or name to Meta
- **GDPR Compliant**: Hashing ensures user privacy
- **User Consent**: Ensure you have user consent before tracking

## Troubleshooting

### Data Not Being Set
1. Check if Meta Pixel is loaded: `window.fbq` should exist
2. Verify user data has at least one field
3. Check browser console for errors

### Data Not Persisting
1. Check if localStorage is enabled
2. Verify `metaPixelUserData` key in localStorage
3. Check browser privacy settings

### Events Not Tracking
1. Verify Meta Pixel ID is correct: `2456284341419492`
2. Check if fbq is available: `typeof window.fbq === 'function'`
3. Check browser console for errors

## References

- [Meta Pixel Advanced Matching Documentation](https://developers.facebook.com/docs/facebook-pixel/advanced/advanced-matching)
- [SHA-256 Hashing](https://en.wikipedia.org/wiki/SHA-2)
- [GDPR Compliance](https://gdpr-info.eu/)


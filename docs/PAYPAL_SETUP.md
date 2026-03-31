# PayPal Integration Setup Guide

## Overview
The Ball Sort Puzzle game now uses **PayPal** for premium purchases ($2.99 one-time).

### Payment Methods Supported
- ✅ PayPal Account
- ✅ Visa/Mastercard
- ✅ Apple Pay (if enabled in PayPal dashboard)
- ✅ Google Pay (if enabled in PayPal dashboard)

---

## Step 1: Get PayPal Sandbox Credentials

### 1a. Create a PayPal Developer Account
1. Go to [developer.sandbox.paypal.com](https://developer.sandbox.paypal.com)
2. Sign up or log in with your PayPal account
3. Navigate to **Sandbox** → **Accounts**

### 1b. Create a Business Account
1. Click **Create Account**
2. Choose **Business** account type
3. Copy the **Client ID** (you'll need this)

### 1c. Create a Personal Account (for testing payments)
1. Create another sandbox account of type **Personal**
2. Note the email and password for testing

---

## Step 2: Configure Environment Variables

Create/update `.env.local` in your project root:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YourPayPalClientIdHere
PAYPAL_CLIENT_SECRET=YourPayPalClientSecretHere
```

- **NEXT_PUBLIC_PAYPAL_CLIENT_ID**: Public client ID (visible to browser)
- **PAYPAL_CLIENT_SECRET**: Secret key (backend only, add to backend .env)

### Where to Find These:
1. Log in to [PayPal Developer Dashboard](https://www.sandbox.paypal.com/dashboard)
2. Go to **Apps & Credentials**
3. Make sure you're in **Sandbox** mode
4. Under **REST API apps**, find your app
5. Click **Show** next to **Secret** to reveal it

---

## Step 3: Create Backend API Endpoint

Create `/app/api/paypal/verify-order.ts`:

```typescript
/**
 * POST /api/paypal/verify-order
 * Verifies PayPal order and captures payment
 * 
 * Request body:
 * {
 *   orderID: string  // PayPal order ID from client
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_API_BASE = 'https://api-sandbox.sandbox.paypal.com'
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const SECRET = process.env.PAYPAL_CLIENT_SECRET

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { success: false, message: 'Order ID required' },
        { status: 400 }
      )
    }

    // Get access token
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET}`).toString(
          'base64'
        )}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!authResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const { access_token } = await authResponse.json()

    // Capture order
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!captureResponse.ok) {
      const error = await captureResponse.json()
      throw new Error(error.message || 'Failed to capture order')
    }

    const result = await captureResponse.json()

    // Verify purchase status
    if (result.status === 'COMPLETED') {
      // TODO: Update user's isPremium in database
      // const { data: { user } } = await supabase.auth.getUser()
      // await purchasePremiumDB()

      return NextResponse.json({
        success: true,
        message: 'Payment captured successfully',
      })
    } else {
      throw new Error(`Order status: ${result.status}`)
    }
  } catch (error) {
    const err = error as Error
    console.error('[PayPal API Error]', err.message)

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    )
  }
}
```

---

## Step 4: Update PayPalPaymentModal Component

Modify `components/ads/PayPalPaymentModal.tsx` to call your backend:

```typescript
// In the onApprove callback, replace:
onApprove: async (data) => {
  try {
    setLoading(true)
    
    // Verify payment with your backend
    const response = await fetch('/api/paypal/verify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: data.orderID }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    // Mark user as premium locally
    await onSuccess()
    onClose()
  } catch (err) {
    const error = err as Error
    onError(error.message)
  } finally {
    setLoading(false)
  }
},
```

---

## Step 5: Testing

### Test Customer Account
Use this email to test as a customer:
- **Email**: `sb-xxxxx@personal.example.com` (from sandbox)
- **Password**: Your sandbox account password

### Test Payment Methods

#### Method 1: PayPal Account
1. Click "PayPal" button in checkout
2. Log in with sandbox personal account
3. Approve payment

#### Method 2: Visa Card
1. Click "Pay with Debit or Credit Card"
2. Use test card: `4111 1111 1111 1111`
3. Any future date expiry
4. Any 3-digit CVV

### Test Amounts
- **$2.99** - Standard payment (what your players will see)
- Any amount - PayPal sandbox accepts any amount for testing

---

## Step 6: Production Deployment

### 6a. Get Live Credentials
1. Log in to [paypal.com/business](https://www.paypal.com/business)
2. Go to **Account Settings** → **API Signature**
3. Copy your live **Client ID** and **Secret**

### 6b. Update Environment Variables
Replace sandbox credentials with live ones:

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YourLiveClientIdHere
PAYPAL_CLIENT_SECRET=YourLiveClientSecretHere
```

### 6c. Update Backend API
Change PayPal API base URL:
```typescript
// From:
const PAYPAL_API_BASE = 'https://api-sandbox.sandbox.paypal.com'

// To:
const PAYPAL_API_BASE = 'https://api.paypal.com'
```

---

## Troubleshooting

### "PayPal SDK not loaded"
- Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in `.env.local`
- Restart your dev server after changing env vars

### "Failed to create order"
- Verify PayPal credentials are correct
- Check browser console for detailed error messages
- Ensure backend API endpoint is accessible

### "Payment approved but failed to complete"
- Check that `/api/paypal/verify-order` endpoint exists
- Verify backend can reach PayPal API
- Check server logs for API errors

### Payment showing as pending
- In sandbox, some payments may show as "Pending Review"
- This is normal in sandbox environment
- In production, most payments complete instantly

---

## Important Notes

1. **Never commit secrets** - `PAYPAL_CLIENT_SECRET` should only be in `.env.local` (gitignored)
2. **NEXT_PUBLIC prefix** - Only `NEXT_PUBLIC_PAYPAL_CLIENT_ID` goes to browser
3. **Database integration** - You'll need to update your backend to call `purchasePremiumDB()` after verifying payment
4. **User context** - When calling the verify endpoint, ensure you have the authenticated user's ID
5. **Error handling** - Always catch and log payment errors for debugging

---

## File References

- **Component**: `components/ads/PayPalPaymentModal.tsx`
- **Modal**: `components/screens/premium-modal.tsx`
- **Backend**: `/app/api/paypal/verify-order.ts` (create this)
- **DB Function**: `lib/save-system-db.ts` → `purchasePremiumDB()`
- **Script injection**: `app/layout.tsx`

---

## Support

For PayPal integration issues, refer to:
- [PayPal Developer Docs](https://developer.paypal.com/docs)
- [PayPal Checkout Integration Guide](https://developer.paypal.com/docs/checkout)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox)

/**
 * app/api/paypal/verify-order.ts
 * 
 * Verifies PayPal order and marks user as premium
 * 
 * POST /api/paypal/verify-order
 * Body: { orderID: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { purchasePremiumDB } from '@/lib/save-system-db'

const PAYPAL_API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://api.paypal.com'
    : 'https://api-sandbox.sandbox.paypal.com'

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const SECRET = process.env.PAYPAL_CLIENT_SECRET

if (!CLIENT_ID || !SECRET) {
  console.warn('[PayPal API] Missing PAYPAL credentials in environment variables')
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get order ID from request
    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    if (!CLIENT_ID || !SECRET) {
      return NextResponse.json(
        { success: false, message: 'PayPal not configured' },
        { status: 500 }
      )
    }

    // Step 1: Get PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('[PayPal Token Error]', error)
      throw new Error('Failed to authenticate with PayPal')
    }

    const { access_token } = await tokenResponse.json()

    // Step 2: Capture the PayPal order
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
      console.error('[PayPal Capture Error]', error)
      throw new Error(error.message || 'Failed to capture order')
    }

    const orderData = await captureResponse.json()

    // Step 3: Verify order completion status
    if (orderData.status !== 'COMPLETED') {
      console.warn(`[PayPal] Order status is ${orderData.status}, expected COMPLETED`)
      throw new Error(`Payment not completed. Status: ${orderData.status}`)
    }

    // Step 4: Verify amount is correct ($2.99)
    const purchaseAmount = orderData.purchase_units?.[0]?.amount?.value
    if (purchaseAmount !== '2.99') {
      console.warn(
        `[PayPal] Unexpected amount: ${purchaseAmount}, expected 2.99`
      )
      throw new Error('Invalid payment amount')
    }

    // Step 5: Mark user as premium in database
    // Call the local purchase function (uses auth'd user)
    await purchasePremiumDB()

    // Step 6: Log the successful transaction
    console.log('[PayPal Success]', {
      orderId: orderID,
      userId: user.id,
      amount: purchaseAmount,
      status: 'COMPLETED',
    })

    return NextResponse.json({
      success: true,
      message: 'Payment captured and premium activated!',
      orderId: orderID,
    })
  } catch (error) {
    const err = error as Error
    console.error('[PayPal API Error]', err.message)

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          'Payment processing failed. Please try again or contact support.',
      },
      { status: 400 }
    )
  }
}

/**
 * API Response Examples:
 * 
 * SUCCESS (200):
 * {
 *   "success": true,
 *   "message": "Payment captured and premium activated!",
 *   "orderId": "0VF52814937998046"
 * }
 * 
 * ERROR - Missing credentials (500):
 * {
 *   "success": false,
 *   "message": "PayPal not configured"
 * }
 * 
 * ERROR - Capture failed (400):
 * {
 *   "success": false,
 *   "message": "Failed to capture order"
 * }
 */

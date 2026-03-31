"use client"

/**
 * PayPalPaymentModal.tsx
 * Handles PayPal payments with support for both PayPal account and Visa/card payments
 * $2.99 premium purchase
 */

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"

interface PayPalPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
  onError: (error: string) => void
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonConfig) => PayPalButtons
    }
  }
}

interface PayPalButtons {
  render: (selector: string) => Promise<void>
  close: () => Promise<void>
}

interface PayPalButtonConfig {
  clientId?: string
  style?: {
    layout: string
    color: string
    shape: string
    label: string
  }
  createOrder: (data: unknown, actions: { order: { create: (order: unknown) => Promise<string> } }) => Promise<string>
  onApprove: (data: { orderID: string }, actions: unknown) => Promise<void>
  onError: (error: PayPalError) => void
}

interface PayPalError {
  message: string
}

export function PayPalPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: PayPalPaymentModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<PayPalButtons | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasPayPal, setHasPayPal] = useState(false)

  useEffect(() => {
    // Check if PayPal SDK is loaded
    if (typeof window !== "undefined" && window.paypal) {
      setHasPayPal(true)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !hasPayPal || !containerRef.current) return

    const renderPayPalButtons = async () => {
      try {
        if (!window.paypal) {
          onError("PayPal SDK not loaded. Please try again.")
          return
        }

        // Clear previous buttons
        if (containerRef.current) {
          containerRef.current.innerHTML = ""
        }

        // Create new buttons
        buttonsRef.current = window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
          },
          createOrder: async (data, actions) => {
            try {
              // Create order on server (TODO: implement in your backend)
              // For now, we'll create it directly here
              return await actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: "2.99",
                    },
                    description: "Ball Sort Puzzle - Premium",
                  },
                ],
              })
            } catch (err) {
              const error = err as PayPalError
              onError(error.message || "Failed to create order")
              throw err
            }
          },
          onApprove: async (data) => {
            try {
              setLoading(true)

              // Verify payment with backend
              const response = await fetch('/api/paypal/verify-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
              })

              const result = await response.json()

              if (!result.success) {
                throw new Error(result.message || 'Payment verification failed')
              }

              // Call success handler to mark user as premium
              await onSuccess()
              onClose()
            } catch (err) {
              const error = err as PayPalError
              onError(error.message || 'Payment processing failed. Please try again.')
            } finally {
              setLoading(false)
            }
          },
          onError: (err) => {
            onError(err.message || "Payment failed. Please try again.")
          },
        })

        await buttonsRef.current.render("#paypal-buttons-container")
      } catch (err) {
        const error = err as PayPalError
        onError(error.message || "Failed to load PayPal buttons")
      }
    }

    renderPayPalButtons()

    return () => {
      if (buttonsRef.current) {
        buttonsRef.current.close().catch(() => {
          // Ignore close errors
        })
      }
    }
  }, [isOpen, hasPayPal, onClose, onSuccess, onError])

  if (!isOpen) return null

  if (!hasPayPal) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">PayPal Not Available</h2>
            <p className="text-muted-foreground mb-6">
              Add <code className="bg-secondary px-2 py-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to your .env.local to enable payments.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2">Get Premium</h2>
            <p className="text-muted-foreground text-center text-sm mb-6">
              $2.99 one-time payment • Remove all ads forever
            </p>

            {/* PayPal Buttons Container */}
            <div className="mb-4 relative">
              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <div
                ref={containerRef}
                id="paypal-buttons-container"
                className="min-h-[100px] flex items-center justify-center"
              >
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading PayPal...</p>
                </div>
              </div>
            </div>

            {/* Info text */}
            <p className="text-center text-xs text-muted-foreground">
              💳 Accept PayPal account or Visa/Mastercard
              <br />
              🔒 Secure payment powered by PayPal
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

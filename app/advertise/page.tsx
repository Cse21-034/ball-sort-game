"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SubmissionStatus = "idle" | "loading" | "success" | "error"

export default function AdvertiserPortalPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    videoUrl: "",
    callToAction: "",
    targetAudience: "",
    budget: "",
    message: "",
  })

  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/advertiser-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Submission failed")
      }

      setStatus("success")
      setFormData({
        companyName: "",
        email: "",
        phone: "",
        website: "",
        videoUrl: "",
        callToAction: "",
        targetAudience: "",
        budget: "",
        message: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000)
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft size={20} />
            Back to Game
          </Link>
          <h1 className="text-4xl font-bold mb-2">Advertise Your Business</h1>
          <p className="text-slate-400">
            Reach thousands of players in Ball Sort Puzzle. Submit your ad to our platform and grow your audience.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
            <p className="text-sm text-slate-400">Daily Active Players</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-green-400 mb-2">30M+</div>
            <p className="text-sm text-slate-400">Monthly Ad Impressions</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">Global</div>
            <p className="text-sm text-slate-400">Audience Reach</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800/50 rounded-lg p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Submit Your Ad</h2>

          {status === "success" && (
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-400">Success!</p>
                <p className="text-sm text-slate-300">Your ad submission has been received. We'll review it within 2-3 business days and contact you at the email provided.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Submission Error</p>
                <p className="text-sm text-slate-300">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Company Information</h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Your Company Name"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourcompany.com"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Ad Details */}
            <div className="space-y-4 pt-6 border-t border-slate-600">
              <h3 className="text-lg font-semibold text-slate-200">Ad Details</h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Video URL (MP4) *
                </label>
                <Input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-ad.mp4"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Recommended: 30 seconds, MP4 format. Max 50MB.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Call-to-Action Button Text *
                </label>
                <Input
                  type="text"
                  name="callToAction"
                  value={formData.callToAction}
                  onChange={handleInputChange}
                  placeholder="Learn More"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select target audience</option>
                  <option value="casual-gamers">Casual Gamers</option>
                  <option value="mobile-users">Mobile Users</option>
                  <option value="puzzle-enthusiasts">Puzzle Enthusiasts</option>
                  <option value="all">All Users</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Monthly Budget (USD) *
                </label>
                <Input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="1000"
                  min="100"
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400 mt-2">Minimum: $100/month</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4 pt-6 border-t border-slate-600">
              <h3 className="text-lg font-semibold text-slate-200">Additional Information</h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tell us about your business
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="What makes your product/service unique?"
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Ad Proposal
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              * Required fields. We'll review your submission and contact you within 2-3 business days.
            </p>
          </form>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-slate-800/50 rounded-lg p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">What formats do you accept for ads?</h3>
              <p className="text-slate-400">
                We accept MP4 video ads (30-60 seconds). Ads can include banners or interstitial formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 mb-2">How much does advertising cost?</h3>
              <p className="text-slate-400">
                Pricing starts at $100/month and scales based on impressions and engagement. We offer CPM-based pricing ($0.50-$5 per 1,000 impressions).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 mb-2">How long does review take?</h3>
              <p className="text-slate-400">
                Our team reviews submissions within 2-3 business days. We'll contact you with approval status and next steps.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 mb-2">What happens after I submit?</h3>
              <p className="text-slate-400">
                We'll review your ad for compliance, quality, and appropriateness. If approved, we'll send you a contract and onboarding details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Can I track ad performance?</h3>
              <p className="text-slate-400">
                Yes! You'll have access to a dashboard showing impressions, clicks, CTR, and engagement metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

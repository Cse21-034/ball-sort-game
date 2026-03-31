"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Game
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-slate-400">
            Effective Date: April 1, 2026 | Last Updated: April 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 rounded-lg p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Ball Sort Puzzle (the "Game"), you agree to be bound by these Terms and
                Conditions. If you do not agree to these terms, please do not use the Game.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
              <p>
                Ball Sort Puzzle is a free-to-play casual puzzle game available on web browsers and as a progressive
                web application (PWA). The Game includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gameplay and level progression</li>
                <li>Optional in-game premium features (paid via PayPal)</li>
                <li>Advertisements (Google AdSense)</li>
                <li>Leaderboard functionality</li>
                <li>User accounts (via Google authentication)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-white mb-2">3.1 Registration</h3>
              <p>
                You may create an account using Google Sign-In. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Keeping your account information accurate and up-to-date</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">3.2 Account Termination</h3>
              <p>
                We reserve the right to terminate or suspend your account at any time for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violating these Terms and Conditions</li>
                <li>Engaging in fraudulent or illegal activity</li>
                <li>Abuse of the Game or services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Intellectual Property</h2>
              <p>
                All content in Ball Sort Puzzle is owned by or licensed to us and protected by copyright law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Premium Features & Payments</h2>
              <h3 className="text-xl font-semibold text-white mb-2">5.1 Premium Subscription</h3>
              <p>
                The Game offers optional premium features available for $2.99 USD. Premium features provide an
                ad-free gaming experience.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.2 Payment Processing</h3>
              <p>
                Payments are processed securely through PayPal. By purchasing premium features, you agree to PayPal's
                Terms of Service.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.3 Refunds</h3>
              <p>
                Refund requests must be submitted within 7 days of purchase. Digital goods are non-refundable after
                delivery, except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Advertisements</h2>
              <p>
                The Game displays advertisements powered by Google AdSense. You agree not to click your own ads or
                engage in any fraudulent activity related to advertisements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Limitations of Liability</h2>
              <p>
                The Game is provided on an "AS-IS" and "AS-AVAILABLE" basis. We make no warranties regarding
                uninterrupted service or error-free gameplay. To the maximum extent permitted by law, we are not liable
                for loss of data or any indirect damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use cheats, hacks, or bots</li>
                <li>Engage in account sharing</li>
                <li>Harass other users</li>
                <li>Exploit bugs or vulnerabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Changes to Terms</h2>
              <p>
                We may update these Terms and Conditions at any time. Continued use of the Game after updates
                constitutes acceptance of new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Contact Us</h2>
              <p>
                For questions regarding these Terms and Conditions, please contact us at{" "}
                <a href="mailto:support@ballsortgame.com" className="text-blue-400 hover:text-blue-300">
                  support@ballsortgame.com
                </a>
              </p>
            </section>

            <div className="border-t border-slate-700 pt-6 mt-8 text-sm text-slate-400">
              <p>
                <strong>Full Terms & Conditions:</strong> For the complete Terms and Conditions, please see{" "}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                  the full document.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

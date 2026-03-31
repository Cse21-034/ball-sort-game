"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-slate-400">
            Effective Date: April 1, 2026 | Last Updated: April 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 rounded-lg p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
              <p>
                Ball Sort Puzzle respects your privacy. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our game.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address and name (via Google Sign-In)</li>
                <li>Game scores and progress</li>
                <li>Username/player name</li>
                <li>Premium purchase confirmation</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usage data and gameplay analytics</li>
                <li>Device type and operating system</li>
                <li>IP address and approximate location</li>
                <li>Cookies for authentication and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Enable you to play the Game and create accounts</li>
                <li>Save game progress and display leaderboards</li>
                <li>Understand how users interact with the game (analytics)</li>
                <li>Display relevant advertisements</li>
                <li>Process premium purchases</li>
                <li>Improve gameplay experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Third-Party Services</h2>

              <h3 className="text-xl font-semibold text-white mb-2">4.1 Google Services</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Authentication:</strong> Google Sign-In for account creation
                </li>
                <li>
                  <strong>Analytics:</strong> Google Analytics tracks usage patterns
                </li>
                <li>
                  <strong>Advertising:</strong> Google AdSense displays personalized ads
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.2 PayPal</h3>
              <p>Premium purchases are processed securely through PayPal. We do NOT store your credit card information.</p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.3 Supabase</h3>
              <p>Game progress and leaderboard data are stored on Supabase servers with encryption in transit.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-white mb-2">GDPR Rights (EEA, UK, Switzerland)</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your data ("Right to be Forgotten")</li>
                <li>Restrict data processing</li>
                <li>Opt-out of non-essential cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">CCPA Rights (California)</h3>
              <p>California residents can request to know, delete, and opt-out of data processing.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Cookies & Tracking</h2>
              <p>We use cookies for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Session authentication and security</li>
                <li>Google Analytics tracking</li>
                <li>Ad personalization (Google AdSense)</li>
              </ul>
              <p className="mt-3">
                You can manage cookie preferences in your browser settings or through our consent banner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Children's Privacy</h2>
              <p>
                We comply with COPPA (Children's Online Privacy Protection Act). For users under 13, parental consent
                may be required, and we collect limited data with no targeted advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Data Security</h2>
              <p>We implement security measures including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>HTTPS encryption for all data transmission</li>
                <li>Encrypted database storage</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Game progress: Active account lifetime</li>
                <li>Leaderboard scores: 1 year</li>
                <li>Cookies: 2 years</li>
                <li>Analytics data: 14 months</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Changes are effective immediately, and continued use of
                the Game constitutes acceptance of new policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. Contact Us</h2>
              <p>
                For privacy questions, please contact us at:
                <a href="mailto:support@ballsortgame.com" className="text-blue-400 hover:text-blue-300 block mt-2">
                  support@ballsortgame.com
                </a>
              </p>
            </section>

            <div className="border-t border-slate-700 pt-6 mt-8 text-sm text-slate-400">
              <p>
                <strong>Full Privacy Policy:</strong> For the complete Privacy Policy, please see{" "}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
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

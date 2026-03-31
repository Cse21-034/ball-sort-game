"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdvertiserSubmission {
  id: string
  company_name: string
  email: string
  phone?: string
  website?: string
  video_url: string
  call_to_action: string
  target_audience?: string
  monthly_budget: number
  message?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function AdvertiserManagementPage() {
  const [submissions, setSubmissions] = useState<AdvertiserSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Note: This is a placeholder. In production, implement proper authentication
      const response = await fetch("/api/advertiser-submissions", {
        method: "GET",
        headers: {
          "Authorization": "Bearer admin-token", // Replace with real auth
        },
      })

      if (response.status === 401) {
        setError("Unauthorized. Please log in as admin.")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch submissions")
      }

      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    // Implement approval logic
    alert("Approval feature coming soon. ID: " + id)
  }

  const handleReject = async (id: string) => {
    // Implement rejection logic
    alert("Rejection feature coming soon. ID: " + id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return <CheckCircle size={18} className="text-green-400" />
      case "rejected":
        return <XCircle size={18} className="text-red-400" />
      case "pending":
        return <Clock size={18} className="text-yellow-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Advertiser Submissions</h1>
          <p className="text-slate-400">
            Review and manage advertiser proposals
          </p>
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700 overflow-hidden">
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-600 border-t-blue-400 rounded-full"></div>
              <p className="mt-4 text-slate-400">Loading submissions...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-red-400 font-semibold mb-4">{error}</p>
              <Button onClick={fetchSubmissions} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && submissions.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-slate-400">No pending submissions at this time.</p>
            </div>
          )}

          {!loading && !error && submissions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Budget</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Audience</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{submission.company_name}</p>
                          {submission.website && (
                            <a
                              href={submission.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              {submission.website}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <a href={`mailto:${submission.email}`} className="hover:text-blue-400">
                          {submission.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-400">
                        ${submission.monthly_budget}/mo
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {submission.target_audience || "All"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          <span className="text-sm capitalize">{submission.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert("view details for: " + submission.id)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-green-900/30 hover:text-green-400"
                            onClick={() => handleApprove(submission.id)}
                            disabled={submission.status !== "pending"}
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-900/30 hover:text-red-400"
                            onClick={() => handleReject(submission.id)}
                            disabled={submission.status !== "pending"}
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && !error && submissions.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total Submissions</p>
              <p className="text-3xl font-bold text-white">{submissions.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Total Potential Budget</p>
              <p className="text-3xl font-bold text-green-400">
                ${submissions.reduce((sum, s) => sum + s.monthly_budget, 0).toLocaleString()}/mo
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-400">
                {submissions.filter((s) => s.status === "pending").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

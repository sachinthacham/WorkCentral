"use client"

import { useState } from "react"
import { forgotPassword } from "@/features/auth/api"
import Link from "next/link"
import { Mail, ArrowLeft, Zap } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError("")
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">Workspace</span>
        </div>

        <div className="card p-8">
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Mail size={24} className="text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Check your email</h1>
              <p className="text-sm text-slate-600 mb-6">
                If <span className="font-medium text-slate-900">{email}</span> is registered, you'll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

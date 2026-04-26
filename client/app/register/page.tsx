"use client"

import { useState } from "react"
import { registerUser } from "@/features/auth/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, User, Mail, Lock, Hexagon } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return

    setIsLoading(true)
    try {
      const res = await registerUser({ name, email, password })
      localStorage.setItem("accessToken", res.accessToken)
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken)
      }
      router.push("/dashboard")
    } catch {
      alert("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="auth-logo mx-auto mb-5">
            <Hexagon size={28} strokeWidth={2.25} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-900">Create your workspace</h1>
          <p className="mt-2 text-[15px] text-zinc-600">One calm place for projects, tasks, and your team.</p>
        </div>

        <div className="auth-card p-8 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Full name</label>
              <div className="relative">
                <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200/90 bg-white/80 py-3 pl-11 pr-4 text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Alex Morgan"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Email</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200/90 bg-white/80 py-3 pl-11 pr-4 text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Password</label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200/90 bg-white/80 py-3 pl-11 pr-12 text-[15px] text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 [background:linear-gradient(145deg,#0d9488_0%,#0f766e_100%)] shadow-teal-500/25 hover:brightness-105"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

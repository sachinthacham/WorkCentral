"use client";

import { useEffect, useState } from "react";
import { loginUser } from "@/features/auth/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Hexagon } from "lucide-react";

const SAVED_EMAIL_KEY = "savedLoginEmail";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      localStorage.removeItem("workspaceId");
      localStorage.removeItem("role");
      localStorage.setItem("accessToken", res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }
      if (rememberEmail) {
        localStorage.setItem(SAVED_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }
      router.push("/dashboard");
    } catch {
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="auth-logo mx-auto mb-5">
            <Hexagon size={28} strokeWidth={2.25} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-900">
            Welcome back
          </h1>
          <p className="mt-2 text-[15px] text-zinc-600">
            Sign in to WorkCentral and pick up where you left off.
          </p>
        </div>

        <div className="auth-card p-8 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
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
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
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

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500/30"
              />
              <span>Remember email on this device</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 [background:linear-gradient(145deg,#0d9488_0%,#0f766e_100%)] shadow-teal-500/25 hover:brightness-105"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs font-medium tracking-wide text-zinc-500">
          Encrypted sessions · Built for teams
        </p>
      </div>
    </div>
  );
}

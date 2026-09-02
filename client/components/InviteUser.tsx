"use client"

import { useState } from "react"
import { inviteUser } from "@/features/workspace/api"
import Button from "./ui/Button"
import { Input } from "./ui/Input"
import { Send } from "lucide-react"

export default function InviteUser() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("MEMBER")
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!email) return
    setLoading(true); setStatus("idle")
    try {
      await inviteUser({ email, role })
      setEmail(""); setStatus("ok")
      setTimeout(() => setStatus("idle"), 4000)
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Failed to send invitation. Please try again.")
      setStatus("err")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
          >
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <Button
        loading={loading}
        disabled={!email}
        icon={<Send size={13} />}
        onClick={handleInvite}
      >
        Send Invitation
      </Button>

      {status === "ok" && (
        <p className="text-sm font-medium text-emerald-600">✓ Invitation sent successfully</p>
      )}
      {status === "err" && (
        <p className="text-sm font-medium text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

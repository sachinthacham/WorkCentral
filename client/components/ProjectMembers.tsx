"use client"

import { useEffect, useState } from "react"
import {
  getProjectMembers, addProjectMember,
  updateProjectMemberRole, removeProjectMember,
  getMyProjectRole,
} from "@/features/projects/api"
import { getWorkspaceMembers } from "@/features/workspace/api"
import Avatar from "./ui/Avatar"
import Button from "./ui/Button"
import EmptyState from "./ui/EmptyState"
import { Users, UserPlus, Trash2, ChevronDown } from "lucide-react"

const ROLES = ["MANAGER", "MEMBER", "VIEWER"] as const

export default function ProjectMembers({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<any[]>([])
  const [myRole, setMyRole] = useState<string | null>(null)
  const [wsMembers, setWsMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState<"MANAGER" | "MEMBER" | "VIEWER">("MEMBER")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [storedRole, setStoredRole] = useState<string | null>(null)

  useEffect(() => { setStoredRole(localStorage.getItem("role")) }, [])

  const load = async () => {
    try {
      const [mems, role, ws] = await Promise.all([
        getProjectMembers(projectId),
        getMyProjectRole(projectId).catch(() => null),
        getWorkspaceMembers(),
      ])
      setMembers(mems || [])
      setMyRole(role?.role ?? null)
      setWsMembers(ws || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [projectId])

  const canManage = myRole === "MANAGER" || ["OWNER", "ADMIN"].includes(storedRole ?? "")

  const handleAdd = async () => {
    if (!selectedUser) return
    setSaving(true); setError("")
    try {
      await addProjectMember(projectId, { userId: selectedUser, role: selectedRole })
      setSelectedUser(""); setShowAdd(false); load()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to add member")
    } finally { setSaving(false) }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateProjectMemberRole(projectId, userId, role)
      load()
    } catch (e) { console.error(e) }
  }

  const handleRemove = async (userId: string) => {
    try {
      await removeProjectMember(projectId, userId)
      load()
    } catch (e) { console.error(e) }
  }

  // Users in workspace but not already in project
  const memberIds = new Set(members.map((m: any) => m.userId))
  const available = wsMembers.filter((m: any) => !memberIds.has(m.userId))

  const roleBg: Record<string, string> = {
    MANAGER: "bg-violet-100 text-violet-700 border-violet-200",
    MEMBER:  "bg-teal-100 text-teal-700 border-teal-200",
    VIEWER:  "bg-slate-100 text-slate-600 border-slate-200",
  }

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Loading members…</p>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Project Members</h3>
          <p className="text-xs text-slate-500 mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        {canManage && (
          <Button size="sm" icon={<UserPlus size={13} />} onClick={() => setShowAdd(!showAdd)}>
            Add Member
          </Button>
        )}
      </div>

      {/* Add member form */}
      {showAdd && canManage && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Add to Project</p>
          <div className="flex gap-2">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-400 focus:outline-none"
            >
              <option value="">Select workspace member…</option>
              {available.map((m: any) => (
                <option key={m.userId} value={m.userId}>{m.name || m.email}</option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-400 focus:outline-none"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" loading={saving} disabled={!selectedUser} onClick={handleAdd}>
              Add Member
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setError("") }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      {members.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No project members"
          description="Add workspace members to collaborate on this project"
        />
      ) : (
        <div className="space-y-2">
          {members.map((m: any) => (
            <div key={m.userId} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 transition-colors">
              <Avatar name={m.name || m.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{m.name || "—"}</p>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
              </div>

              {/* Role selector or badge */}
              {canManage && m.role !== "MANAGER" ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 focus:border-teal-400 focus:outline-none"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <span className={`badge border ${roleBg[m.role] ?? roleBg.MEMBER}`}>{m.role}</span>
              )}

              {/* Remove */}
              {canManage && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="ml-1 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                  title="Remove from project"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

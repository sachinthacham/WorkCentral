"use client"

import { useEffect, useState } from "react"
import { getWorkspaceMembers } from "@/features/workspace/api"
import Avatar from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { SkeletonList } from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import InviteUser from "@/components/InviteUser"
import Button from "@/components/ui/Button"
import { Users, UserPlus } from "lucide-react"

const roleBadgeVariant = (role: string) => {
  switch (role?.toUpperCase()) {
    case "OWNER": return "bg-violet-100 text-violet-700 border-violet-200"
    case "ADMIN": return "bg-teal-100 text-teal-700 border-teal-200"
    case "MEMBER": return "bg-slate-100 text-slate-600 border-slate-200"
    case "GUEST": return "bg-amber-100 text-amber-700 border-amber-200"
    default: return "bg-slate-100 text-slate-600 border-slate-200"
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const canInvite = role === "OWNER" || role === "ADMIN" || role === "admin"

  useEffect(() => { setRole(localStorage.getItem("role")) }, [])

  const load = async () => {
    try {
      const data = await getWorkspaceMembers()
      setMembers(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="animate-in space-y-4">
      <PageHeader title="Team Members" description={`${members.length} member${members.length !== 1 ? "s" : ""} in this workspace`}>
        {canInvite && (
          <Button icon={<UserPlus size={14} />} onClick={() => setShowInvite(!showInvite)}>
            Invite Member
          </Button>
        )}
      </PageHeader>

      {showInvite && (
        <div className="card p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-700">Invite to workspace</h3>
          <InviteUser />
        </div>
      )}

      {loading ? (
        <SkeletonList rows={6} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No members yet"
          description="Invite people to collaborate in this workspace"
          action={canInvite ? { label: "Invite Member", onClick: () => setShowInvite(true) } : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-600">Member</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-600">Email</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-600">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {members.map((m: any) => (
                <tr key={m.userId} className="transition-colors hover:bg-teal-50/40">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={m.name || m.email} size="sm" />
                      <span className="font-semibold text-zinc-900">{m.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium text-zinc-600">{m.email}</td>
                  <td className="px-3 py-2">
                    <span className={`badge border ${roleBadgeVariant(m.role)}`}>
                      {m.role?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

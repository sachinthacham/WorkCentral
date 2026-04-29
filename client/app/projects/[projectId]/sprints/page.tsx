"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSprints, createSprint, updateSprintStatus } from "@/features/sprints/api"
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonList } from "@/components/ui/Skeleton"
import PageHeader from "@/components/ui/PageHeader"
import { Plus, GitBranch, ArrowLeft, Play, CheckCircle, Lock } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PLANNED: { label: "Planned",  dot: "bg-slate-400",   bg: "bg-slate-100",   text: "text-slate-600" },
  ACTIVE:  { label: "Active",   dot: "bg-blue-500",    bg: "bg-blue-50",     text: "text-blue-700" },
  CLOSED:  { label: "Closed",   dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700" },
}

export default function SprintsPage() {
  const { projectId } = useParams()
  const id = projectId as string
  const router = useRouter()

  const [sprints, setSprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      const data = await getSprints(id)
      setSprints(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createSprint({ name: newName, projectId: id })
      setNewName(""); setCreating(false); load()
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (sprintId: string, status: string) => {
    await updateSprintStatus(sprintId, status)
    load()
  }

  return (
    <div className="animate-in space-y-4">
      <PageHeader title="Sprints" description="Plan and manage your agile sprints.">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={() => router.push(`/projects/${id}`)}>
          Back to Board
        </Button>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setCreating(!creating)}>
          New Sprint
        </Button>
      </PageHeader>

      {creating && (
        <div className="card p-5 flex gap-3">
          <Input
            placeholder="Sprint name (e.g. Sprint 1)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1"
          />
          <Button loading={saving} disabled={!newName.trim()} onClick={handleCreate}>Save</Button>
          <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={3} />
      ) : sprints.length === 0 && !creating ? (
        <EmptyState
          icon={<GitBranch size={28} />}
          title="No sprints yet"
          description="Create your first sprint to start agile tracking"
          action={{ label: "New Sprint", onClick: () => setCreating(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sprints.map((sprint: any) => {
            const cfg = STATUS_CONFIG[sprint.status] ?? STATUS_CONFIG.PLANNED
            return (
              <div key={sprint._id} className="card p-5 hover:shadow-md transition-all">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 flex items-center justify-center rounded-lg ${cfg.bg}`}>
                      <GitBranch size={15} className={cfg.text} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{sprint.name}</h3>
                    </div>
                  </div>
                  <span className={`badge ${cfg.bg} ${cfg.text} border-0 shrink-0`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} mr-1`} />
                    {cfg.label}
                  </span>
                </div>

                {sprint.startDate && sprint.endDate && (
                  <p className="mb-4 text-xs text-slate-500">
                    {new Date(sprint.startDate).toLocaleDateString()} → {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                )}

                {/* Action */}
                {sprint.status === "PLANNED" && (
                  <Button variant="outline" size="sm" className="w-full" icon={<Play size={12} />} onClick={() => handleStatus(sprint._id, "ACTIVE")}>
                    Start Sprint
                  </Button>
                )}
                {sprint.status === "ACTIVE" && (
                  <Button variant="primary" size="sm" className="w-full" icon={<CheckCircle size={12} />} onClick={() => handleStatus(sprint._id, "CLOSED")}>
                    Complete Sprint
                  </Button>
                )}
                {sprint.status === "CLOSED" && (
                  <Button variant="ghost" size="sm" className="w-full opacity-50 cursor-not-allowed" icon={<Lock size={12} />} disabled>
                    Sprint Closed
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

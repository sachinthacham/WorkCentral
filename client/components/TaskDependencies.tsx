"use client"

import { useEffect, useState } from "react"
import { getDependencies, addDependency, removeDependency } from "@/features/tasks/api"
import { StatusBadge } from "./ui/Badge"
import { Link2, Link2Off, Plus, AlertCircle, ChevronRight } from "lucide-react"

export default function TaskDependencies({ taskId }: { taskId: string }) {
  const [deps, setDeps] = useState<{ blockedBy: any[]; blocks: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [blockingId, setBlockingId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    try {
      const data = await getDependencies(taskId)
      setDeps(data)
    } catch { setDeps({ blockedBy: [], blocks: [] }) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [taskId])

  const handleAdd = async () => {
    if (!blockingId.trim()) return
    setSaving(true); setError("")
    try {
      await addDependency(taskId, blockingId.trim())
      setBlockingId(""); setShowForm(false); load()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to add dependency")
    } finally { setSaving(false) }
  }

  const handleRemove = async (blockingTaskId: string) => {
    try { await removeDependency(taskId, blockingTaskId); load() }
    catch (e) { console.error(e) }
  }

  if (loading) return <p className="py-6 text-center text-sm text-slate-400">Loading dependencies…</p>

  const blockedBy = deps?.blockedBy ?? []
  const blocks    = deps?.blocks    ?? []

  return (
    <div className="space-y-6">
      {/* Blocked By */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <AlertCircle size={11} className="text-amber-500" /> Blocked by
          {blockedBy.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              {blockedBy.length}
            </span>
          )}
        </p>
        {blockedBy.length === 0 ? (
          <p className="text-xs text-slate-400 italic">This task has no blockers.</p>
        ) : (
          <div className="space-y-2">
            {blockedBy.map((t: any) => (
              <DependencyRow key={t._id} task={t} onRemove={() => handleRemove(t._id)} />
            ))}
          </div>
        )}
      </div>

      {/* Blocks */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <ChevronRight size={11} className="text-red-500" /> Blocks
          {blocks.length > 0 && (
            <span className="ml-1 rounded-full bg-red-100 border border-red-300 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
              {blocks.length}
            </span>
          )}
        </p>
        {blocks.length === 0 ? (
          <p className="text-xs text-slate-400 italic">This task doesn't block anything.</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((t: any) => (
              <div key={t._id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                <Link2 size={13} className="text-red-400 shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-800 truncate">{t.title}</span>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add dependency */}
      {showForm ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Add Blocker</p>
          <input
            autoFocus
            value={blockingId}
            onChange={(e) => setBlockingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Paste blocking task ID…"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          {error && <p className="text-xs text-red-600 font-medium flex items-center gap-1.5"><AlertCircle size={11} />{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !blockingId.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
            >
              <Plus size={12} /> {saving ? "Adding…" : "Add"}
            </button>
            <button onClick={() => { setShowForm(false); setError("") }} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-teal-400 hover:text-teal-600 w-full transition-colors"
        >
          <Link2 size={14} /> Add blocker dependency
        </button>
      )}
    </div>
  )
}

function DependencyRow({ task, onRemove }: { task: any; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 group">
      <AlertCircle size={13} className="text-amber-500 shrink-0" />
      <span className="flex-1 text-sm font-medium text-slate-800 truncate">{task.title}</span>
      <StatusBadge status={task.status} />
      <button
        onClick={onRemove}
        className="ml-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Link2Off size={11} /> Remove
      </button>
    </div>
  )
}

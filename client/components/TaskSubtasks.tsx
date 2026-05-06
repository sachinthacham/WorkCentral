"use client"

import { useEffect, useState } from "react"
import { getSubtasks, createSubtask } from "@/features/tasks/api"
import { StatusBadge, PriorityBadge } from "./ui/Badge"
import { Plus, GitBranch, CheckCircle2 } from "lucide-react"

export default function TaskSubtasks({ taskId, projectId }: { taskId: string; projectId: string }) {
  const [subtasks, setSubtasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("medium")
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    try {
      const data = await getSubtasks(taskId)
      setSubtasks(Array.isArray(data) ? data : [])
    } catch { setSubtasks([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [taskId])

  const handleCreate = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await createSubtask(taskId, { title, priority, projectId })
      setTitle(""); setPriority("medium"); setShowForm(false); load()
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (loading) return <p className="py-6 text-center text-sm text-slate-400">Loading subtasks…</p>

  return (
    <div className="space-y-4">
      {/* List */}
      {subtasks.length === 0 && !showForm ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <GitBranch size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No subtasks yet</p>
          <p className="text-xs text-slate-500 mt-1">Break this task into smaller pieces</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subtasks.map((sub: any) => (
            <div key={sub._id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
              <CheckCircle2
                size={16}
                className={sub.status === "done" ? "text-emerald-500" : "text-slate-300"}
              />
              <span className={["flex-1 text-sm font-medium", sub.status === "done" ? "line-through text-slate-400" : "text-slate-800"].join(" ")}>
                {sub.title}
              </span>
              <StatusBadge status={sub.status} />
              {sub.priority && <PriorityBadge priority={sub.priority} />}
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showForm ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-600">New Subtask</p>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Subtask title…"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <div className="flex items-center gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-teal-400 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={saving || !title.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50 transition-colors"
            >
              <Plus size={12} /> {saving ? "Creating…" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-teal-400 hover:text-teal-600 w-full transition-colors"
        >
          <Plus size={14} /> Add subtask
        </button>
      )}
    </div>
  )
}

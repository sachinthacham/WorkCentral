"use client"

import { useState } from "react"
import {
  updateTask, uploadAttachment, deleteTask,
  createSubtask, getSubtasks,
  addDependency, removeDependency, getDependencies,
} from "@/features/tasks/api"
import Modal from "./ui/Modal"
import { StatusBadge, PriorityBadge } from "./ui/Badge"
import {
  Calendar, CheckSquare, Paperclip, Upload, Palette, X,
  Trash2, Plus, GitMerge, Link2, Link2Off, AlertCircle,
} from "lucide-react"
import TaskComments from "./TaskComments"
import TaskActivity from "./TaskActivity"
import TaskSubtasks from "./TaskSubtasks"
import TaskDependencies from "./TaskDependencies"

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", ""]

type Tab = "details" | "subtasks" | "dependencies" | "comments" | "activity"

export default function TaskDetailModal({ task, isOpen, onClose, refresh }: any) {
  const [coverColor, setCoverColor] = useState(task.coverColor || "")
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  )
  const [checklist, setChecklist] = useState<any[]>(task.checklist || [])
  const [newItem, setNewItem] = useState("")
  const [attachments, setAttachments] = useState<string[]>(task.attachments || [])
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<Tab>("details")
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = async (payload: any) => {
    await updateTask(task._id, payload)
    refresh?.()
  }

  const handleColorChange = (c: string) => { setCoverColor(c); save({ coverColor: c }) }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value); save({ dueDate: e.target.value })
  }

  const addChecklistItem = () => {
    if (!newItem.trim()) return
    const item = { id: Date.now().toString(), text: newItem, isCompleted: false }
    const updated = [...checklist, item]
    setChecklist(updated); setNewItem(""); save({ checklist: updated })
  }

  const toggleItem = (id: string) => {
    const updated = checklist.map((i) => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i)
    setChecklist(updated); save({ checklist: updated })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const updated = await uploadAttachment(task._id, file)
      setAttachments(updated.attachments || []); refresh?.()
    } catch (err) { console.error(err) } finally { setUploading(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await deleteTask(task._id); refresh?.(); onClose() }
    catch (err) { console.error(err); setDeleting(false); setConfirmDelete(false) }
  }

  const done  = checklist.filter((i) => i.isCompleted).length
  const total = checklist.length
  const prog  = total ? Math.round((done / total) * 100) : 0

  const TABS: { id: Tab; label: string }[] = [
    { id: "details",      label: "Details" },
    { id: "subtasks",     label: "Subtasks" },
    { id: "dependencies", label: "Dependencies" },
    { id: "comments",     label: "Comments" },
    { id: "activity",     label: "Activity" },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Cover */}
      {coverColor && (
        <div className="-mx-6 -mt-6 mb-5 h-14 rounded-t-xl" style={{ backgroundColor: coverColor }} />
      )}

      {/* Title + badges + delete */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">{task.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {task.priority && <PriorityBadge priority={task.priority} />}
            {(task.labels || []).map((l: string, i: number) => (
              <span key={i} className="badge bg-slate-100 text-slate-600 border-slate-200">{l}</span>
            ))}
          </div>
        </div>
        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        ) : (
          <div className="shrink-0 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5">
            <AlertCircle size={13} className="text-red-600" />
            <span className="text-xs text-red-700 font-medium">Confirm?</span>
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-bold text-red-700 hover:text-red-900">
              {deleting ? "Deleting…" : "Yes"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500 hover:text-slate-700">No</button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="mb-5 flex gap-0.5 border-b border-slate-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-t-md px-4 py-2 text-xs font-semibold capitalize transition-colors border-b-2",
              tab === t.id
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      {tab === "details" && (
        <div className="grid gap-6 sm:grid-cols-5">
          <div className="sm:col-span-3 space-y-6">
            {task.description && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Description</p>
                <p className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* Checklist */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckSquare size={12} /> Checklist
                </p>
                {total > 0 && <span className="text-xs font-medium text-slate-500">{done}/{total}</span>}
              </div>
              {total > 0 && (
                <div className="mb-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${prog}%` }} />
                </div>
              )}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={item.isCompleted} onChange={() => toggleItem(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600" />
                    <span className={["text-sm", item.isCompleted ? "line-through text-slate-400" : "text-slate-700"].join(" ")}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} placeholder="Add item…"
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm focus:border-teal-400 focus:outline-none" />
                <button onClick={addChecklistItem}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300">
                  Add
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Paperclip size={12} /> Attachments
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {attachments.map((url, i) => (
                  <a key={i} href={`http://localhost:3000${url}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100">
                    <Paperclip size={11} /> Attachment {i + 1}
                  </a>
                ))}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:border-teal-400 hover:text-teal-600 transition-colors">
                <Upload size={12} />
                {uploading ? "Uploading…" : "Upload file"}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sm:col-span-2 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar size={11} /> Due Date
                </p>
                <input type="date" value={dueDate} onChange={handleDateChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-teal-400 focus:outline-none" />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Palette size={11} /> Cover Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c, i) => (
                    <button key={i} onClick={() => handleColorChange(c)}
                      className={["h-7 w-7 rounded-full border-2 shadow-sm transition-all",
                        coverColor === c ? "border-teal-600 scale-110" : "border-slate-200 hover:scale-105"].join(" ")}
                      style={{ backgroundColor: c || "#f8fafc" }}>
                      {c === "" && <X size={10} className="mx-auto text-slate-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Subtasks ─────────────────────────────────────────────────────── */}
      {tab === "subtasks" && (
        <TaskSubtasks taskId={task._id} projectId={task.projectId} />
      )}

      {/* ── Dependencies ─────────────────────────────────────────────────── */}
      {tab === "dependencies" && (
        <TaskDependencies taskId={task._id} />
      )}

      {tab === "comments" && (
        <div className="max-h-96 overflow-y-auto">
          <TaskComments taskId={task._id} />
        </div>
      )}

      {tab === "activity" && (
        <div className="max-h-96 overflow-y-auto">
          <TaskActivity taskId={task._id} />
        </div>
      )}
    </Modal>
  )
}

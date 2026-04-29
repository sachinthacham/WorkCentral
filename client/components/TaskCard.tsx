"use client"

import { assignTask } from "@/features/tasks/api"
import { getWorkspaceMembers } from "@/features/workspace/api"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEffect, useState } from "react"
import TaskDetailModal from "./TaskDetailModal"
import { PriorityBadge } from "./ui/Badge"
import Avatar from "./ui/Avatar"
import { Calendar, CheckSquare, MessageSquare, Paperclip } from "lucide-react"

export default function TaskCard({ task, refresh }: any) {
  const [members, setMembers] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    getWorkspaceMembers().then(setMembers).catch(() => {})
  }, [])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleAssign = async (userId: string) => {
    if (!userId) return
    await assignTask(task._id, userId)
    refresh?.()
  }

  const assigneeMember = members.find((m) => m.userId === task.assignee)
  const checklistDone = (task.checklist || []).filter((c: any) => c.isCompleted).length
  const checklistTotal = (task.checklist || []).length
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => setIsModalOpen(true)}
        className={[
          "group relative cursor-grab rounded-xl bg-white p-3.5 transition-all active:cursor-grabbing",
          "border border-slate-300 shadow-sm hover:border-teal-400 hover:shadow-md",
          isDragging ? "opacity-50 shadow-xl border-teal-400 rotate-1" : "opacity-100",
          task.coverColor ? "pt-2" : "",
        ].join(" ")}
      >
        {/* Cover strip */}
        {task.coverColor && (
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl" style={{ backgroundColor: task.coverColor }} />
        )}

        {/* Title */}
        <p className="mb-2 text-sm font-semibold leading-snug text-slate-900 pr-1">
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className="mb-3 text-xs text-slate-600 line-clamp-2">{task.description}</p>
        )}

        {/* Tags row */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {task.priority && <PriorityBadge priority={task.priority} />}
          {(task.labels || []).map((label: string, i: number) => (
            <span key={i} className="badge bg-slate-100 text-slate-600 border-slate-200">{label}</span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2" onPointerDown={(e) => e.stopPropagation()}>
          {/* Assignee */}
          <div className="flex-1 min-w-0">
            {assigneeMember ? (
              <div className="flex items-center gap-1.5">
                <Avatar name={assigneeMember.name || assigneeMember.email} size="xs" />
                <span className="text-xs text-slate-500 truncate">{assigneeMember.name || assigneeMember.email}</span>
              </div>
            ) : (
              <select
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 focus:border-teal-400 focus:outline-none"
                onChange={(e) => handleAssign(e.target.value)}
                defaultValue=""
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Assign…</option>
                {members.map((m: any) => (
                  <option key={m.userId} value={m.userId}>{m.name || m.email}</option>
                ))}
              </select>
            )}
          </div>

          {/* Meta icons */}
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            {checklistTotal > 0 && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <CheckSquare size={11} />
                {checklistDone}/{checklistTotal}
              </span>
            )}
            {task.dueDate && (
              <span className={["flex items-center gap-0.5 text-[10px]", isOverdue ? "text-red-500" : ""].join(" ")}>
                <Calendar size={11} />
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refresh={refresh}
      />
    </>
  )
}

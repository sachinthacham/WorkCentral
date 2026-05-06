"use client"

import { useState } from "react"
import TaskDetailModal from "./TaskDetailModal"
import { updateTaskStatus } from "@/features/tasks/api"
import { StatusBadge, PriorityBadge } from "./ui/Badge"
import EmptyState from "./ui/EmptyState"
import { List, Clock, CheckCircle2 } from "lucide-react"

export default function TableView({ tasks, refresh }: any) {
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTaskStatus(taskId, status)
    refresh()
  }

  return (
    <>
      <div className="card overflow-hidden">
        {tasks.length === 0 ? (
          <EmptyState icon={<List size={24} />} title="No tasks" description="Create your first task to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Task</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Priority</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Due Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((task: any) => {
                  const done = (task.checklist || []).filter((c: any) => c.isCompleted).length
                  const total = (task.checklist || []).length
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

                  return (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTask(task)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {task.coverColor && (
                            <div className="h-5 w-1 rounded-full shrink-0" style={{ backgroundColor: task.coverColor }} />
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:border-teal-400 focus:outline-none"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>

                      <td className="px-5 py-3.5">
                        {task.priority ? <PriorityBadge priority={task.priority} /> : <span className="text-slate-300">—</span>}
                      </td>

                      <td className="px-5 py-3.5">
                        {task.dueDate ? (
                          <span className={["flex items-center gap-1.5 text-xs", isOverdue ? "text-red-600 font-medium" : "text-slate-500"].join(" ")}>
                            <Clock size={11} />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-500"
                                style={{ width: `${Math.round((done / total) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500">{done}/{total}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskDetailModal
        task={selectedTask || {}}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        refresh={() => { refresh(); setSelectedTask(null) }}
      />
    </>
  )
}

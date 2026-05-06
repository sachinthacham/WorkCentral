"use client"

import { useEffect, useState, useCallback } from "react"
import TaskDetailModal from "@/components/TaskDetailModal"
import { SkeletonList } from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge"
import {
  getMyAssignedTasks,
  getMyAssignedTaskCounts,
  type MyTaskCounts,
  type MyTasksPageResponse,
} from "@/features/tasks/api"
import { CheckCircle2, CheckSquare, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 10

export default function MyTasksPage() {
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [meta, setMeta] = useState<MyTasksPageResponse["meta"]>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  })
  const [counts, setCounts] = useState<MyTaskCounts>({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all")
  const [page, setPage] = useState(1)

  const loadCounts = useCallback(async () => {
    try {
      const c = await getMyAssignedTaskCounts()
      setCounts(c)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const status = filter === "all" ? undefined : filter
      const { data, meta: m } = await getMyAssignedTasks(page, PAGE_SIZE, status)
      setMyTasks(data)
      setMeta(m)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const refreshAll = () => {
    loadCounts()
    loadTasks()
  }

  const tabCount = (s: typeof filter) => {
    if (s === "all") return counts.total
    return counts[s]
  }

  const projectName = (task: any) => {
    const p = task.projectId
    if (p && typeof p === "object" && "name" in p) return String(p.name)
    return ""
  }

  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)

  if (loading && myTasks.length === 0 && meta.total === 0) {
    return (
      <div className="animate-in space-y-4">
        <PageHeader title="My Tasks" description="Tasks assigned to you across all projects." />
        <SkeletonList rows={6} />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-4">
      <PageHeader
        title="My Tasks"
        description={`${counts.total} task${counts.total !== 1 ? "s" : ""} assigned to you in this workspace`}
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-200/90 bg-white/90 p-1 shadow-sm w-fit">
        {(["all", "todo", "in_progress", "done"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilter(s)
              setPage(1)
              setMyTasks([])
            }}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              filter === s
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s === "todo" ? "To Do" : "Done"}
            <span
              className={[
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                filter === s ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600",
              ].join(" ")}
            >
              {tabCount(s)}
            </span>
          </button>
        ))}
      </div>

      {loading && myTasks.length === 0 ? (
        <SkeletonList rows={5} />
      ) : myTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={28} />}
          title={filter === "all" ? "No tasks assigned to you" : `No ${filter.replace("_", " ")} tasks`}
          description={
            filter === "all" ? "Tasks assigned to you will appear here" : "Try another filter or page"
          }
        />
      ) : (
        <>
          <div className="grid gap-1.5">
            {myTasks.map((task: any) => (
              <button
                key={task._id}
                type="button"
                onClick={() => setSelectedTask(task)}
                className="card card-interactive flex w-full items-center gap-3 py-2.5 pl-3 pr-3 text-left transition-all group sm:gap-4"
              >
                <div
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    task.status === "done"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-zinc-200 bg-white text-zinc-400 group-hover:border-teal-300",
                  ].join(" ")}
                >
                  <CheckCircle2 size={14} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "text-[13px] font-semibold leading-snug sm:text-sm",
                      task.status === "done" ? "text-zinc-400 line-through" : "text-zinc-900",
                    ].join(" ")}
                  >
                    {task.title}
                  </p>
                  {projectName(task) && (
                    <p className="mt-0.5 text-[11px] font-medium text-teal-700/90">{projectName(task)}</p>
                  )}
                  {task.description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-600 sm:text-xs">
                      {task.description}
                    </p>
                  )}
                  {task.labels?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {task.labels.slice(0, 4).map((l: string) => (
                        <span
                          key={l}
                          className="rounded-md bg-zinc-100 px-1.5 py-0 text-[10px] font-medium text-zinc-600"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 sm:text-xs">
                      <Calendar size={11} />
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {meta.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-zinc-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-zinc-600">
                Showing <span className="font-semibold tabular-nums text-zinc-900">{from}</span>
                –
                <span className="font-semibold tabular-nums text-zinc-900">{to}</span> of{" "}
                <span className="font-semibold tabular-nums text-zinc-900">{meta.total}</span>
                {filter !== "all" && (
                  <span className="text-zinc-500"> ({filter.replace("_", " ")})</span>
                )}
              </p>
              {meta.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8!"
                    disabled={page <= 1 || loading}
                    icon={<ChevronLeft size={14} />}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-xs font-semibold tabular-nums text-zinc-700">
                    Page {meta.page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8!"
                    disabled={page >= meta.totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={14} className="inline" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <TaskDetailModal
        task={selectedTask || {}}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        refresh={refreshAll}
      />
    </div>
  )
}

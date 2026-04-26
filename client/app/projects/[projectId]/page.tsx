"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getTasks } from "@/features/tasks/api"
import { socket } from "@/services/socket"
import KanbanBoard from "@/components/KanbanBoard"
import CalendarView from "@/components/CalendarView"
import TableView from "@/components/TableView"
import CreateTask from "@/components/CreateTask"
import ProjectMembers from "@/components/ProjectMembers"
import Button from "@/components/ui/Button"
import { Task } from "@/types/tasks"
import {
  Search, LayoutGrid, CalendarDays, List, Plus,
  GitBranch, Zap, Users,
} from "lucide-react"
import Link from "next/link"

type ViewType = "board" | "calendar" | "table"
type PageTab = "tasks" | "members"

export default function ProjectPage() {
  const { projectId } = useParams()
  const id = projectId as string
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([])
  const [viewType, setViewType] = useState<ViewType>("board")
  const [pageTab, setPageTab] = useState<PageTab>("tasks")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [showCreateTask, setShowCreateTask] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const loadTasks = async () => {
    if (!id) return
    const data = await getTasks(id, { search: debouncedSearch })
    setTasks(Array.isArray(data) ? data : [])
  }

  useEffect(() => { if (id) loadTasks() }, [id, debouncedSearch])

  useEffect(() => {
    socket.on("taskUpdated", (updated: any) => {
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    })
    return () => { socket.off("taskUpdated") }
  }, [])

  const views: { id: ViewType; label: string; icon: any }[] = [
    { id: "board",    label: "Board",    icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "table",    label: "Table",    icon: List },
  ]

  return (
    <div className="animate-in space-y-5">
      {/* Page tabs: Tasks | Members */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 rounded-lg border border-slate-300 bg-white p-1 shadow-sm">
          <button
            onClick={() => setPageTab("tasks")}
            className={[
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-all",
              pageTab === "tasks" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            <Zap size={14} /> Tasks
            <span className={["ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold", pageTab === "tasks" ? "bg-white/20" : "bg-slate-200 text-slate-600"].join(" ")}>
              {tasks.length}
            </span>
          </button>
          <button
            onClick={() => setPageTab("members")}
            className={[
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-all",
              pageTab === "members" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            <Users size={14} /> Members
          </button>
        </div>

        {/* Task toolbar — only when on tasks tab */}
        {pageTab === "tasks" && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-60 rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            {/* View switcher */}
            <div className="flex rounded-lg border border-slate-300 bg-white p-1 shadow-sm">
              {views.map(({ id: vid, label, icon: Icon }) => (
                <button
                  key={vid}
                  onClick={() => setViewType(vid)}
                  className={[
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                    viewType === vid ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            <Link href={`/projects/${id}/sprints`}>
              <Button variant="outline" size="sm" icon={<GitBranch size={13} />}>
                Sprints
              </Button>
            </Link>
            <Button size="sm" icon={<Plus size={13} />} onClick={() => setShowCreateTask(!showCreateTask)}>
              Add Task
            </Button>
          </div>
        )}
      </div>

      {/* Tasks tab content */}
      {pageTab === "tasks" && (
        <>
          {/* Task count */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap size={12} className="text-teal-400" />
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </div>

          {showCreateTask && (
            <div className="card p-5">
              <CreateTask projectId={id} refresh={() => { loadTasks(); setShowCreateTask(false) }} />
            </div>
          )}

          {viewType === "board"    && <KanbanBoard tasks={tasks} setTasks={setTasks} refresh={loadTasks} />}
          {viewType === "calendar" && <CalendarView tasks={tasks} refresh={loadTasks} />}
          {viewType === "table"    && <TableView tasks={tasks} refresh={loadTasks} />}
        </>
      )}

      {/* Members tab content */}
      {pageTab === "members" && (
        <div className="card p-6">
          <ProjectMembers projectId={id} />
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getWorkspaces } from "@/features/workspace/api"
import { getProjects } from "@/features/projects/api"
import { getDashboardAnalytics } from "@/features/dashboard/api"
import { getTasks } from "@/features/tasks/api"
import Button from "@/components/ui/Button"
import Avatar from "@/components/ui/Avatar"
import { SkeletonPage } from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import InviteUser from "@/components/InviteUser"
import {
  Plus, FolderOpen, CheckSquare,
  TrendingUp, ArrowRight, Users, ChevronRight,
  CalendarClock, ListTodo, Target,
} from "lucide-react"
import { StatusBadge } from "@/components/ui/Badge"

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [perProjectCounts, setPerProjectCounts] = useState<{ id: string; name: string; count: number }[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      try {
        const ws = await getWorkspaces()
        if (!ws || ws.length === 0) { router.push("/workspace/create"); return }

        setWorkspaces(ws)
        const storedWsId = localStorage.getItem("workspaceId")
        const validWs = ws.find((w: any) => String(w.workspaceId) === storedWsId)
        if (!storedWsId || !validWs) {
          // Stale or missing workspaceId — replace with first available workspace
          localStorage.setItem("workspaceId", ws[0].workspaceId)
          localStorage.setItem("role", ws[0].role)
        }

        const [proj, analytics] = await Promise.all([
          getProjects(),
          getDashboardAnalytics().catch(() => null),
        ])

        const list = proj || []
        setProjects(list)

        const taskArrays = await Promise.all(list.map((p: any) => getTasks(p._id)))
        setPerProjectCounts(
          list.map((p: any, i: number) => ({
            id: p._id,
            name: p.name,
            count: (taskArrays[i] || []).length,
          })),
        )
        const flat = taskArrays.flatMap((tasks, i) =>
          (tasks || []).map((t: any) => ({ ...t, _projectName: list[i]?.name })),
        )
        const upcoming = flat
          .filter((t) => t.dueDate && t.status !== "done")
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 12)
        setUpcomingTasks(upcoming)

        setAnalytics(analytics)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null
  const canInvite = role === "OWNER" || role === "ADMIN" || role === "admin"
  const currentWs = workspaces.find(
    (w) => w.workspaceId === (typeof window !== "undefined" ? localStorage.getItem("workspaceId") : null)
  ) ?? workspaces[0]

  if (loading) return <SkeletonPage />

  const stats = [
    {
      label: "Total Projects",
      value: analytics?.totalProjects ?? projects.length,
      icon: FolderOpen,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-700",
      valueCls: "text-teal-800",
    },
    {
      label: "Total Tasks",
      value: analytics?.totalTasks ?? "—",
      icon: CheckSquare,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-700",
      valueCls: "text-slate-900",
    },
    {
      label: "In Progress",
      value: analytics?.tasksByStatus?.in_progress ?? "—",
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      valueCls: "text-amber-700",
    },
    {
      label: "Completed",
      value: analytics?.tasksByStatus?.done ?? "—",
      icon: CheckSquare,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      valueCls: "text-emerald-700",
    },
  ]

  return (
    <div className="animate-in space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
            style={{
              background: "linear-gradient(145deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)",
              boxShadow: "0 10px 28px rgba(13,148,136,0.35)",
            }}
          >
            {currentWs?.name?.[0]?.toUpperCase() ?? "W"}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700/90">Overview</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-900">
              {currentWs?.name ?? "My Workspace"}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-600 capitalize">
              {role?.toLowerCase() ?? "member"} · {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canInvite && (
            <Button variant="outline" size="sm" icon={<Users size={14} />} onClick={() => setShowInvite(!showInvite)}>
              Invite
            </Button>
          )}
          <Button size="sm" icon={<Plus size={14} />} onClick={() => router.push("/workspace/create")}>
            New Workspace
          </Button>
        </div>
      </div>

      {showInvite && <InviteUser />}

      {/* Stats + snapshot */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="card card-interactive p-3.5 transition-all sm:p-4">
                <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBg}`}>
                  <Icon size={18} className={s.iconColor} />
                </div>
                <div className={`font-display text-2xl font-semibold tabular-nums sm:text-[1.65rem] ${s.valueCls}`}>
                  {s.value}
                </div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</div>
              </div>
            )
          })}
        </div>

        <div className="card flex flex-col justify-between p-3.5 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-zinc-800">
            <Target size={16} className="text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Workspace snapshot</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-600">
            <li className="flex justify-between gap-2 border-b border-zinc-100 pb-1.5">
              <span>Active projects</span>
              <span className="font-semibold tabular-nums text-zinc-900">{projects.length}</span>
            </li>
            <li className="flex justify-between gap-2 border-b border-zinc-100 pb-1.5">
              <span>Open tasks (incomplete)</span>
              <span className="font-semibold tabular-nums text-zinc-900">
                {analytics?.totalTasks != null
                  ? analytics.totalTasks - (analytics?.tasksByStatus?.done ?? 0)
                  : "—"}
              </span>
            </li>
            <li className="flex justify-between gap-2 border-b border-zinc-100 pb-1.5">
              <span>Completion rate</span>
              <span className="font-semibold tabular-nums text-zinc-900">
                {analytics?.totalTasks
                  ? `${Math.round(((analytics.tasksByStatus?.done ?? 0) / analytics.totalTasks) * 100)}%`
                  : "—"}
              </span>
            </li>
            <li className="flex justify-between gap-2 pt-0.5">
              <span>Upcoming deadlines (tracked)</span>
              <span className="font-semibold tabular-nums text-teal-700">{upcomingTasks.length}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dense two-column: projects table + upcoming */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-3 py-2">
            <div className="flex items-center gap-2">
              <ListTodo size={15} className="text-teal-600" />
              <h2 className="font-display text-sm font-semibold text-zinc-900">Projects &amp; task load</h2>
            </div>
            <Button variant="ghost" size="sm" className="!h-7 !px-2 !text-xs" onClick={() => router.push("/projects")}>
              All <ArrowRight size={12} />
            </Button>
          </div>
          {projects.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<FolderOpen size={24} />}
                title="No projects yet"
                description="Create a project to populate this table"
                action={{ label: "Projects", onClick: () => router.push("/projects") }}
              />
            </div>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-2">Project</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Description</th>
                  <th className="px-3 py-2 text-right">Tasks</th>
                  <th className="w-8 px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {projects.map((p: any) => {
                  const row = perProjectCounts.find((x) => x.id === p._id)
                  return (
                    <tr
                      key={p._id}
                      className="cursor-pointer hover:bg-teal-50/40"
                      onClick={() => router.push(`/projects/${p._id}`)}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-100 text-[11px] font-bold text-teal-800">
                            {p.name?.[0]?.toUpperCase()}
                          </span>
                          <span className="font-semibold text-zinc-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="hidden max-w-[220px] truncate px-3 py-2 text-zinc-600 sm:table-cell">
                        {p.description || "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-zinc-800">
                        {row?.count ?? "—"}
                      </td>
                      <td className="px-2 py-2 text-zinc-300">
                        <ChevronRight size={14} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-200/80 bg-zinc-50/80 px-3 py-2">
            <CalendarClock size={15} className="text-amber-600" />
            <h2 className="font-display text-sm font-semibold text-zinc-900">Next deadlines</h2>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="p-4 text-xs text-zinc-500">No upcoming due dates on open tasks.</p>
          ) : (
            <ul className="max-h-[320px] divide-y divide-zinc-100 overflow-y-auto">
              {upcomingTasks.map((t) => (
                <li
                  key={t._id}
                  className="flex cursor-pointer items-start gap-2 px-3 py-2 hover:bg-amber-50/50"
                  onClick={() => router.push(`/projects/${t.projectId}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-900">{t.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{t._projectName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={t.status} />
                    <p className="mt-1 text-[10px] font-semibold text-amber-800">
                      {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Project cards — compact */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-zinc-900">Quick open</h2>
          <Button variant="ghost" size="sm" className="!h-7 !text-xs" onClick={() => router.push("/projects")}>
            Directory <ArrowRight size={12} />
          </Button>
        </div>

        {projects.length === 0 ? null : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p: any) => (
              <button
                key={p._id}
                onClick={() => router.push(`/projects/${p._id}`)}
                className="card card-interactive px-3 py-2.5 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white shadow-sm">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-zinc-900 group-hover:text-teal-800">
                      {p.name}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-zinc-500">{p.description || "Open board"}</p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-zinc-300 group-hover:text-teal-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workspaces */}
      <div>
        <h2 className="font-display mb-2 text-sm font-semibold text-zinc-900">Switch workspace</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w: any) => (
            <button
              key={w.workspaceId}
              onClick={() => {
                localStorage.setItem("workspaceId", w.workspaceId)
                localStorage.setItem("role", w.role)
                window.location.reload()
              }}
              className="card card-interactive px-3 py-2.5 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={w.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-800">{w.name}</p>
                  <p className="text-[11px] text-zinc-500 capitalize">{w.role?.toLowerCase()}</p>
                </div>
                {w.workspaceId === localStorage.getItem("workspaceId") && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.8)]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

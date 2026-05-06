"use client"

import { useEffect, useState } from "react"
import { getProjects } from "@/features/projects/api"
import { getTasks } from "@/features/tasks/api"
import { getDashboardAnalytics } from "@/features/dashboard/api"
import { SkeletonPage } from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import { CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react"

const STATUS_COLORS  = { todo: "#94a3b8", in_progress: "#14b8a6", done: "#10b981" }
const PRIORITY_COLORS = ["#ef4444", "#f59e0b", "#10b981"]

export default function AnalyticsDashboard() {
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [byProject, setByProject] = useState<{ name: string; total: number; done: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, analytics] = await Promise.all([
          getProjects(),
          getDashboardAnalytics().catch(() => null),
        ])
        const list = projects || []
        const arrays = await Promise.all(list.map((p: any) => getTasks(p._id)))
        const flat = arrays.flat()
        setAllTasks(flat)
        setByProject(
          list.map((p: any, i: number) => {
            const ts = arrays[i] || []
            return {
              name: p.name,
              total: ts.length,
              done: ts.filter((t: any) => t.status === "done").length,
            }
          }),
        )
        setAnalytics(analytics)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <SkeletonPage />

  const statusCounts = { todo: 0, in_progress: 0, done: 0 }
  const priorityCounts: Record<string, number> = { high: 0, medium: 0, low: 0 }
  allTasks.forEach((t) => {
    if (t.status in statusCounts) statusCounts[t.status as keyof typeof statusCounts]++
    if (t.priority in priorityCounts) priorityCounts[t.priority]++
  })

  const total = allTasks.length
  const completionRate = total ? Math.round((statusCounts.done / total) * 100) : 0

  const barData = [
    { name: "To Do",       value: statusCounts.todo,        fill: STATUS_COLORS.todo },
    { name: "In Progress", value: statusCounts.in_progress, fill: STATUS_COLORS.in_progress },
    { name: "Done",        value: statusCounts.done,        fill: STATUS_COLORS.done },
  ]

  const pieData = [
    { name: "High",   value: priorityCounts.high },
    { name: "Medium", value: priorityCounts.medium },
    { name: "Low",    value: priorityCounts.low },
  ]

  const statCards = [
    { label: "Total Tasks",     value: total,                    icon: CheckSquare, iconBg: "bg-teal-100", iconColor: "text-teal-700", valueCls: "text-slate-900" },
    { label: "In Progress",     value: statusCounts.in_progress, icon: Clock,       iconBg: "bg-amber-100",  iconColor: "text-amber-700",  valueCls: "text-amber-700" },
    { label: "Completion Rate", value: `${completionRate}%`,     icon: TrendingUp,  iconBg: "bg-emerald-100",iconColor: "text-emerald-700",valueCls: "text-emerald-700" },
    { label: "High Priority",   value: priorityCounts.high,      icon: AlertCircle, iconBg: "bg-red-100",    iconColor: "text-red-700",    valueCls: "text-red-700" },
  ]

  return (
    <div className="animate-in space-y-4">
      <PageHeader
        title="Analytics"
        description="Status mix, priorities, and throughput across every project in this workspace."
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
      {statCards.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="card p-3.5 sm:p-4">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBg}`}>
              <Icon size={18} className={s.iconColor} />
            </div>
            <div className={`font-display text-2xl font-semibold tabular-nums sm:text-[1.65rem] ${s.valueCls}`}>{s.value}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</div>
          </div>
        )
      })}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<TrendingUp size={28} />}
          title="No data yet"
          description="Create some tasks across your projects to see analytics"
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="card p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Tasks by status</h2>
            <p className="mb-3 text-[11px] text-zinc-500">All projects combined</p>
            <div className="h-[220px] sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority pie */}
          <div className="card p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Priority mix</h2>
            <p className="mb-3 text-[11px] text-zinc-500">High / medium / low</p>
            <div className="h-[220px] sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0" }} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion rate bar */}
          <div className="card p-4 lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Completion</h2>
            <p className="mb-3 text-[11px] text-zinc-500">{statusCounts.done} of {total} tasks done</p>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> To Do: {statusCounts.todo}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500" /> In Progress: {statusCounts.in_progress}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Done: {statusCounts.done}
              </span>
            </div>
          </div>

          <div className="card overflow-hidden lg:col-span-2">
            <div className="border-b border-zinc-200/80 bg-zinc-50/80 px-3 py-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Per-project throughput</h2>
              <p className="text-[11px] text-zinc-500">Task volume and done count by project</p>
            </div>
            <div className="max-h-[280px] overflow-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-white text-[10px] font-bold uppercase tracking-wider text-zinc-500 shadow-sm">
                  <tr>
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2 text-right">Tasks</th>
                    <th className="px-3 py-2 text-right">Done</th>
                    <th className="px-3 py-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {byProject.map((row) => {
                    const pct = row.total ? Math.round((row.done / row.total) * 100) : 0
                    return (
                      <tr key={row.name} className="hover:bg-teal-50/30">
                        <td className="px-3 py-2 font-medium text-zinc-900">{row.name}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs">{row.total}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-emerald-700">{row.done}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-zinc-600">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

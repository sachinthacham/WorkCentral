"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { searchWorkspace, SearchResults } from "@/features/search/api"
import {
  Search, X, FolderOpen, CheckSquare, MessageSquare, Users, Loader2,
} from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
}

const TABS = [
  { id: undefined,    label: "All" },
  { id: "tasks",      label: "Tasks",    icon: CheckSquare },
  { id: "projects",   label: "Projects", icon: FolderOpen },
  { id: "comments",   label: "Comments", icon: MessageSquare },
  { id: "members",    label: "Members",  icon: Users },
] as const

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<typeof TABS[number]["id"]>(undefined)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when opened
  useEffect(() => {
    if (open) { setQuery(""); setResults(null); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults(null); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchWorkspace(query.trim(), tab as any, 8)
        setResults(data)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query, tab])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  const tasks    = results?.tasks    ?? []
  const projects = results?.projects ?? []
  const comments = results?.comments ?? []
  const members  = results?.members  ?? []
  const hasAny   = tasks.length + projects.length + comments.length + members.length > 0

  const navigateTo = (path: string) => { router.push(path); onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in"
           style={{ boxShadow: "var(--shadow-xl)" }}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          {loading
            ? <Loader2 size={18} className="text-slate-400 animate-spin shrink-0" />
            : <Search size={18} className="text-slate-400 shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, members…"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-slate-100 px-3 pt-2">
          {TABS.map((t) => (
            <button
              key={String(t.id)}
              onClick={() => setTab(t.id)}
              className={[
                "rounded-t-md px-3 py-2 text-xs font-semibold transition-colors border-b-2",
                tab === t.id
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Start typing to search your workspace…
            </p>
          )}

          {query && !loading && !hasAny && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              No results for "<span className="font-medium text-slate-600">{query}</span>"
            </p>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <Section label="Tasks">
              {tasks.map((t: any) => (
                <ResultRow
                  key={t._id}
                  icon={<CheckSquare size={14} className="text-teal-500" />}
                  primary={t.title}
                  secondary={t.status?.replace("_", " ")}
                  onClick={() => navigateTo(`/projects/${t.projectId}`)}
                />
              ))}
            </Section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Section label="Projects">
              {projects.map((p: any) => (
                <ResultRow
                  key={p._id}
                  icon={<FolderOpen size={14} className="text-violet-500" />}
                  primary={p.name}
                  secondary={p.description}
                  onClick={() => navigateTo(`/projects/${p._id}`)}
                />
              ))}
            </Section>
          )}

          {/* Comments */}
          {comments.length > 0 && (
            <Section label="Comments">
              {comments.map((c: any) => (
                <ResultRow
                  key={c._id}
                  icon={<MessageSquare size={14} className="text-amber-500" />}
                  primary={c.content}
                  secondary={c.taskId?.title ?? "Task"}
                  onClick={() => navigateTo(`/projects/${c.taskId?.projectId}`)}
                />
              ))}
            </Section>
          )}

          {/* Members */}
          {members.length > 0 && (
            <Section label="Members">
              {members.map((m: any) => (
                <ResultRow
                  key={m.userId}
                  icon={<Users size={14} className="text-emerald-500" />}
                  primary={m.name || m.email}
                  secondary={m.role}
                  onClick={() => navigateTo("/workspace/members")}
                />
              ))}
            </Section>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-4 text-[10px] text-slate-400">
          <span><kbd className="font-medium">↑↓</kbd> navigate</span>
          <span><kbd className="font-medium">↵</kbd> open</span>
          <span><kbd className="font-medium">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {children}
    </div>
  )
}

function ResultRow({ icon, primary, secondary, onClick }: {
  icon: React.ReactNode; primary: string; secondary?: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50 transition-colors"
    >
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{primary}</p>
        {secondary && (
          <p className="text-xs text-slate-500 truncate capitalize">{secondary}</p>
        )}
      </div>
    </button>
  )
}

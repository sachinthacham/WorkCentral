"use client"

import { useEffect, useState } from "react"
import { getProjects } from "@/features/projects/api"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/Skeleton"
import PageHeader from "@/components/ui/PageHeader"
import CreateProject from "@/components/CreateProject"
import { FolderOpen, Plus, ChevronRight, Clock } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()

  const load = async () => {
    try {
      const data = await getProjects()
      setProjects(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="animate-in space-y-4">
      <PageHeader title="Projects" description={`${projects.length} project${projects.length !== 1 ? "s" : ""} in your workspace`}>
        <Button icon={<Plus size={14} />} onClick={() => setShowCreate(!showCreate)}>
          New Project
        </Button>
      </PageHeader>

      {showCreate && (
        <div className="card p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-700">New project</h3>
          <CreateProject refresh={() => { load(); setShowCreate(false) }} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={28} />}
          title="No projects yet"
          description="Create your first project to start organising tasks"
          action={{ label: "Create Project", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p: any) => (
            <button
              key={p._id}
              onClick={() => router.push(`/projects/${p._id}`)}
              className="card card-interactive p-3.5 text-left transition-all group"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white shadow-sm">
                {p.name?.[0]?.toUpperCase()}
              </div>

              <h3 className="mb-0.5 line-clamp-2 text-[13px] font-bold text-zinc-900 group-hover:text-teal-800">
                {p.name}
              </h3>
              <p className="mb-3 line-clamp-3 text-[11px] leading-relaxed text-zinc-600">
                {p.description || "No description"}
              </p>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                </span>
                <span className="flex items-center gap-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ChevronRight size={12} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

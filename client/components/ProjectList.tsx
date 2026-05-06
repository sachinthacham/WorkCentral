"use client";

import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowRight } from "lucide-react";

export default function ProjectList({ projects }: { projects: any[] }) {
  const router = useRouter();

  const openProject = (id: string) => {
    if (id) {
      router.push(`/projects/${id}`);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Calendar size={30} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">No projects yet</h3>
        <p className="mt-2 text-sm text-slate-500">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p: any) => (
        <div
          key={p._id || p.id}
          onClick={() => openProject(p._id || p.id)}
          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-base font-semibold text-white">
              {p.name?.charAt(0).toUpperCase()}
            </div>
            <ArrowRight className="text-slate-300 transition-colors group-hover:text-slate-700" size={18} />
          </div>

          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-slate-700">
            {p.name}
          </h3>

          <p className="min-h-[60px] line-clamp-3 text-sm text-slate-600">
            {p.description || "No description provided"}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>Updated recently</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Building2 } from "lucide-react";

export default function WorkspaceSwitcher({ workspaces }: { workspaces: any[] }) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("workspaceId");
    if (id) setSelected(id);
    else if (workspaces.length > 0) {
      setSelected(workspaces[0].workspaceId);
      localStorage.setItem("workspaceId", workspaces[0].workspaceId);
    }
  }, [workspaces]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    localStorage.setItem("workspaceId", id);
    setSelected(id);
    // Optional: window.location.reload() if you want to refresh data
  };

  const currentWorkspace = workspaces.find((w) => w.workspaceId === selected);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-slate-500">
        <Building2 className="text-slate-400" size={20} />
        
        <select
          value={selected}
          onChange={handleChange}
          className="flex-1 cursor-pointer appearance-none bg-transparent text-base font-medium text-slate-900 focus:outline-none"
        >
          {workspaces.map((w: any) => (
            <option key={w.workspaceId} value={w.workspaceId}>
              {w.name}
            </option>
          ))}
        </select>

        <ChevronDown className="text-slate-400" size={18} />
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { getWorkspaces } from "@/features/workspace/api";
import { useRouter } from "next/navigation";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import InviteUser from "@/components/InviteUser";

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const data = await getWorkspaces();

      if (data.length === 0) {
        router.push("/workspace/create");
        return;
      }

      setWorkspaces(data);

      const currentWorkspace = localStorage.getItem("workspaceId");

      localStorage.setItem("role", data[0].role);

      if (!currentWorkspace) {
        localStorage.setItem("workspaceId", data[0].workspaceId);
      }
    };

    load();
  }, []);

  const role = localStorage.getItem("role");

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your Workspaces</h1>
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded"
        onClick={() => router.push("/workspace/create")}
      >
        Create Workspace
      </button>
      {role === "admin" && <InviteUser />}

      <WorkspaceSwitcher workspaces={workspaces} />
      <div className="flex flex-col gap-4">
        {workspaces.map((w: any) => (
          <div key={w.workspaceId} className="border p-4 rounded">
            {w.name}
          </div>
        ))}
      </div>
    </div>
  );
}

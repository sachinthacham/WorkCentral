import { api } from "@/services/api"

export const getSprints = async (projectId: string) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";
  const res = await api.get(`/sprints/project/${projectId}`, {
    headers: { workspaceid: workspaceId }
  });
  return res.data?.data ?? res.data;
}

export const createSprint = async (data: any) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";
  const res = await api.post("/sprints", data, {
    headers: { workspaceid: workspaceId }
  });
  return res.data;
}

export const updateSprintStatus = async (sprintId: string, status: string) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";
  const res = await api.patch(`/sprints/${sprintId}/status`, { status }, {
    headers: { workspaceid: workspaceId }
  });
  return res.data;
}

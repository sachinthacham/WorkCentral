import { api } from "@/services/api"

export const getProjects = async () => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : ""
  const res = await api.get("/projects", {
    headers: { workspaceid: workspaceId }
  })
  return res.data?.data ?? res.data
}

export const createProject = async (data: { name: string; description: string }) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : ""
  const res = await api.post("/projects", data, {
    headers: { workspaceid: workspaceId }
  })
  return res.data
}

// ── Project member management ────────────────────────────────────────────────

export const getProjectMembers = async (projectId: string) => {
  const res = await api.get(`/projects/${projectId}/members`)
  return res.data?.data ?? res.data
}

export const addProjectMember = async (projectId: string, data: { userId: string; role: string }) => {
  const res = await api.post(`/projects/${projectId}/members`, data)
  return res.data
}

export const updateProjectMemberRole = async (projectId: string, userId: string, role: string) => {
  const res = await api.patch(`/projects/${projectId}/members/${userId}/role`, { role })
  return res.data
}

export const removeProjectMember = async (projectId: string, userId: string) => {
  const res = await api.delete(`/projects/${projectId}/members/${userId}`)
  return res.data
}

export const getMyProjectRole = async (projectId: string) => {
  const res = await api.get(`/projects/${projectId}/my-role`)
  return res.data
}

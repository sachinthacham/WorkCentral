import { api } from "@/services/api"

export interface SearchResults {
  tasks:    any[]
  projects: any[]
  comments: any[]
  members:  any[]
}

export const searchWorkspace = async (
  q: string,
  type?: "tasks" | "projects" | "comments" | "members",
  limit = 10
): Promise<SearchResults> => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : ""
  const params = new URLSearchParams({ q, limit: String(limit) })
  if (type) params.append("type", type)

  const res = await api.get(`/search?${params.toString()}`, {
    headers: { workspaceid: workspaceId }
  })
  return res.data
}

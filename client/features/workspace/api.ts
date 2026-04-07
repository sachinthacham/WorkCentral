import { api } from "@/services/api"

export const getWorkspaces = async () => {
  const res = await api.get("/workspace")
  return res.data
}

export const createWorkspace = async (name: string) => {
  const res = await api.post("/workspace", { name })
  return res.data
}

export const inviteUser = async (data: {
  email: string
  role: string
}) => {

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.post(
    "/workspace/invite",
    data,
    {
      headers: {
        workspaceid: workspaceId
      }
    }
  )

  return res.data
}
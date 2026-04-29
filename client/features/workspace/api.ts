import { api } from "@/services/api"

// get user workspaces
export const getWorkspaces = async () => {
  const res = await api.get("/workspace")
  return res.data?.data ?? res.data
}

// create workspace
export const createWorkspace = async (name: string) => {
  const res = await api.post("/workspace", { name })
  return res.data
}

// invite user
export const inviteUser = async (data: {
  email: string
  role: string
}) => {

  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";

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

// get workspace members
export const getWorkspaceMembers = async () => {

  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";

  const res = await api.get(
    "/workspace/members",
    {
      headers:{
        workspaceid: workspaceId
      }
    }
  )

  return res.data?.data ?? res.data
}

// update workspace settings
export const updateWorkspaceSettings = async (settings: any) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";;

  const res = await api.patch(
    "/workspace/settings",
    settings,
    {
      headers: {
        workspaceid: workspaceId
      }
    }
  );

  return res.data;
}
import { api } from "@/services/api"

export const getProjects = async () => {

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.get("/projects", {
    headers: {
      workspaceid: workspaceId
    }
  })

  return res.data
}

export const createProject = async (data:{
  name:string
  description:string
}) => {

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.post(
    "/projects",
    data,
    {
      headers:{
        workspaceid: workspaceId
      }
    }
  )

  return res.data
}
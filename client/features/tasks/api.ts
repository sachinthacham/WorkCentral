import { api } from "@/services/api"

export const getTasks = async (projectId:string)=>{

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.get(
    `/tasks/${projectId}`,
    {
      headers:{
        workspaceid: workspaceId
      }
    }
  )
   
  return res.data
}

export const createTask = async (data:any)=>{

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.post(
    "/tasks",
    data,
    {
      headers:{
        workspaceid: workspaceId
      }
    }
  )

  return res.data
}

export const updateTaskStatus = async(taskId:string,status:string)=>{

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.patch(
    `/tasks/${taskId}/status`,
    {status},
    {
      headers:{
        workspaceid: workspaceId
      }
    }
  )

  return res.data
}
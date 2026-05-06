import { api } from "@/services/api"

export const getDashboardAnalytics = async () => {

  const workspaceId = localStorage.getItem("workspaceId")

  const res = await api.get(
    "/dashboard/analytics",
    {
      headers:{
        workspaceid: workspaceId
      }
    }
  )

  return res.data
}
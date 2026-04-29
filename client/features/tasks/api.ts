import { api } from "@/services/api"

// get tasks
export const getTasks = async (projectId: string, filters: any = {}) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";

  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.dueDateStart) queryParams.append("dueDateStart", filters.dueDateStart);
  if (filters.dueDateEnd) queryParams.append("dueDateEnd", filters.dueDateEnd);

  const res = await api.get(
    `/tasks/${projectId}?${queryParams.toString()}`,
    {
      headers: {
        workspaceid: workspaceId
      }
    }
  );
  // Backend returns paginated { data, meta } — extract the array
  return res.data?.data ?? res.data;
}

export interface MyTasksPageResponse {
  data: any[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const getMyAssignedTasks = async (
  page = 1,
  limit = 10,
  status?: string,
): Promise<MyTasksPageResponse> => {
  const workspaceId = typeof window !== "undefined" ? localStorage.getItem("workspaceId") : ""
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (status) params.set("status", status)
  const res = await api.get(`/tasks/me?${params}`, {
    headers: { workspaceid: workspaceId || "" },
  })
  const body = res.data
  return {
    data: body?.data ?? [],
    meta: body?.meta ?? { total: 0, page: 1, limit, totalPages: 0 },
  }
}

export interface MyTaskCounts {
  total: number
  todo: number
  in_progress: number
  done: number
}

export const getMyAssignedTaskCounts = async (): Promise<MyTaskCounts> => {
  const workspaceId = typeof window !== "undefined" ? localStorage.getItem("workspaceId") : ""
  const res = await api.get("/tasks/me/counts", {
    headers: { workspaceid: workspaceId || "" },
  })
  return res.data ?? { total: 0, todo: 0, in_progress: 0, done: 0 }
}

// create task
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

// update task status
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

// assign task
export const assignTask = async (
  taskId: string,
  userId: string
) => {

  const workspaceId =
    localStorage.getItem("workspaceId")

  const res = await api.patch(
    `/tasks/${taskId}/assign`,
    { userId },
    {
      headers: {
        workspaceid: workspaceId
      }
    }
  )

  return res.data
}

// get comments
export const getComments = async (taskId:string) => {

  const res = await api.get(`/tasks/${taskId}/comments`)

  return res.data?.data ?? res.data

}

// create comment
export const createComment = async (
  taskId:string,
  content:string
) => {

  const res = await api.post(
    `/tasks/${taskId}/comments`,
    { content }
  )

  return res.data

}

// get task activity
export const getTaskActivity = async (taskId:string)=>{

  const res = await api.get(
    `/tasks/${taskId}/activity`
  )

  return res.data?.data ?? res.data
}

// update bulk task details (coverColor, dueDate, checklist, order, description, title)
export const updateTask = async (taskId: string, payload: any) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";

  const res = await api.patch(
    `/tasks/${taskId}`,
    payload,
    {
      headers: {
        workspaceid: workspaceId
      }
    }
  );

  return res.data;
}

// delete task
export const deleteTask = async (taskId: string) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : ""
  const res = await api.delete(`/tasks/${taskId}`, {
    headers: { workspaceid: workspaceId }
  })
  return res.data
}

// create subtask
export const createSubtask = async (parentTaskId: string, data: any) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : ""
  const res = await api.post(`/tasks/${parentTaskId}/subtasks`, data, {
    headers: { workspaceid: workspaceId }
  })
  return res.data
}

// get subtasks
export const getSubtasks = async (parentTaskId: string) => {
  const res = await api.get(`/tasks/${parentTaskId}/subtasks`)
  return res.data?.data ?? res.data
}

// add dependency
export const addDependency = async (taskId: string, blockingTaskId: string) => {
  const res = await api.post(`/tasks/${taskId}/dependencies`, { blockingTaskId })
  return res.data
}

// remove dependency
export const removeDependency = async (taskId: string, blockingTaskId: string) => {
  const res = await api.delete(`/tasks/${taskId}/dependencies/${blockingTaskId}`)
  return res.data
}

// get dependencies
export const getDependencies = async (taskId: string) => {
  const res = await api.get(`/tasks/${taskId}/dependencies`)
  return res.data
}

// upload task attachment
export const uploadAttachment = async (taskId: string, file: File) => {
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem("workspaceId") : "";
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/tasks/${taskId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        workspaceid: workspaceId
      }
    }
  );

  return res.data;
}
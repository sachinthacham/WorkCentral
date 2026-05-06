export type Task = {
  _id: string
  title: string
  description: string
  status: "todo" | "in_progress" | "done"
  assignee?: string
  priority?: string
  labels?: string[]
  projectId?: string
  comments?: Comment[]
  createdAt?: string
  updatedAt?: string

}

export type Comment = {
  _id: string
  content: string
  taskId: string
  userId: string
  createdAt: string
  updatedAt: string
}
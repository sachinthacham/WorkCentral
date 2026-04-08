"use client"

import { useParams } from "next/navigation"
import { useEffect,useState } from "react"
import { getTasks } from "@/features/tasks/api"

import KanbanBoard from "@/components/KanbanBoard"
import CreateTask from "@/components/CreateTask"


export default function ProjectPage(){

  const {projectId} = useParams()

  const [tasks,setTasks] = useState([])

  const loadTasks = async () => {
    if (!projectId) return

    const data = await getTasks(projectId as string)

    setTasks(data)
  }

  useEffect(() => {
    if (projectId) {
      loadTasks()
    }

  console.log("Tasks:", tasks)   
  }, [projectId])

  return(

    <div className="max-w-6xl mx-auto mt-10">

      <CreateTask
        projectId={projectId}
        refresh={loadTasks}
      />

      <KanbanBoard
  tasks={tasks}
  setTasks={setTasks}
  refresh={loadTasks}
/>

    </div>

  )
}
"use client"

import {
  DndContext,
  closestCorners,
  DragEndEvent,
  useDroppable
} from "@dnd-kit/core"

import { updateTaskStatus } from "@/features/tasks/api"
import TaskCard from "./TaskCard"

export default function KanbanBoard({ tasks, setTasks, refresh }: any){

  const columns = {
    todo: tasks.filter((t:any)=>t.status==="todo"),
    in_progress: tasks.filter((t:any)=>t.status==="in_progress"),
    done: tasks.filter((t:any)=>t.status==="done")
  }

  const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event

  if (!over) return

  const taskId = active.id
  const newStatus = over.id

  // update UI instantly
  setTasks((prev: any[]) =>
    prev.map((task) =>
      task._id === taskId
        ? { ...task, status: newStatus }
        : task
    )
  )

  // update backend
  await updateTaskStatus(taskId as string, newStatus as string)
}

  return(

    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >

      <div className="grid grid-cols-3 gap-4">

        <Column id="todo" title="Todo" tasks={columns.todo}/>

        <Column
          id="in_progress"
          title="In Progress"
          tasks={columns.in_progress}
        />

        <Column id="done" title="Done" tasks={columns.done}/>

      </div>

    </DndContext>

  )
}

function Column({ id, title, tasks }: any) {

  const { setNodeRef } = useDroppable({
    id
  })

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-4 rounded min-h-[300px]"
    >
      <h2 className="font-bold mb-3">{title}</h2>

      {tasks.map((task: any) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  )
}
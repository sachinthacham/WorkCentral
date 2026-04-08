"use client"

import { useDraggable } from "@dnd-kit/core"

export default function TaskCard({task}:any){

  const {attributes,listeners,setNodeRef,transform} =
    useDraggable({
      id: task._id
    })

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`
      }
    : undefined

  return(

    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white shadow p-3 rounded mb-2 cursor-grab"
    >

      <h3 className="font-bold">
        {task.title}
      </h3>

      <p className="text-sm text-gray-500">
        {task.description}
      </p>

    </div>

  )
}
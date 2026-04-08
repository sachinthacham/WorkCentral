"use client"

import { useState } from "react"
import { createTask } from "@/features/tasks/api"

export default function CreateTask({projectId,refresh}:any){

  const [title,setTitle] = useState("")
  const [description,setDescription] = useState("")

  const handleCreate = async ()=>{

    await createTask({
      title,
      description,
      projectId
    })

    setTitle("")
    setDescription("")

    refresh()
  }

  return(

    <div className="border p-4 rounded mb-6">

      <h2 className="font-bold mb-2">
        Create Task
      </h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Task title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Description"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2 w-full"
        onClick={handleCreate}
      >
        Add Task
      </button>

    </div>
  )
}
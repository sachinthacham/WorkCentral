"use client"

import { useState } from "react"
import { createProject } from "@/features/projects/api"

export default function CreateProject({refresh}:any){

  const [name,setName] = useState("")
  const [description,setDescription] = useState("")

  const handleCreate = async () => {

    await createProject({
      name,
      description
    })

    setName("")
    setDescription("")

    refresh()
  }

  return(

    <div className="border p-4 rounded mb-6">

      <h2 className="text-xl font-bold mb-4">
        Create Project
      </h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Project name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
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
        Create Project
      </button>

    </div>
  )
}
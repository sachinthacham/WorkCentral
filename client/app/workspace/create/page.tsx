"use client"

import { useState } from "react"
import { createWorkspace } from "@/features/workspace/api"
import { useRouter } from "next/navigation"

export default function CreateWorkspacePage(){

  const [name,setName] = useState("")
  const router = useRouter()

  const handleSubmit = async () => {

    await createWorkspace(name)

    router.push("/dashboard")
  }

  return(

    <div className="max-w-md mx-auto mt-20 flex flex-col gap-4">

      <h1 className="text-2xl font-bold">
        Create Workspace
      </h1>

      <input
        className="border p-2"
        placeholder="Workspace name"
        onChange={(e)=>setName(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2"
        onClick={handleSubmit}
      >
        Create
      </button>

    </div>
  )
}
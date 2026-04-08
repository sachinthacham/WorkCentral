"use client"

import { useRouter } from "next/navigation"

export default function ProjectList({projects}:any){

  const router = useRouter()

  const openProject = (id: any) => {
    if (id) {
      router.push(`/projects/${id.toString()}`)
    }
  }

  return (

    <div className="flex flex-col gap-4">

      {projects.map((p: any) => (

        <div
          key={p._id || p.id}
          className="border p-4 rounded cursor-pointer hover:bg-gray-100"
          onClick={() => openProject(p._id || p.id)}
        >

          <h3 className="font-bold text-lg">
            {p.name}
          </h3>

          <p className="text-gray-500">
            {p.description}
          </p>

        </div>

      ))}

    </div>

  )
}
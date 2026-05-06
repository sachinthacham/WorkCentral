"use client"

import { useEffect,useState } from "react"
import { getDashboardAnalytics }
from "@/features/dashboard/api"

export default function DashboardPage(){

  const [data,setData] = useState<any>(null)

  useEffect(()=>{

    const load = async ()=>{

      const analytics = await getDashboardAnalytics()

      setData(analytics)

    }

    load()

  },[])

  if(!data) return <p>Loading...</p>

  return(

    <div className="max-w-4xl mx-auto mt-10">

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4">

        <div className="border p-4">
          <h2 className="font-bold">Projects</h2>
          {data.totalProjects}
        </div>

        <div className="border p-4">
          <h2 className="font-bold">Tasks</h2>
          {data.totalTasks}
        </div>

      </div>

      <div className="border p-4 mt-6">

        <h2 className="font-bold mb-3">
          Tasks by Status
        </h2>

        <p>Todo: {data.tasksByStatus.todo}</p>
        <p>In Progress: {data.tasksByStatus.in_progress}</p>
        <p>Done: {data.tasksByStatus.done}</p>

      </div>

    </div>

  )
}
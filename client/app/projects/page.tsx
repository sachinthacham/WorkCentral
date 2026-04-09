"use client"

import { useEffect, useState } from "react"
import { getProjects } from "@/features/projects/api"
import CreateProject from "@/components/CreateProject"
import ProjectList from "@/components/ProjectList"

export default function ProjectsPage(){

  const [projects,setProjects] = useState([])

  const loadProjects = async () => {

    const data = await getProjects()

    setProjects(data)
  }

  useEffect(()=>{
    loadProjects()
  },[])

  return(

    <div className="max-w-3xl mx-auto mt-10">

      <h1 className="text-3xl font-bold mb-6">
        Projects
      </h1>

      <CreateProject refresh={loadProjects}/>

      <ProjectList projects={projects}/>

    </div>
  )
}
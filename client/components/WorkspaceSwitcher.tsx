"use client"

import { useState, useEffect } from "react"

export default function WorkspaceSwitcher({workspaces}:any){

  const [selected,setSelected] = useState("")

  useEffect(()=>{

    const id = localStorage.getItem("workspaceId")

    if(id){
      setSelected(id)
    }

  },[])

  const handleChange = (e:any)=>{

    const id = e.target.value

    localStorage.setItem("workspaceId", id)

    setSelected(id)
  }

  return(

    <select
      value={selected}
      onChange={handleChange}
      className="border p-2"
    >

      {workspaces.map((w:any)=>(
        <option
          key={w.workspaceId}
          value={w.workspaceId}
        >
          {w.name}
        </option>
      ))}

    </select>

  )
}
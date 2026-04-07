"use client"

import { useState } from "react"
import { loginUser } from "@/features/auth/api"
import { useRouter } from "next/navigation"

export default function LoginPage(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const router = useRouter()
 

  const handleSubmit = async ()=>{

    const res = await loginUser({
      email,
      password
    })

    localStorage.setItem("accessToken",res.accessToken)

    alert("Login successful")
    router.push("/dashboard")
  }

  return(

    <div className="flex flex-col gap-4 w-80 mx-auto mt-20">

      <input
        placeholder="Email"
        className="border p-2"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        className="bg-green-500 text-white p-2"
        onClick={handleSubmit}
      >
        Login
      </button>

    </div>
  )
}
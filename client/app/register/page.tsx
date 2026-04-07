"use client"

import { useState } from "react"
import { registerUser } from "@/features/auth/api"

export default function RegisterPage() {

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleSubmit = async () => {

    const res = await registerUser({
      name,
      email,
      password
    })

    localStorage.setItem("accessToken", res.accessToken)

    alert("Registered successfully")
  }

  return (

    <div className="flex flex-col gap-4 w-80 mx-auto mt-20">

      <input
        placeholder="Name"
        className="border p-2"
        onChange={(e)=>setName(e.target.value)}
      />

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
        className="bg-blue-500 text-white p-2"
        onClick={handleSubmit}
      >
        Register
      </button>

    </div>
  )
}
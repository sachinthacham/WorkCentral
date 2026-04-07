"use client"

import { useState } from "react"
import { inviteUser } from "@/features/workspace/api"

export default function InviteUser(){

  const [email,setEmail] = useState("")
  const [role,setRole] = useState("member")
  const [message,setMessage] = useState("")

  const handleInvite = async () => {

    try {

      await inviteUser({ email, role })

      setMessage("✅ User invited successfully")

    } catch (err:any) {

      if(err.response?.status === 403){
        setMessage("❌ You are not allowed to invite users")
      } else {
        setMessage("❌ Something went wrong")
      }

    }
  }

  return(

    <div className="border p-4 rounded mt-6">

      <h2 className="text-xl font-bold mb-4">
        Invite User
      </h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="User email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-2"
        onChange={(e)=>setRole(e.target.value)}
      >
        <option value="member">Member</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>

      <button
        className="bg-blue-500 text-white p-2 w-full"
        onClick={handleInvite}
      >
        Invite
      </button>

      {message && (
        <p className="mt-3 text-sm">{message}</p>
      )}

    </div>
  )
}
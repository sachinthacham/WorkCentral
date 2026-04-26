"use client"

import { useState } from "react"
import { createProject } from "@/features/projects/api"
import Button from "./ui/Button"
import { Input, Textarea } from "./ui/Input"
import { FolderOpen } from "lucide-react"

export default function CreateProject({ refresh }: { refresh: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await createProject({ name, description })
      setName(""); setDescription("")
      refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Website Redesign"
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of this project…"
        rows={2}
      />

      <Button
        loading={loading}
        disabled={!name.trim()}
        icon={<FolderOpen size={14} />}
        onClick={handleCreate}
      >
        Create Project
      </Button>
    </div>
  )
}

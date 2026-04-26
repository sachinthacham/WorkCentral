"use client"

import { useState } from "react"
import { createTask } from "@/features/tasks/api"
import Button from "./ui/Button"
import { Input, Textarea } from "./ui/Input"
import { Plus } from "lucide-react"

export default function CreateTask({ projectId, refresh }: any) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [labels, setLabels] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      await createTask({
        title,
        description,
        projectId,
        priority,
        labels: labels.split(",").map((l) => l.trim()).filter(Boolean),
      })
      setTitle(""); setDescription(""); setLabels(""); setPriority("medium")
      refresh?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add more context…"
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <Input
          label="Labels"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          placeholder="frontend, bug…"
          hint="Comma separated"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button loading={loading} disabled={!title.trim()} icon={<Plus size={14} />} onClick={handleCreate}>
          Create Task
        </Button>
      </div>
    </div>
  )
}

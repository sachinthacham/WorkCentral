"use client"

import { useEffect, useState } from "react"
import { getTaskActivity } from "@/features/tasks/api"
import Avatar from "./ui/Avatar"

export default function TaskActivity({ taskId }: any) {
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    getTaskActivity(taskId)
      .then((d) => setActivities(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [taskId])

  if (activities.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No activity recorded yet.</p>
  }

  return (
    <div className="space-y-4">
      {activities.map((a: any) => (
        <div key={a._id} className="flex items-start gap-3">
          <Avatar name={a.userId?.email} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700">
              <span className="font-medium">{a.userId?.email || "Someone"}</span>{" "}
              {a.message}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {a.createdAt ? new Date(a.createdAt).toLocaleDateString(undefined, {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              }) : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

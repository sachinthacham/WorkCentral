"use client"

import { useEffect, useState } from "react"
import { getComments, createComment } from "@/features/tasks/api"
import Avatar from "./ui/Avatar"
import { Send } from "lucide-react"

export default function TaskComments({ taskId }: any) {
  const [comments, setComments] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await getComments(taskId)
    setComments(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [taskId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      await createComment(taskId, content)
      setContent(""); load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c: any) => (
            <div key={c._id} className="flex items-start gap-3">
              <Avatar name={c.userId?.email} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
                  <p className="mb-1 text-xs font-medium text-slate-600">{c.userId?.email || "Unknown"}</p>
                  <p className="text-sm text-slate-800">{c.content}</p>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="flex gap-2 pt-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder="Write a comment…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

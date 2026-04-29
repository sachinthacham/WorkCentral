"use client"

import { useEffect, useRef, useState } from "react"
import { Notification } from "@/types/notification"
import { getNotifications, markNotificationRead } from "@/features/notifications/api"
import { Bell, CheckCheck } from "lucide-react"

interface Props {
  compact?: boolean
}

export default function NotificationBell({ compact }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const data = await getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
  }

  const markAll = async () => {
    const unread = notifications.filter((n) => !n.isRead)
    await Promise.all(unread.map((n) => markNotificationRead(n._id)))
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unread = notifications.filter((n) => !n.isRead).length

  if (compact) {
    return (
      <span
        className="text-xs font-semibold text-teal-400"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      >
        {unread > 0 ? unread : null}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-300 bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleRead(n._id)}
                  className={[
                    "cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-slate-50",
                    !n.isRead ? "bg-teal-50/60" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.isRead && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    )}
                    <div className={!n.isRead ? "" : "pl-4"}>
                      <p className={["text-slate-700", !n.isRead ? "font-medium" : ""].join(" ")}>
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./Sidebar"

const NO_SIDEBAR = ["/", "/login", "/register", "/workspace/create", "/forgot-password", "/reset-password"]

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR.includes(pathname)

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="shrink-0">
        <Sidebar />
      </div>

      <main className="app-canvas-bg flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-5 sm:py-6 lg:px-6">{children}</div>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="absolute inset-0 bg-zinc-950/55 backdrop-blur-[3px]" />

      <div
        className={[
          "relative w-full overflow-hidden rounded-2xl bg-white animate-in",
          sizeMap[size],
        ].join(" ")}
        style={{
          boxShadow: "var(--shadow-xl), 0 0 0 1px rgba(24,24,27,0.06) inset",
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{
              borderColor: "var(--border)",
              background: "linear-gradient(180deg, #fafaf9 0%, #f4f4f5 100%)",
            }}
          >
            <h2 className="font-display text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white hover:text-zinc-700 hover:shadow-sm"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {!title && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={17} />
          </button>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

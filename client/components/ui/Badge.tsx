interface BadgeProps {
  variant?: "default" | "todo" | "progress" | "done" | "high" | "medium" | "low"
  children: React.ReactNode
  className?: string
}

const variantClass = {
  default:  "bg-slate-100 text-slate-600 border-slate-200",
  todo:     "badge-todo",
  progress: "badge-progress",
  done:     "badge-done",
  high:     "badge-high",
  medium:   "badge-medium",
  low:      "badge-low",
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={["badge", variantClass[variant], className].join(" ")}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    todo:        { label: "To Do",       variant: "todo" },
    in_progress: { label: "In Progress", variant: "progress" },
    done:        { label: "Done",        variant: "done" },
  }
  const cfg = map[status] ?? { label: status, variant: "default" }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    high:   { label: "High",   variant: "high" },
    medium: { label: "Medium", variant: "medium" },
    low:    { label: "Low",    variant: "low" },
  }
  const cfg = map[priority] ?? { label: priority, variant: "default" }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

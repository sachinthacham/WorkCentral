const colors = [
  "bg-violet-500", "bg-teal-500", "bg-sky-500",
  "bg-emerald-500", "bg-amber-500", "bg-rose-500",
]

function colorFor(str: string) {
  let hash = 0
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

interface AvatarProps {
  name?: string
  email?: string
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
}

export default function Avatar({ name, email, size = "md", className = "" }: AvatarProps) {
  const label = name || email || "?"
  const initials = label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        colorFor(label),
        sizeMap[size],
        className,
      ].join(" ")}
      title={label}
    >
      {initials}
    </span>
  )
}

import { ButtonHTMLAttributes, forwardRef } from "react"
import { Loader2 } from "lucide-react"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    "text-white shadow-md hover:brightness-105 active:brightness-95 " +
    "[background:linear-gradient(145deg,var(--primary)_0%,#0f766e_100%)] " +
    "shadow-[0_4px_14px_rgba(13,148,136,0.35)]",
  secondary:
    "bg-zinc-900 text-white shadow-md hover:bg-zinc-800 active:bg-zinc-950",
  ghost: "bg-transparent hover:bg-zinc-200/80 active:bg-zinc-300/80 text-zinc-800 font-semibold",
  danger: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-md",
  outline:
    "bg-white/90 hover:bg-white border text-zinc-800 font-semibold shadow-sm " +
    "[border-color:var(--border-strong)] hover:[border-color:rgba(13,148,136,0.35)]",
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-6 text-sm gap-2.5 rounded-xl",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center font-semibold transition-all",
          "disabled:opacity-45 disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"
export default Button

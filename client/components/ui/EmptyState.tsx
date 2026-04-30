import Button from "./Button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-in sm:py-20">
      {icon && (
        <div
          className="mb-5 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl text-teal-700 shadow-md"
          style={{
            background: "linear-gradient(145deg, rgba(13,148,136,0.12) 0%, rgba(20,184,166,0.08) 100%)",
            boxShadow: "var(--shadow-sm), 0 0 0 1px rgba(13,148,136,0.15) inset",
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-zinc-600">{description}</p>}
      {action && (
        <div className="mt-6">
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

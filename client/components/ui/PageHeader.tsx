interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[1.65rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 max-w-3xl text-sm leading-snug text-zinc-600">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
    </div>
  )
}

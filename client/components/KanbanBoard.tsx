"use client"

import {
  DndContext, closestCorners, DragEndEvent,
  useDroppable, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { updateTaskStatus, updateTask } from "@/features/tasks/api"
import TaskCard from "./TaskCard"
import EmptyState from "./ui/EmptyState"
import { CheckSquare, Clock, ListTodo } from "lucide-react"

interface Column {
  id: string
  label: string
  icon: any
  color: string
  headerBg: string
  dot: string
}

const COLUMNS: Column[] = [
  { id: "todo",        label: "To Do",       icon: ListTodo,    color: "border-zinc-200",   headerBg: "bg-zinc-50",    dot: "bg-zinc-400" },
  { id: "in_progress", label: "In Progress", icon: Clock,       color: "border-teal-300/80", headerBg: "bg-teal-50",   dot: "bg-teal-500" },
  { id: "done",        label: "Done",        icon: CheckSquare, color: "border-emerald-300", headerBg: "bg-emerald-50", dot: "bg-emerald-500" },
]

export default function KanbanBoard({ tasks, setTasks, refresh }: any) {
  const cols: Record<string, any[]> = {
    todo:        tasks.filter((t: any) => t.status === "todo").sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    in_progress: tasks.filter((t: any) => t.status === "in_progress").sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
    done:        tasks.filter((t: any) => t.status === "done").sort((a: any, b: any) => (a.order || 0) - (b.order || 0)),
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t: any) => t._id === active.id)
    if (!activeTask) return

    const overTask = tasks.find((t: any) => t._id === over.id)
    let newStatus = activeTask.status
    let newOrder  = activeTask.order || 0

    if (overTask) {
      newStatus = overTask.status
      newOrder  = (overTask.order || 0) - 1
    } else if (["todo", "in_progress", "done"].includes(over.id as string)) {
      newStatus = over.id as string
      const col  = tasks.filter((t: any) => t.status === newStatus)
      newOrder   = col.length ? (col[col.length - 1].order || 0) + 1000 : 0
    }

    if (activeTask.status === newStatus && activeTask.order === newOrder) return

    setTasks((prev: any[]) =>
      prev.map((t) => t._id === active.id ? { ...t, status: newStatus, order: newOrder } : t)
    )

    if (activeTask.status !== newStatus) await updateTaskStatus(active.id as string, newStatus)
    await updateTask(active.id as string, { status: newStatus, order: newOrder })
    refresh()
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={col} tasks={cols[col.id]} refresh={refresh} />
        ))}
      </div>
    </DndContext>
  )
}

function KanbanColumn({ column, tasks, refresh }: { column: Column; tasks: any[]; refresh: () => void }) {
  const { setNodeRef } = useDroppable({ id: column.id })
  const Icon = column.icon

  return (
    <div className={`flex flex-col rounded-xl border-2 ${column.color} bg-white overflow-hidden shadow-sm`}>
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${column.color} ${column.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{column.label}</span>
        </div>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-300 shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 p-3 space-y-2.5 min-h-[420px]">
          {tasks.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs font-medium text-slate-400">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task: any) => (
              <TaskCard key={task._id} task={task} refresh={refresh} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

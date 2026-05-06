"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";

export default function CalendarView({ tasks, refresh }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayIndex = getDay(monthStart);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {/* Empty slots for start of month offset */}
        {Array.from({ length: startDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white min-h-[120px] p-2" />
        ))}

        {daysInMonth.map((date) => {
          const dayTasks = tasks.filter((t: any) => t.dueDate && isSameDay(new Date(t.dueDate), date));
          
          return (
            <div key={date.toString()} className="bg-white min-h-[120px] p-2 border-t border-gray-100 relative group transition-colors hover:bg-gray-50 cursor-pointer">
              <span className="text-sm font-medium text-gray-500 mb-2 inline-block">{format(date, "d")}</span>
              <div className="space-y-1">
                {dayTasks.map((task: any) => (
                  <div 
                    key={task._id} 
                    onClick={() => setSelectedTask(task)}
                    className="text-xs px-2 py-1 rounded border overflow-hidden text-ellipsis whitespace-nowrap hover:ring-2 ring-teal-500"
                    style={{ 
                      backgroundColor: task.coverColor ? `${task.coverColor}20` : '#f3f4f6',
                      borderColor: task.coverColor ? task.coverColor : '#e5e7eb',
                      color: task.coverColor || '#374151'
                    }}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailModal 
        task={selectedTask || {}} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        refresh={() => { refresh(); setSelectedTask(null); }} 
      />
    </div>
  );
}

"use client"

import { useState } from "react"
import { updateWorkspaceSettings } from "@/features/workspace/api"
import Button from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import PageHeader from "@/components/ui/PageHeader"
import { Save, Settings2, Bell, Shield } from "lucide-react"

export default function WorkspaceSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    workspaceName: "",
    description: "",
    defaultTaskPriority: "medium",
    allowMemberInvite: false,
    notifications: {
      taskAssigned: true,
      commentAdded: true,
      statusChanged: false,
    },
  })

  const update = (key: string, value: any) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateWorkspaceSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-in space-y-6 max-w-2xl">
      <PageHeader title="Workspace Settings" description="Configure your workspace preferences." />

      {/* General */}
      <section className="card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings2 size={16} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">General</h2>
        </div>

        <Input
          label="Workspace Name"
          value={form.workspaceName}
          onChange={(e) => update("workspaceName", e.target.value)}
          placeholder="My Company Workspace"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What is this workspace for?"
          rows={3}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Default Task Priority</label>
          <select
            value={form.defaultTaskPriority}
            onChange={(e) => update("defaultTaskPriority", e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </section>

      {/* Permissions */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">Permissions</h2>
        </div>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-slate-800">Allow member invitations</p>
            <p className="text-xs text-slate-500">Let members invite others to this workspace</p>
          </div>
          <button
            role="switch"
            aria-checked={form.allowMemberInvite}
            onClick={() => update("allowMemberInvite", !form.allowMemberInvite)}
            className={[
              "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
              form.allowMemberInvite ? "bg-teal-600" : "bg-slate-200",
            ].join(" ")}
          >
            <span className={["inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", form.allowMemberInvite ? "translate-x-4" : "translate-x-0"].join(" ")} />
          </button>
        </label>
      </section>

      {/* Notifications */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">Notifications</h2>
        </div>

        {(Object.entries({
          taskAssigned: "Task assigned to me",
          commentAdded: "Comment added to my task",
          statusChanged: "Task status changed",
        }) as [keyof typeof form.notifications, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
            <p className="text-sm text-slate-700">{label}</p>
            <button
              role="switch"
              aria-checked={form.notifications[key]}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  notifications: { ...f.notifications, [key]: !f.notifications[key] },
                }))
              }
              className={[
                "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                form.notifications[key] ? "bg-teal-600" : "bg-slate-200",
              ].join(" ")}
            >
              <span className={["inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", form.notifications[key] ? "translate-x-4" : "translate-x-0"].join(" ")} />
            </button>
          </label>
        ))}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button loading={saving} icon={<Save size={14} />} onClick={handleSave}>
          Save Settings
        </Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Saved successfully</span>}
      </div>
    </div>
  )
}

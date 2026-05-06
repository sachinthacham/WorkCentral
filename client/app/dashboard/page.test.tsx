import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Dashboard from "./page"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/features/workspace/api", () => ({
  getWorkspaces: vi.fn(),
}))

vi.mock("@/features/projects/api", () => ({
  getProjects: vi.fn(),
}))

vi.mock("@/features/dashboard/api", () => ({
  getDashboardAnalytics: vi.fn(),
}))

vi.mock("@/features/tasks/api", () => ({
  getTasks: vi.fn(),
}))

import { getWorkspaces } from "@/features/workspace/api"
import { getProjects } from "@/features/projects/api"
import { getDashboardAnalytics } from "@/features/dashboard/api"
import { getTasks } from "@/features/tasks/api"

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPush.mockClear()
  })

  it("redirects to workspace create when user has no workspaces", async () => {
    vi.mocked(getWorkspaces).mockResolvedValue([])

    render(<Dashboard />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/workspace/create")
    })
  })

  it("redirects when workspaces response is null", async () => {
    vi.mocked(getWorkspaces).mockResolvedValue(null as any)

    render(<Dashboard />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/workspace/create")
    })
  })

  it("renders workspace overview, stats, and project row after load", async () => {
    localStorage.setItem("workspaceId", "ws-1")
    localStorage.setItem("role", "MEMBER")

    vi.mocked(getWorkspaces).mockResolvedValue([
      { workspaceId: "ws-1", name: "Acme Labs", role: "MEMBER" },
    ])
    vi.mocked(getProjects).mockResolvedValue([
      { _id: "p1", name: "Website", description: "Redesign" },
    ])
    vi.mocked(getDashboardAnalytics).mockResolvedValue({
      totalProjects: 1,
      totalTasks: 4,
      tasksByStatus: { in_progress: 2, done: 1 },
    })
    vi.mocked(getTasks).mockResolvedValue([
      {
        _id: "t1",
        title: "Ship hero",
        status: "todo",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        projectId: "p1",
      },
    ])

    render(<Dashboard />)

    expect(
      await screen.findByRole("heading", { name: "Acme Labs" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getAllByText("Website").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Total Projects")).toBeInTheDocument()
    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("Next deadlines")).toBeInTheDocument()
    expect(screen.getByText("Ship hero")).toBeInTheDocument()
    expect(getProjects).toHaveBeenCalled()
    expect(getDashboardAnalytics).toHaveBeenCalled()
    expect(getTasks).toHaveBeenCalledWith("p1")
  })

  it("shows Invite for OWNER and opens InviteUser panel when clicked", async () => {
    localStorage.setItem("workspaceId", "ws-1")
    localStorage.setItem("role", "OWNER")

    vi.mocked(getWorkspaces).mockResolvedValue([
      { workspaceId: "ws-1", name: "Acme", role: "OWNER" },
    ])
    vi.mocked(getProjects).mockResolvedValue([])
    vi.mocked(getDashboardAnalytics).mockResolvedValue(null)
    vi.mocked(getTasks).mockResolvedValue([])

    const user = userEvent.setup()
    render(<Dashboard />)

    const inviteBtn = await screen.findByRole("button", { name: /invite/i })
    expect(inviteBtn).toBeInTheDocument()

    await user.click(inviteBtn)

    expect(
      screen.getByPlaceholderText(/colleague@company.com/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /send invitation/i }),
    ).toBeInTheDocument()
  })

  it("shows empty projects state when there are no projects", async () => {
    localStorage.setItem("workspaceId", "ws-1")
    localStorage.setItem("role", "MEMBER")

    vi.mocked(getWorkspaces).mockResolvedValue([
      { workspaceId: "ws-1", name: "Solo", role: "MEMBER" },
    ])
    vi.mocked(getProjects).mockResolvedValue([])
    vi.mocked(getDashboardAnalytics).mockResolvedValue(null)
    vi.mocked(getTasks).mockResolvedValue([])

    render(<Dashboard />)

    expect(await screen.findByText("No projects yet")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^projects$/i }),
    ).toBeInTheDocument()
  })

  it("syncs stale workspaceId in localStorage to first workspace", async () => {
    localStorage.setItem("workspaceId", "old-id")
    localStorage.setItem("role", "MEMBER")

    vi.mocked(getWorkspaces).mockResolvedValue([
      { workspaceId: "new-id", name: "Fresh", role: "ADMIN" },
    ])
    vi.mocked(getProjects).mockResolvedValue([])
    vi.mocked(getDashboardAnalytics).mockResolvedValue(null)
    vi.mocked(getTasks).mockResolvedValue([])

    render(<Dashboard />)

    await waitFor(() => {
      expect(localStorage.getItem("workspaceId")).toBe("new-id")
      expect(localStorage.getItem("role")).toBe("ADMIN")
    })
  })
})

import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TaskComments from "./TaskComments"

vi.mock("@/features/tasks/api", () => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
}))

import { getComments, createComment } from "@/features/tasks/api"

describe("TaskComments", () => {
  beforeEach(() => {
    vi.mocked(getComments).mockResolvedValue([])
    vi.mocked(createComment).mockResolvedValue({})
  })

  it("shows empty state when there are no comments", async () => {
    render(<TaskComments taskId="task-1" />)
    expect(
      await screen.findByText(/No comments yet/),
    ).toBeInTheDocument()
    expect(getComments).toHaveBeenCalledWith("task-1")
  })

  it("lists comments from API", async () => {
    vi.mocked(getComments).mockResolvedValue([
      {
        _id: "c1",
        content: "First note",
        userId: { email: "a@test.com" },
        createdAt: "2026-04-22T10:00:00.000Z",
      },
    ])

    render(<TaskComments taskId="t2" />)

    expect(await screen.findByText("First note")).toBeInTheDocument()
    expect(screen.getByText("a@test.com")).toBeInTheDocument()
  })

  it("submits new comment and reloads list", async () => {
    const user = userEvent.setup()
    vi.mocked(getComments)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { _id: "c2", content: "hi", userId: { email: "u@test.com" } },
      ])

    render(<TaskComments taskId="tid" />)

    await screen.findByPlaceholderText(/Write a comment/)

    await user.type(screen.getByPlaceholderText(/Write a comment/), "hi")
    await user.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith("tid", "hi")
    })
    // load() on mount + after submit (React Strict Mode may double-mount in dev)
    expect(vi.mocked(getComments).mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})

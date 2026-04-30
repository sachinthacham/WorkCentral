import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EmptyState from "./EmptyState"

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="Nothing here" description="Add something to get started." />,
    )
    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument()
    expect(screen.getByText("Add something to get started.")).toBeInTheDocument()
  })

  it("runs action when button clicked", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <EmptyState
        title="No items"
        action={{ label: "Create one", onClick }}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Create one" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

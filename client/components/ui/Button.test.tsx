import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Button from "./Button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument()
  })

  it("is disabled while loading", () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled()
  })

  it("calls onClick when enabled", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Go</Button>)
    await user.click(screen.getByRole("button", { name: "Go" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

import { describe, it, expect, beforeEach, vi } from "vitest"
import { clearSessionStorage, loginUser, forgotPassword } from "./api"

vi.mock("@/services/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { api } from "@/services/api"

describe("clearSessionStorage", () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem("accessToken", "a")
    localStorage.setItem("refreshToken", "r")
    localStorage.setItem("workspaceId", "w")
    localStorage.setItem("role", "MEMBER")
    localStorage.setItem("savedLoginEmail", "keep@me.com")
  })

  it("removes auth session keys only", () => {
    clearSessionStorage()
    expect(localStorage.getItem("accessToken")).toBeNull()
    expect(localStorage.getItem("refreshToken")).toBeNull()
    expect(localStorage.getItem("workspaceId")).toBeNull()
    expect(localStorage.getItem("role")).toBeNull()
    expect(localStorage.getItem("savedLoginEmail")).toBe("keep@me.com")
  })
})

describe("loginUser", () => {
  it("POSTs login payload and returns response body", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { accessToken: "at", refreshToken: "rt" },
    })

    const out = await loginUser({ email: "u@test.com", password: "secret" })

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "u@test.com",
      password: "secret",
    })
    expect(out).toEqual({ accessToken: "at", refreshToken: "rt" })
  })
})

describe("forgotPassword", () => {
  it("POSTs email to forgot-password endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: "ok" } })

    const out = await forgotPassword("x@test.com")

    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "x@test.com",
    })
    expect(out).toEqual({ message: "ok" })
  })
})

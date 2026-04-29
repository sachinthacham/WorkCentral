import { api } from "@/services/api"

export const registerUser = async (data: {
  name: string
  email: string
  password: string
}) => {
  const res = await api.post("/auth/register", data)
  return res.data
}

export const loginUser = async (data: {
  email: string
  password: string
}) => {
  const res = await api.post("/auth/login", data)
  return res.data
}

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email })
  return res.data
}

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await api.post("/auth/reset-password", { token, newPassword })
  return res.data
}

export const logoutUser = async () => {
  const res = await api.post("/auth/logout")
  return res.data
}

/** Clear session tokens only (keeps e.g. saved login email). */
export function clearSessionStorage() {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("workspaceId")
  localStorage.removeItem("role")
}

export const getProfile = async () => {
  const res = await api.get("/auth/profile")
  return res.data
}

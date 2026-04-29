import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

const baseURL = "http://localhost:3000"

export const api = axios.create({
  baseURL,
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
    )
    localStorage.setItem("accessToken", data.accessToken)
    localStorage.setItem("refreshToken", data.refreshToken)
    return data.accessToken
  } catch {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    const url = originalRequest.url ?? ""
    if (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/register")) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }
    const newAccess = await refreshPromise

    if (!newAccess) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname
        if (!path.startsWith("/login") && !path.startsWith("/register")) {
          window.location.href = "/login"
        }
      }
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${newAccess}`
    return api(originalRequest)
  },
)

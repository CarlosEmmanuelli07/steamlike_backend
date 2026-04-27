"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "./api/client"
import type { User, ApiError } from "./api/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const userData = await api.getMe()
      setUser(userData)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const userData = await api.login({ username, password })
    setUser(userData)
  }

  const register = async (username: string, password: string) => {
    await api.register({ username, password })
    // Auto-login after register
    await login(username, password)
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    "message" in error
  )
}

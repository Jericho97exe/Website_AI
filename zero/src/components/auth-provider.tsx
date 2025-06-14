"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  username: string
  role: "admin" | "user"
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, password: string, role: "admin" | "user") => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.username === username && u.password === password)

    if (user) {
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const register = async (username: string, password: string, role: "admin" | "user") => {
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if username already exists
    if (users.some((u: any) => u.username === username)) {
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role,
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // If this is the first user, make them an admin
    if (users.length === 1) {
      const userData = {
        id: newUser.id,
        username: newUser.username,
        role: "admin",
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    }

    return true
  }

  return <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

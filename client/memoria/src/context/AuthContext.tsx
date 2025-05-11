"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (token: string, refreshToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // This only runs on the client
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
    setIsAuthenticated(!!token)
  }, [])

  const login = (token: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", token)
      localStorage.setItem("refreshToken", refreshToken)
    }
    setIsAuthenticated(true)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
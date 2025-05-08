"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import CardIllustration from "@/components/card-illustration"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("email")
      return
    }
    // In a real app, you would handle authentication here
    console.log("Login attempt with:", email, password)
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">Logging in?</h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="email" className="block mb-1">
                  Email
                </label>
                {error === "email" && <p className="text-red-500 text-xs mb-1">*required</p>}
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full btn-primary py-2 mt-4">
                Log in
              </button>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-green-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <img src="/flashcard_illustration.png" alt="Minh họa" className="max-w-full h-auto" />
          </div>
                
        </div>
      </div>
    </main>
  )
}

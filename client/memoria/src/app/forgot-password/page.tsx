"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/src/components/navbar"
import CardIllustration from "@/src/components/card-illustration"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle password reset here
    console.log("Password reset attempt with:", email, password)
    // Redirect to success page
    window.location.href = "/password-success"
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">Forget password?</h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="email" className="block mb-1">
                  Email
                </label>
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

              <div className="text-xs space-y-1 mt-2">
                <p>Password requirements:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Minimum of 8 characters.</li>
                  <li>
                    Must include the following:
                    <ul className="list-disc pl-5 space-y-1">
                      <li>At least one uppercase (A-Z)</li>
                      <li>At least one lowercase (a-z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (!, @, #, $, etc.)</li>
                    </ul>
                  </li>
                  <li>Avoid using personal information for better security.</li>
                </ul>
              </div>

              <button type="submit" className="w-full btn-primary py-2 mt-4">
                Create new password
              </button>
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

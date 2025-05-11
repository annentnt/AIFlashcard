"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/src/components/navbar"
import CardIllustration from "@/src/components/card-illustration"
import { useRouter } from "next/navigation"

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/request-reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('An email has been sent to your email address. Check your inbox.');
        setTimeout(() => router.push('/reset-verification'), 3000);
      } else {
        setError(data.error || 'An error occurred! Please try again');
      }
    } catch (error) {
      setError('Server connection error!');
    }
  };

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

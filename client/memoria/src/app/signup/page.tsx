"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/navbar"
import CardIllustration from "@/src/components/card-illustration"

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("The passwords did not match!");
      return;
    }

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        
      }
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(response);

      const data = await response.json();

      if (response.ok) {
        router.push('/email-verification/');
      } else {
        setError(data.error || "Failed to sign up, please try again.");
      }
    } catch (error) {
      setError("Connection error, please try again.");
    }
  };

  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-green-500 mb-2 text-center">New to Memoria?</h1>
            <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Let&apos;s create account</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="username" className="block mb-1">
                  Username
                </label>
                {error === "username" && <p className="text-red-500 text-xs mb-1">*required</p>}
                <input
                  type="text"
                  name="username"
                  className="input-field"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-1">
                  Email
                </label>
                {error === "email" && <p className="text-red-500 text-xs mb-1">*required</p>}
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1">
                  Password
                </label>
                {error === "password" && <p className="text-red-500 text-xs mb-1">*required</p>}
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block mb-1">
                  Confirm password
                </label>
                {error === "confirm-password" && <p className="text-red-500 text-xs mb-1">Passwords do not match</p>}
                <input
                    type="password"
                    name="confirmPassword"
                    className="input-field"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
              </div>
              {error && <p className="text-sm text-red-500 text-left">{error}</p>}
              <div>
                <button type="submit" className="w-full btn-primary py-2 mt-4">
                  Sign up
                </button>
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

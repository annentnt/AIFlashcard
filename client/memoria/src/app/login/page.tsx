"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/src/context/AuthContext"
import { useEffect } from "react"
import Link from "next/link"
import Navbar from "@/src/components/navbar"
import CardIllustration from "@/src/components/card-illustration"
import { useRouter } from "next/navigation"

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Load saved username & password when component mounts
  useEffect(() => {
      const savedUsername = localStorage.getItem("rememberedUsername");
      const savedPassword = localStorage.getItem("rememberedPassword");

      if (savedUsername && savedPassword) {
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberMe(true);
      }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form refresh

    try {
      const response = await fetch("http://localhost:8000/api/auth/signin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "username": username,
          "password": password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access); // Store token
        console.log("Token lưu vào localStorage:", data.access);
        // Always update local storage based on checkbox state
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedUsername");
          localStorage.removeItem("rememberedPassword");
        }
        // login(data.access, data.refresh);

        login(data.accessToken, data.refreshToken);
        router.push('/'); 
      } else {
        setErrorMessage(data.error || "Failed to log in!");
      }
    } catch (error) {
      setErrorMessage("Server connection error!");
    }
  };

  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">Logging in?</h1>

            <form onSubmit={handleLogin} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="username" className="block mb-1">
                  Username
                </label>
                {errorMessage === "username" && <p className="text-red-500 text-xs mb-1">*required</p>}
                <input
                  type="text"
                  id="username"
                  className="input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

              {errorMessage && (
                <p className="text-red-500 text-left text-sm mt-4">{errorMessage}</p>
              )}

              <div className="mt-8 flex justify-between items-center">
                <div className="space-x-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe} // Ensure checkbox state is bound
                    onChange={(e) => setRememberMe(e.target.checked)} // Update state on change
                  />
                  <label className="text-sm text-green-700 hover:underline" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="w-full btn-primary py-2 mt-4">
                Log in
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

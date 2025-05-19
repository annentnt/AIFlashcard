"use client"

import Link from "next/link"
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import Image from "next/image"
export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      logout(); // Call the logout function from context
      router.push('/'); // Redirect to home
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 relative">
          <Image
            src="/icon.png"
            alt="Memoria logo"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-2xl font-serif italic">Memoria</span>
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <Link href="/about-us" className="text-white hover:text-gray-400 transition duration-300">
          About us
        </Link>
        <Link href="/create-flashcard" className="text-white hover:text-gray-400 transition duration-300">
          Flashcards
        </Link>
        <Link href="/topics" className="text-white hover:text-gray-400 transition duration-300">
          Learn from flashcards
        </Link>
        <Link href="/learning-history" className="text-white hover:text-gray-400 transition duration-300">
          Learning history
        </Link>
      </div>

      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="btn-outline"
        >
          Log out
        </button>
      ) : (
        <div className="flex items-center space-x-2 justify-center">
          <Link
            href="/signup"
            className="btn-outline"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="btn-outline"
          >
            Log in
          </Link>
        </div>
      )}
    </nav>
  )
}

"use client"

import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"

export default function Home() {
  const { isAuthenticated, login, logout} = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-green-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-3/5 mb-10 md:mb-0 md:pl-24">
                {/* Logo and Welcome Text Container */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src="/icon.png"
                      alt="Memoria logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-green-800 text-xl font-medium">Welcome to</h2>
                </div>
                
                {/* Styled Memoria Heading */}
                <h1 className="text-5xl font-bold text-green-900 mb-4 font-serif">Memoria</h1>
                
                {/* Question Text */}
                <p className="text-green-800 text-xl mb-8">What do you want to learn today?</p>
                
                {/* Action Button */}
                {isAuthenticated ? (
                  <Link href={'/topics'} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors">
                    Learn with your flashcards
                  </Link>
                ) : (
                  <Link href="/login" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition-colors">
                    Log in
                  </Link>
                )}
              </div>
              <div className="w-full md:w-2/5 flex justify-center">
                <img src="/flashcard_illustration.png" alt="Flashcards illustration" className="max-w-full h-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-green-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-12">About us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold mb-2">2.0M+</p>
                <p>Students choose us</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">100M+</p>
                <p>Flashcard created</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">300K+</p>
                <p>Schools and Universities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="bg-green-50 py-12">
          <div className="container mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 italic mb-2">Memoria.com</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              The most comprehensive and feature-rich
              <br />
              AI-assisted self-learning app
            </p>
          </div>

          {/* Feature Cards */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Self-study Card */}
              <div className="bg-green-800 text-white p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4">Self-study</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>100% AI-generated content tailored to your learning goals</li>
                  <li>Personalized learning paths based on your expectations and content-based usage</li>
                  <li>Study anytime, anywhere - no teachers, no limits</li>
                </ul>
              </div>

              {/* Practice Card */}
              <div className="bg-green-800 text-white p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4">Practice</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>500,000+ quiz questions, auto-generated from your flashcards</li>
                  <li>Adaptive difficulty that grows with your level</li>
                  <li>Instant feedback with AI-powered insights</li>
                </ul>
              </div>

              {/* Pronunciation Card */}
              <div className="bg-green-800 text-white p-6 rounded-3xl">
                <h3 className="text-xl font-bold mb-4">Pronunciation</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Learn correct pronunciation with AI voice models</li>
                  <li>Record and compare your speech instantly</li>
                  <li>Real-time feedback to improve your accent and clarity</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
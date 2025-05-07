import Image from "next/image"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-green-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h2 className="text-green-800 text-xl font-medium mb-2">Welcome to</h2>
                <h1 className="text-5xl font-bold text-green-900 italic mb-4">Memoria</h1>
                <p className="text-green-800 text-xl mb-6">What do you want to learn today?</p>
                  <Link href="/login" className="btn-primary px-8 py-3">
                      Log in
                  </Link>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
            <img src="/flashcard_illustration.png" alt="Minh họa" className="max-w-full h-auto" />
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

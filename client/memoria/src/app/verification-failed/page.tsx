import Link from "next/link"
import { X } from 'lucide-react'
import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"

export default function VerificationFailedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-12">
          <h1 className="text-4xl font-bold text-green-600">Email verification failed!</h1>

          <div className="flex justify-center">
            <div className="bg-gray-800 p-6 rounded-full">
              <X className="w-16 h-16 text-white" />
            </div>
          </div>

          <div>
            <Link
              href="/signup"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-12 py-3 rounded-full text-lg font-medium transition-colors"
            >
              Try again!
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

import Link from "next/link"
import { Mail } from "lucide-react"
import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-green-600">Reset password!</h1>

          <div className="space-y-4">
            <p className="text-lg">We have sent a link to reset password to your email!</p>
          </div>

          <div className="flex justify-center py-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <Mail className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <p className="text-gray-600">
              Please check your inbox and click on the link to complete reseting password.
            </p>
          </div>

          <div className="pt-8">
            <p className="text-gray-600">
                Haven't received any email?
            </p>
            <Link
              href="/forgot-password"
              className="inline-block bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-md transition-colors"
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
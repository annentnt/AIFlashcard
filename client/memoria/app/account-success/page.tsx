import Link from "next/link"
import Navbar from "@/components/navbar"
import CelebrationIllustration from "@/components/celebration-illustration"

export default function AccountSuccess() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-green-500 mb-6">Account created successfully!</h1>

          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <Link href="/login" className="btn-primary px-12 py-3 mb-8">
            To log in page!
          </Link>

          <div className="mt-4">
            <img src="/Success.png" alt="success" className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </main>
  )
}

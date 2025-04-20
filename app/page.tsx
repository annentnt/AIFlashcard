import Navbar from "@/components/navbar"
import Link from "next/link"

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-8">Welcome to Memoria</h1>
        <p className="text-xl mb-8">Your flashcard learning platform</p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="btn-primary px-8 py-3">
            Log in
          </Link>
          <Link href="/signup" className="btn-outline px-8 py-3">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  )
}

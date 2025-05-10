import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="navbar flex items-center justify-between">
      <Link href="/" className="text-2xl font-serif italic">
        Memoria
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <Link href="/about-us" className="text-white hover:text-gray-200">
          About us
        </Link>
        <Link href="/create-flashcard" className="text-white hover:text-gray-200">
          Flashcards
        </Link>

        <Link href="/learn" className="text-white hover:text-gray-200">
          Learn from flashcards
        </Link>
        <Link href="/learning-history" className="text-white hover:text-gray-200">
          Learning history
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Link href="/signup" className="btn-outline">
          Sign up
        </Link>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    </nav>
  )
}

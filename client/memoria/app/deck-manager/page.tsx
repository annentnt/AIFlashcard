"use client"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import FlashcardDeckManager from "@/components/flashcard-deck-manager"

export default function DeckManagerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deckName = searchParams.get("name") || "Untitled Deck"

  // This is just for demonstration purposes
  // In a real app, you would fetch the deck data from an API
  const demoFlashcards = [
    {
      id: "1",
      question: "Small round fruit growing in bunches, often used to make wine.",
      answer: "Grapes",
    },
    {
      id: "2",
      question: "A round juicy citrus fruit with a tough bright orange skin.",
      answer: "Orange",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow">
        <FlashcardDeckManager initialFlashcards={demoFlashcards} deckName={deckName} />
      </main>
      <Footer />
    </div>
  )
}

import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import MindmapVisualization from "@/src/components/mindmap"
import { notFound } from "next/navigation"

interface MindmapPageProps {
  params: {
    deckId: string
  }
}

export default function MindmapPage({ params }: MindmapPageProps) {
  // In a real app, you would fetch the deck data based on the deckId
  const deckId = params.deckId

  // Sample deck data
  const decks = {
    "1": {
      id: "1",
      name: "Fruits",
      items: [
        { id: "1", term: "Apple", pronunciation: "/æp.əl/", family: "Rosaceae" },
        { id: "2", term: "Orange", pronunciation: "/ɒr.ɪndʒ/", family: "Rutaceae" },
        { id: "3", term: "Pineapple", pronunciation: "/paɪn.æp.əl/", family: "Bromeliaceae" },
      ],
    },
    "2": {
      id: "2",
      name: "Animals",
      items: [
        { id: "1", term: "Lion", pronunciation: "/ˈlaɪ.ən/", family: "Felidae" },
        { id: "2", term: "Elephant", pronunciation: "/ˈel.ɪ.fənt/", family: "Elephantidae" },
        { id: "3", term: "Dolphin", pronunciation: "/ˈdɒl.fɪn/", family: "Delphinidae" },
      ],
    },
  }

  const deck = decks[deckId as keyof typeof decks]

  if (!deck) {
    return notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <MindmapVisualization deck={deck} />
      </main>
      <Footer />
    </div>
  )
}

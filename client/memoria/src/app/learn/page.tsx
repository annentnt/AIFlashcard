import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import FlashcardLearning from "@/src/components/flashcard-learning"

export default function LearnPage() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow">
        <FlashcardLearning />
      </main>
      <Footer />
    </div>
  )
}

import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import LearningHistory from "@/src/components/learning-history"

export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <LearningHistory />
      </main>
      <Footer />
    </div>
  )
}

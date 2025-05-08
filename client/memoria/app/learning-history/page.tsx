import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import LearningHistory from "@/components/learning-history"

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

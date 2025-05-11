import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import FileUploadCard from "@/src/components/file-upload-card"
import TopicList from "@/src/components/topic-card"

export default function CreateFlashcard() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="bg-green-700 text-white p-4 rounded-t-2xl">
          <h1 className="text-xl font-medium text-center">Convert files or text into Memoria flashcards</h1>
        </div>

        <div className="bg-white p-6 rounded-b-2xl shadow-sm mb-12">
          <FileUploadCard />
        </div>

        <h2 className="text-green-700 font-medium text-xl mb-6">Your topics:</h2>

        <TopicList />
      </main>
      <Footer />
    </div>
  )
}
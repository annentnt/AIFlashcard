import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import FileUploadCard from "@/src/components/file-upload-card"
import TopicCard from "../../components/topic-card"


export default function CreateFlashcard(){
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Navbar />
      <main className="flex-grow px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="bg-green-700 text-white p-4 rounded-t-2xl">
          <h1 className="text-xl font-medium text-center">Convert files or text into Memoria Flash card</h1>
        </div>

        <div className="bg-white p-6 rounded-b-2xl shadow-sm mb-12">
          <FileUploadCard />
        </div>

        <h2 className="text-green-500 font-medium text-xl mb-6">Your topics:</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopicCard title="Topic Fruit" cardCount={60} />
          <TopicCard title="Topic Education" cardCount={50} />
          <TopicCard title="Topic Family" cardCount={70} />
          <TopicCard title="Topic Travel" cardCount={30} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
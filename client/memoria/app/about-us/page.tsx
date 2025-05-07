import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-green-50">
        {/* Main Heading */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold text-green-800 mb-16">How about us?</h1>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-800 mb-2">2.0M+</p>
                <p className="text-green-800">Students choose us</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-800 mb-2">100M+</p>
                <p className="text-green-800">Flashcard created</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-800 mb-2">300K+</p>
                <p className="text-green-800">Schools and Universities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="container mx-auto px-4">
          <hr className="border-green-200" />
        </div>

        {/* Description Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 italic mb-2">Memoria.com</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              The most comprehensive and feature-rich
              <br />
              AI-assisted self-learning app
            </p>
          </div>

          {/* Feature Cards */}
          <div className="container mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Self-study Card */}
              <div className="bg-green-800 text-white p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">Self-study</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>100% AI-generated content tailored to your learning goals</li>
                  <li>Personalized learning paths based on your expectations and content-based usage</li>
                  <li>Study anytime, anywhere - no teachers, no limits</li>
                </ul>
              </div>

              {/* Practice Card */}
              <div className="bg-green-800 text-white p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">Practice</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>500,000+ quiz questions, auto-generated from your flashcards</li>
                  <li>Adaptive difficulty that grows with your level</li>
                  <li>Instant feedback with AI-powered insights</li>
                </ul>
              </div>

              {/* Pronunciation Card */}
              <div className="bg-green-800 text-white p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-4">Pronunciation</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Learn correct pronunciation with AI voice models</li>
                  <li>Record and compare your speech instantly</li>
                  <li>Real-time feedback to improve your accent and clarity</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

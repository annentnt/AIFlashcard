"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"

interface Topic {
  id: string
  name: string
  cardCount: number
}

export default function LearnTopicsCarousel() {
  // Sample topics data
  const topics: Topic[] = [
    { id: "1", name: "Topic name", cardCount: 50 },
    { id: "2", name: "Fruit", cardCount: 60 },
    { id: "3", name: "Education", cardCount: 45 },
    { id: "4", name: "Travel", cardCount: 30 },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? topics.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === topics.length - 1 ? 0 : prevIndex + 1))
  }

  const handleStartLearning = () => {
    // In a real app, this would navigate to the flashcard learning interface
    console.log(`Starting to learn topic: ${topics[currentIndex].name}`)
    alert(`Starting to learn ${topics[currentIndex].name}!`)
  }

  const currentTopic = topics[currentIndex]

  return (
    <>
      <Navbar/>
      <div className="w-full max-w-3xl">
        <div className="bg-green-200 text-green-800 py-3 px-6 rounded-xl text-center mb-8">
          <h1 className="text-2xl font-bold">Your topics</h1>
        </div>

        <div className="relative">
          <div className="border border-gray-300 rounded-xl p-12 bg-white">
            <div className="absolute top-4 left-4 text-gray-500">
              {currentIndex + 1}/{topics.length}
            </div>

            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-lg mb-2">Name:</p>
              <h2 className="text-2xl font-bold mb-8">{currentTopic.name}</h2>
              <p className="text-green-400 text-lg">Number of cards: {currentTopic.cardCount}</p>
            </div>
          </div>

          <button
            onClick={handlePrevious}
            className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            aria-label="Previous topic"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            aria-label="Next topic"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex justify-center mt-12">
          <Button
            onClick={handleStartLearning}
            className="bg-green-200 hover:bg-green-300 text-green-800 font-medium text-lg px-8 py-3"
          >
            Dive into learning!
          </Button>
        </div>
      </div>
      <Footer/>
    </>
  )
}
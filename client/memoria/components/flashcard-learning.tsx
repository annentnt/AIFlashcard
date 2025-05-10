"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Volume2, RefreshCw, Mic, ArrowLeft } from "lucide-react"
import HoldToRecordButton from "./HoldToRecordButton";

// Sample flashcard data for different decks
const flashcardData = {
  "1": [
    {
      id: "1",
      term: "Apple",
      answer: "A round fruit that is sweet and grows on trees.",
      pronunciation: "/ˈæp.əl/",
      example: "She eats an apple daily.",
      status: "new",
    },
    {
      id: "2",
      term: "Orange",
      answer: "A round juicy citrus fruit with a tough bright orange skin.",
      pronunciation: "/ˈɒr.ɪndʒ/",
      example: "I prefer orange juice with pulp.",
      status: "learnt",
    },
    {
      id: "3",
      term: "Pineapple",
      answer: "A tropical plant with a large, juicy, edible fruit.",
      pronunciation: "/ˈpaɪn.æp.əl/",
      example: "Pineapple is often used in tropical desserts.",
      status: "unlearnt",
    },
    {
      id: "4",
      term: "Banana",
      answer: "A long curved fruit with a yellow skin and soft sweet flesh.",
      pronunciation: "/bəˈnɑː.nə/",
      example: "Monkeys love to eat bananas.",
      status: "new",
    },
  ],
  "2": [
    {
      id: "1",
      term: "Lion",
      answer: "A large wild cat with a mane around its face.",
      pronunciation: "/ˈlaɪ.ən/",
      example: "The lion is known as the king of the jungle.",
      status: "new",
    },
    {
      id: "2",
      term: "Elephant",
      answer: "A very large animal with a long trunk and tusks.",
      pronunciation: "/ˈel.ɪ.fənt/",
      example: "Elephants have excellent memory.",
      status: "learnt",
    },
    {
      id: "3",
      term: "Dolphin",
      answer: "A marine mammal known for its intelligence and playful behavior.",
      pronunciation: "/ˈdɒl.fɪn/",
      example: "Dolphins communicate using clicks and whistles.",
      status: "unlearnt",
    },
  ],
}

type CardState = "term" | "answer" | "pronunciation-check" | "intonation-practice" | "intonation-pronunciation-check"

interface LearningParams {
  deckId: string
  mode: string
  deckName: string
}

export default function FlashcardLearning() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>("term")
  const [topicName, setTopicName] = useState("TOPIC'S NAME")
  const [pronunciationResult, setPronunciationResult] = useState<"correct" | "incorrect" | null>(null)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [learningParams, setLearningParams] = useState<LearningParams | null>(null)

  // Load learning parameters and flashcards
  useEffect(() => {
    try {
      const storedParams = localStorage.getItem("learningParams")
      if (storedParams) {
        const params = JSON.parse(storedParams) as LearningParams
        setLearningParams(params)
        setTopicName(params.deckName)

        // Get flashcards for the deck
        const allDeckFlashcards = flashcardData[params.deckId as keyof typeof flashcardData] || []

        // Filter flashcards based on the learning mode
        let filteredFlashcards = [...allDeckFlashcards]

        if (params.mode === "new") {
          filteredFlashcards = allDeckFlashcards.filter((card) => card.status === "new")
        } else if (params.mode === "unlearnt") {
          filteredFlashcards = allDeckFlashcards.filter((card) => card.status === "unlearnt")
        } else if (params.mode === "learnt") {
          filteredFlashcards = allDeckFlashcards.filter((card) => card.status === "learnt")
        }

        setFlashcards(filteredFlashcards)
      } else {
        // Default to the first deck if no params are found
        setFlashcards(flashcardData["1"])
      }
    } catch (error) {
      console.error("Error loading learning params:", error)
      // Default to the first deck if there's an error
      setFlashcards(flashcardData["1"])
    }
  }, [])

  // If no flashcards are loaded yet, show a loading state
  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    )
  }

  const currentCard = flashcards[currentCardIndex]

  const handlePrevCard = () => {
    setCardState("term")
    setPronunciationResult(null)
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextCard = () => {
    setCardState("term")
    setPronunciationResult(null)
    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : prev))
  }

  const handleShowAnswer = () => {
    setCardState("answer")
  }

  const handlePlaySound = () => {
    // In a real app, this would play the pronunciation audio
    console.log("Playing sound for:", currentCard.term)

    // Use the Web Speech API for demonstration purposes
    if ("speechSynthesis" in window) {
      // const utterance = new SpeechSynthesisUtterance(currentCard.term)
      // window.speechSynthesis.speak(utterance)
      const text = currentCard.term; // hoặc từ bất kỳ

      fetch('http://127.0.0.1:8000/api/pronunciation/sentence/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Không lấy được audio từ server');
          }
          return response.blob();
        })
        .then(blob => {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.play();
        })
        .catch(error => {
          console.error('Lỗi khi tải phát âm:', error);
        });

    }
  }

  const handlePlayExample = () => {
    // In a real app, this would play the example sentence audio
    console.log("Playing example:", currentCard.example)

    // Use the Web Speech API for demonstration purposes
    if ("speechSynthesis" in window) {
      // const utterance = new SpeechSynthesisUtterance(currentCard.example)
      // window.speechSynthesis.speak(utterance)
      const text = currentCard.example; // hoặc từ bất kỳ

      fetch('http://127.0.0.1:8000/api/pronunciation/sentence/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Không lấy được audio từ server');
          }
          return response.blob();
        })
        .then(blob => {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.play();
        })
        .catch(error => {
          console.error('Lỗi khi tải phát âm:', error);
        });

    }
  }

  const handleCheckPronunciation = () => {
    // In a real app, this would use speech recognition to check pronunciation
    // For demo purposes, we'll randomly determine if it's correct or incorrect
    const isCorrect = Math.random() > 0.5
    setPronunciationResult(isCorrect ? "correct" : "incorrect")

    // Set the appropriate state based on where we're checking pronunciation from
    if (cardState === "term") {
      setCardState("pronunciation-check")
    } else if (cardState === "intonation-practice") {
      setCardState("intonation-pronunciation-check")
    }
  }

  const handleRetry = () => {
    setPronunciationResult(null)

    // Return to the appropriate state based on where we came from
    if (cardState === "pronunciation-check") {
      setCardState("term")
    } else if (cardState === "intonation-pronunciation-check") {
      setCardState("intonation-practice")
    }
  }

  const handleRating = (rating: "forgot" | "almost" | "easy") => {
    // In a real app, this would update the spaced repetition a2xlorithm
    console.log(`Card rated as: ${rating}`)

    // Move to the next card
    handleNextCard()
  }

  const handleIntonationPractice = () => {
    // Switch to intonation practice mode
    setCardState("intonation-practice")
  }

  const handleBackToTerm = () => {
    setCardState("term")
  }

  // Display a message if there are no flashcards for the selected mode
  if (flashcards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="bg-green-200 text-green-800 px-6 py-2 rounded-full font-medium mb-8 inline-block">
          {topicName}
        </div>
        <p className="text-2xl mb-4">No flashcards available for this learning mode.</p>
        <button
          onClick={() => {
            try {
              localStorage.removeItem("learningParams")
            } catch (error) {
              console.error("Error removing learning params:", error)
            }
            window.location.href = "/history"
          }}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-2xl"
        >
          Back to Learning History
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col items-center">
      <div className="bg-green-200 text-green-800 px-6 py-2 rounded-full font-medium mb-8">
        {topicName}
        {learningParams?.mode && (
          <span className="ml-2 text-sm">
            (
            {learningParams.mode === "new"
              ? "New Words"
              : learningParams.mode === "all"
                ? "All Words"
                : learningParams.mode === "unlearnt"
                  ? "Unlearnt Words"
                  : "Learnt Words"}
            )
          </span>
        )}
      </div>

      <div className="w-full max-w-xl bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 relative">
          <div className="absolute top-0 left-0 p-4 text-gray-500 text-sm">
            {currentCardIndex + 1}/{flashcards.length}
          </div>

          {(cardState === "intonation-practice" || cardState === "intonation-pronunciation-check") && (
            <button
              onClick={handleBackToTerm}
              className="absolute top-0 left-12 p-4 text-gray-500 hover:text-gray-700"
              aria-label="Back to term"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="pt-8 pb-4">
            {cardState === "term" && (
              <>
                <h2 className="text-xl font-bold text-center mb-4">{currentCard.term}</h2>

                <div className="flex justify-center items-center gap-2 mb-2">
                  <button
                    onClick={handlePlaySound}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={20} />
                  </button>
                  <span className="text-gray-600">{currentCard.pronunciation}</span>
                </div>

                <button
                  onClick={handleCheckPronunciation}
                  className="text-center text-green-500 hover:underline cursor-pointer block mx-auto"
                >
                  {/* (Check Pronunciation) */}
                  <HoldToRecordButton />
                </button>
              </>
            )}

            {cardState === "answer" && (
              <>
                <p className="text-center mb-8">{currentCard.answer}</p>
                <p className="text-center font-medium mb-4">How well did you remember it?</p>
              </>
            )}

            {cardState === "pronunciation-check" && (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-xl font-bold mb-8">
                  {pronunciationResult === "correct" ? "Correct!" : "Incorrect!"}
                </p>
                <div className="flex gap-4">
                  <button onClick={handleRetry} className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
                    <RefreshCw size={16} />
                    Retry
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleIntonationPractice}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                  >
                    <Mic size={16} />
                    Intonation practice
                  </button>
                </div>
              </div>
            )}

            {cardState === "intonation-practice" && (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-center mb-6">
                  {currentCard.example} <span className="text-gray-500">(Example)</span>
                </p>

                <div className="flex justify-center items-center mb-4">
                  <button
                    onClick={handlePlayExample}
                    className="flex items-center gap-2 text-green-500 hover:text-green-700"
                  >
                    <Volume2 size={20} />
                    <span>(Play)</span>
                  </button>
                </div>

                <button
                  onClick={handleCheckPronunciation}
                  className="text-center text-green-500 hover:underline cursor-pointer"
                >
                  {/* (Check Pronunciation) */}
                  <HoldToRecordButton />
                </button>
              </div>
            )}

            {cardState === "intonation-pronunciation-check" && (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-xl font-bold mb-8">
                  {pronunciationResult === "correct" ? "Correct!" : "Incorrect!"}
                </p>
                <div className="flex gap-4">
                  <button onClick={handleRetry} className="flex items-center gap-1 text-green-500 hover:text-green-700">
                    <RefreshCw size={16} />
                    Retry
                  </button>
                  <span className="text-gray-300">|</span>
                  <button onClick={handleBackToTerm} className="text-green-500 hover:text-green-700">
                    Back to card?
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {cardState === "term" && (
          <button
            onClick={handleShowAnswer}
            className="w-full bg-green-700 text-white py-3 hover:bg-green-800 transition-colors"
          >
            Show Answer
          </button>
        )}

        {cardState === "answer" && (
          <div className="grid grid-cols-3">
            <button
              onClick={() => handleRating("forgot")}
              className="py-3 bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
            >
              <span role="img" aria-label="Sad face">
                😞
              </span>{" "}
              Forgot
            </button>
            <button
              onClick={() => handleRating("almost")}
              className="py-3 bg-yellow-400 text-white hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1"
            >
              <span role="img" aria-label="Neutral face">
                😐
              </span>{" "}
              Almost
            </button>
            <button
              onClick={() => handleRating("easy")}
              className="py-3 bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
            >
              <span role="img" aria-label="Happy face">
                😊
              </span>{" "}
              Easy
            </button>
          </div>
        )}
      </div>

      {cardState === "term" && (
        <div className="flex justify-between items-center w-full max-w-xl mt-4">
          <button
            onClick={handlePrevCard}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentCardIndex === 0}
            aria-label="Previous card"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-4">
            <button
              onClick={handlePlaySound}
              className="bg-green-200 text-green-800 px-4 py-2 rounded-2xl hover:bg-green-300 transition-colors"
            >
              Play sound!!
            </button>
            <button
              onClick={handleIntonationPractice}
              className="bg-green-200 text-green-800 px-4 py-2 rounded-2xl hover:bg-green-300 transition-colors"
            >
              Innotation practice
            </button>
          </div>

          <button
            onClick={handleNextCard}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentCardIndex === flashcards.length - 1}
            aria-label="Next card"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  )
}

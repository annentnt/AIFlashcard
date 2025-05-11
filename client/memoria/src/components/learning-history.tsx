"use client"
import React, { useEffect, useState } from 'react';
import { Trash2, ArrowLeft, X } from "lucide-react"
import DeleteDeckModal from "./delete-deck"
import AIChatInterface from "./ai-chat"
import { useRouter } from "next/navigation"

interface Deck {
  id: string
  name: string
  cardCount: number
}

// Sample mindmap data
const mindmapData = {
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

function cardCountStatus(id_topic: string, status: string) {
  return fetch(`http://127.0.0.1:8000/api/learn_history/status/${status}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let filtered = data.filter((item: any) => item.id_topic === id_topic);

      if (status) {
        filtered = filtered.filter((item: any) => item.status === status);
      }

      console.log(`Card count for topic ${id_topic} with status "${status}":`, filtered.length);
      return filtered.length;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      return 0;
    });
}

export default function LearningHistory() {
  const router = useRouter()
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cnt_newcards, setNewCardCount] = useState(0);
  const [cnt_learntcards, setLearntCardCount] = useState(0);

  useEffect(() => {
    async function loadDecks() {
      const countNew = await cardCountStatus("fruits", "new");
      const countLearnt= await cardCountStatus("fruits", "learnt");
      const countAll = countNew + countLearnt;
      setDecks([{ id: "1", name: "FRUITS", cardCount: countAll }]);
    }

    loadDecks();

    cardCountStatus("fruits", "new").then((count) => setNewCardCount(count));
    cardCountStatus("fruits", "learnt").then((count) => setLearntCardCount(count));

  }, []);


  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null)
  const [viewingMindmapId, setViewingMindmapId] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

  const handleDeleteDeck = (id: string) => {
    setDeletingDeckId(id)
  }

  const handleConfirmDelete = () => {
    if (deletingDeckId) {
      setDecks(decks.filter((deck) => deck.id !== deletingDeckId))
      setDeletingDeckId(null)
    }
  }

  const handleCancelDelete = () => {
    setDeletingDeckId(null)
  }

  const navigateToLearn = (deckId: string, mode: string) => {
    // In a real app, this would use Next.js router to navigate with query parameters
    // For our simulation, we'll use localStorage to pass the parameters
    const learningParams = {
      deckId,
      mode,
      deckName: decks.find((deck) => deck.id === deckId)?.name || "Deck",
    }

    try {
      localStorage.setItem("learningParams", JSON.stringify(learningParams))
    } catch (error) {
      console.error("Error saving learning params:", error)
    }

    // Navigate to the learn page
    router.push("/learn")
  }

  const handleLearnNewWords = (deckId: string) => {
    navigateToLearn(deckId, "new")
  }

  const handleLearnAllWords = (deckId: string) => {
    navigateToLearn(deckId, "all")
  }

  const handleLearnUnlearntWords = (deckId: string) => {
    navigateToLearn(deckId, "unlearnt")
  }

  const handleRelearnLearntWords = (deckId: string) => {
    navigateToLearn(deckId, "learnt")
  }

  const handleViewMindmap = (deckId: string) => {
    setViewingMindmapId(deckId)
    setShowChat(false)
  }

  const handleBackFromMindmap = () => {
    setViewingMindmapId(null)
    setShowChat(false)
  }

  const handleToggleChat = () => {
    setShowChat(!showChat)
  }

  const handleCloseChat = () => {
    setShowChat(false)
  }

  // If viewing a mindmap, show the mindmap view
  if (viewingMindmapId) {
    const mindmapDeck = mindmapData[viewingMindmapId as keyof typeof mindmapData]

    if (!mindmapDeck) {
      return (
        <div className="max-w-3xl mx-auto text-center py-8">
          <p>Deck not found</p>
          <button
            onClick={handleBackFromMindmap}
            className="mt-4 bg-green-200 text-green-800 px-4 py-2 rounded-2xl hover:bg-green-300 transition-colors"
          >
            Back to Learning History
          </button>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto">
        {showChat ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[500px] mb-6 relative">
            <button
              onClick={handleCloseChat}
              className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded-full z-10"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
            <AIChatInterface storeId="8844d825-832b-4574-942d-d1e25b088663" onClose={handleCloseChat} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackFromMindmap}
                className="bg-green-200 text-green-800 px-4 py-2 rounded-2xl hover:bg-green-300 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="text-2xl font-bold">{mindmapDeck.name}:</h1>
              <div className="w-20"></div> {/* Spacer for alignment */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="aspect-video relative">
                <svg viewBox="0 0 800 500" className="w-full h-full" style={{ fontFamily: "Arial, sans-serif" }}>
                  {/* Central node */}
                  <g>
                    <circle cx="400" cy="200" r="50" fill="#8EEDC7" />
                    <text x="400" y="205" textAnchor="middle" fontSize="20" fontWeight="bold">
                      {mindmapDeck.name}
                    </text>
                  </g>

                  {/* Family nodes and connections */}
                  {mindmapDeck.items.map((item, index) => {
                    // Position families around the central node
                    const familyPositions = [
                      { x: 250, y: 170 }, // Left
                      { x: 550, y: 170 }, // Right
                      { x: 400, y: 300 }, // Bottom
                    ]

                    const familyPos = familyPositions[index % familyPositions.length]

                    // Position items near their families
                    const itemPositions = [
                      { x: 210, y: 230 }, // Bottom left
                      { x: 460, y: 290 }, // Bottom right
                      { x: 340, y: 350 }, // Bottom
                    ]

                    const itemPos = itemPositions[index % itemPositions.length]

                    const familyColors = ["#FFD8B1", "#FFF9B1", "#B1FFD8"]
                    const itemColors = ["#FFB1B1", "#FFD8B1", "#FFF9B1"]

                    return (
                      <g key={item.id}>
                        {/* Family node */}
                        <circle
                          cx={familyPos.x}
                          cy={familyPos.y}
                          r="40"
                          fill={familyColors[index % familyColors.length]}
                        />
                        <text x={familyPos.x} y={familyPos.y + 5} textAnchor="middle" fontSize="16">
                          {item.family}
                        </text>
                        <line x1="400" y1="200" x2={familyPos.x} y2={familyPos.y} stroke="#CCCCCC" strokeWidth="2" />

                        {/* Item node */}
                        <circle cx={itemPos.x} cy={itemPos.y} r="40" fill={itemColors[index % itemColors.length]} />
                        <text x={itemPos.x} y={itemPos.y - 5} textAnchor="middle" fontSize="16">
                          {item.term}
                        </text>
                        <text x={itemPos.x} y={itemPos.y + 15} textAnchor="middle" fontSize="12" fill="#666666">
                          {item.pronunciation}
                        </text>
                        <line
                          x1={familyPos.x}
                          y1={familyPos.y}
                          x2={itemPos.x}
                          y2={itemPos.y}
                          stroke="#CCCCCC"
                          strokeWidth="2"
                        />
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleToggleChat}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-2 rounded-2xl"
          >
            {showChat ? "View mindmap" : "Chat with our AI!"}
          </button>
        </div>
      </div>
    )
  }

  // Otherwise, show the learning history view
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {decks.map((deck) => (
          <div key={deck.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-green-700 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-medium">{deck.name}</h2>
              <button
                onClick={() => handleDeleteDeck(deck.id)}
                className="p-1 hover:bg-red-500 rounded-full transition-colors"
                aria-label={`Delete ${deck.name} deck`}
              >
                <Trash2 className="text-white" size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="font-medium mb-3">Number of card: {deck.cardCount}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <div
                  // onClick={() => handleLearnNewWords(deck.id)}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded-2xl hover:bg-green-300 transition-colors"
                >
                  Learn new words: {cnt_newcards}
                </div>

                {/* <button
                  onClick={() => handleLearnAllWords(deck.id)}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded-2xl hover:bg-green-300 transition-colors"
                >
                  Learn all words
                </button> */}

                {/* <button
                  onClick={() => handleLearnUnlearntWords(deck.id)}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded-2xl hover:bg-green-300 transition-colors"
                >
                  Relearn unlearnt words + {cnt_unlearnt_words}
                </button> */}

                <div
                  // onClick={() => handleRelearnLearntWords(deck.id)}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded-2xl hover:bg-green-300 transition-colors"
                >
                  Relearn learnt words: {cnt_learntcards}
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-4">
              <button
                onClick={() => handleViewMindmap(deck.id)}
                className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition-colors"
              >
                View mindmap & chat with AI
              </button>
            </div>
          </div>
        ))}
      </div>

      {deletingDeckId && <DeleteDeckModal onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Pen, Trash2, Plus } from "lucide-react"
import EditFlashcardModal from "./edit-flashcard"
import DeleteFlashcardModal from "./delete-flashcard"

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface FlashcardDeckManagerProps {
  initialFlashcards?: Flashcard[]
  deckName?: string
}

export default function FlashcardDeckManager({
  initialFlashcards = [],
  deckName = "Untitled Deck",
}: FlashcardDeckManagerProps) {
  // Default flashcards if none are provided
  const defaultFlashcards = [
    {
      id: "1",
      question: "Small round fruit growing in bunches, often used to make wine.",
      answer: "Grapes",
    },
    {
      id: "2",
      question: "A round juicy citrus fruit with a tough bright orange skin.",
      answer: "Orange",
    },
  ]

  const [flashcards, setFlashcards] = useState<Flashcard[]>(
    initialFlashcards.length > 0 ? initialFlashcards : defaultFlashcards,
  )

  // State for modals
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | null>(null)

  const handleAddFlashcard = () => {
    // In a real app, this would open a form to create a new flashcard
    const newFlashcard: Flashcard = {
      id: `${Date.now()}`, // Use timestamp for unique ID
      question: "New flashcard question",
      answer: "New flashcard answer",
    }
    setFlashcards([...flashcards, newFlashcard])
  }

  const handleEditFlashcard = (id: string) => {
    const flashcard = flashcards.find((card) => card.id === id)
    if (flashcard) {
      setEditingFlashcard(flashcard)
    }
  }

  const handleSaveEdit = (id: string, question: string, answer: string) => {
    setFlashcards(flashcards.map((card) => (card.id === id ? { ...card, question, answer } : card)))
    setEditingFlashcard(null)
  }

  const handleCancelEdit = () => {
    setEditingFlashcard(null)
  }

  const handleDeleteFlashcard = (id: string) => {
    setDeletingFlashcardId(id)
  }

  const handleConfirmDelete = () => {
    if (deletingFlashcardId) {
      setFlashcards(flashcards.filter((card) => card.id !== deletingFlashcardId))
      setDeletingFlashcardId(null)
    }
  }

  const handleCancelDelete = () => {
    setDeletingFlashcardId(null)
  }

  const handleSaveDeck = () => {
    // In a real app, this would save the deck to a database
    console.log("Saving deck:", { deckName, flashcards })
    alert("Deck saved successfully!")
  }

  return (
    <>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Flashcard in this deck ({flashcards.length})</h1>
          <Button onClick={handleSaveDeck} className="bg-green-500 hover:bg-green-600 text-white">
            Save
          </Button>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleAddFlashcard}
            className="w-full border-2 border-green-200 rounded-lg py-3 px-4 text-center hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Add flashcard</span>
          </button>

          {flashcards.map((card) => (
            <div key={card.id} className="border-2 border-green-200 rounded-lg p-6 relative">
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={() => handleEditFlashcard(card.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Edit flashcard"
                >
                  <Pen size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteFlashcard(card.id)}
                  className="p-2 hover:bg-red-100 rounded-full"
                  aria-label="Delete flashcard"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>

              <div className="text-center mb-6">{card.question}</div>
              <div className="text-center font-bold">{card.answer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingFlashcard && (
        <EditFlashcardModal flashcard={editingFlashcard} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
      )}

      {/* Delete Confirmation Modal */}
      {deletingFlashcardId && <DeleteFlashcardModal onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </>
  )
}

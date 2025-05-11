"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Pen, Trash2, Plus, Check, AlertCircle, Loader } from "lucide-react"
import EditFlashcardModal from "./edit-flashcard"
import DeleteFlashcardModal from "./delete-flashcard"

interface Flashcard {
  id: string
  vocabulary: string
  description: string
}

interface FlashcardDeckManagerProps {
  initialFlashcards?: Flashcard[]
  deckName?: string
}

export default function FlashcardDeckManager({
  initialFlashcards = [],
  deckName = "Untitled Deck",
}: FlashcardDeckManagerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(
    initialFlashcards.length > 0 ? initialFlashcards : []
  )

  // State for modals
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | null>(null)
  
  // State for saving
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  

  const handleEditFlashcard = (id: string) => {
    const flashcard = flashcards.find((card) => card.id === id)
    if (flashcard) {
      setEditingFlashcard(flashcard)
    }
  }

  const handleSaveEdit = (id: string, description: string) => {
    // Only update the description field, vocabulary remains unchanged
    setFlashcards(flashcards.map((card) => (card.id === id ? { ...card, description } : card)))
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
    // Reset states
    setSaveError('')
    setSaveSuccess(false)
    setIsSaving(true)
    
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setSaveError("You need to be logged in to save changes.")
        setIsSaving(false)
        return;
      }
      
      // Extract the deck ID from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const deckId = urlParams.get('id');
      
      if (!deckId) {
        setSaveError("Deck ID not found.")
        setIsSaving(false)
        return;
      }
      
      fetch(`http://127.0.0.1:8000/api/flashcards/${deckId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: deckName,
          flashcards: flashcards
        }),
        credentials: 'same-origin',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to save changes");
        }
        return response.json();
      })
      .then(() => {
        setSaveSuccess(true)
        // Auto hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000)
      })
      .catch(err => {
        console.error("Error saving deck:", err);
        setSaveError("Failed to save changes. Please try again.")
      })
      .finally(() => {
        setIsSaving(false)
      });
    } catch (err) {
      console.error("Error in save operation:", err);
      setSaveError("An error occurred while saving.")
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Flashcards in this deck ({flashcards.length})</h2>
          <Button 
            onClick={handleSaveDeck} 
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>

        {saveError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center mb-4">
            <Check className="h-5 w-5 mr-2" />
            <span>Deck saved successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          
          {flashcards.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No flashcards in this deck yet. Click "Add flashcard" to get started.</p>
            </div>
          ) : (
            flashcards.map((card) => (
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

                <div className="text-center mb-6">{card.description}</div>
                <div className="text-center font-bold text-green-700">{card.vocabulary}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal - Only allows editing description */}
      {editingFlashcard && (
        <EditFlashcardModal 
          flashcard={editingFlashcard} 
          onSave={handleSaveEdit} 
          onCancel={handleCancelEdit} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingFlashcardId && (
        <DeleteFlashcardModal 
          onConfirm={handleConfirmDelete} 
          onCancel={handleCancelDelete} 
        />
      )}
    </>
  )
}
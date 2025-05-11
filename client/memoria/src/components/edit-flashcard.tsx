"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface EditFlashcardModalProps {
  flashcard: {
    id: string
    vocabulary: string  // Changed from question to vocabulary
    description: string  // Changed from answer to description
  }
  onSave: (id: string, description: string) => void  // Updated to only save description
  onCancel: () => void
}

export default function EditFlashcardModal({ flashcard, onSave, onCancel }: EditFlashcardModalProps) {
  const [description, setDescription] = useState(flashcard.description)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(flashcard.id, description)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Edit</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Display the vocabulary field as read-only */}
            <div className="space-y-2">
              <label htmlFor="vocabulary" className="block text-center font-medium">
                Vocabulary
              </label>
              <Input
                id="vocabulary"
                value={flashcard.vocabulary}
                readOnly
                className="w-full border-gray-300 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-center font-medium">
                Description
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the description"
                className="w-full border-gray-300"
              />
            </div>

            <div className="flex justify-center pt-2">
              <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-8">
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
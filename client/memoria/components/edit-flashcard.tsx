"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditFlashcardModalProps {
  flashcard: {
    id: string
    question: string
    answer: string
  }
  onSave: (id: string, question: string, answer: string) => void
  onCancel: () => void
}

export default function EditFlashcardModal({ flashcard, onSave, onCancel }: EditFlashcardModalProps) {
  const [question, setQuestion] = useState(flashcard.question)
  const [answer, setAnswer] = useState(flashcard.answer)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(flashcard.id, question, answer)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Edit</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="question" className="block text-center font-medium">
                Question
              </label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="String"
                className="w-full border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="answer" className="block text-center font-medium">
                Answer
              </label>
              <Input
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="String"
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

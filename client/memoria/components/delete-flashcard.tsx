"use client"

import { Button } from "@/components/ui/button"

interface DeleteFlashcardModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteFlashcardModal({ onConfirm, onCancel }: DeleteFlashcardModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-lg font-medium mb-6">Do you want to delete this flashcard?</h2>

          <div className="grid grid-cols-2 gap-0">
            <Button
              onClick={onConfirm}
              className="bg-green-700 hover:bg-green-800 text-white rounded-none rounded-bl-lg"
            >
              Yes
            </Button>
            <Button
              onClick={onCancel}
              className="bg-green-700 hover:bg-green-800 text-white rounded-none rounded-br-lg"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

interface DeleteDeckModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteDeckModal({ onConfirm, onCancel }: DeleteDeckModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-center mb-6">Do you want to delete this deck?</h2>

          <div className="grid grid-cols-2 gap-0">
            <button onClick={onConfirm} className="bg-green-700 hover:bg-green-800 text-white py-3 rounded-bl-lg">
              Yes
            </button>
            <button onClick={onCancel} className="bg-green-700 hover:bg-green-800 text-white py-3 rounded-br-lg">
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

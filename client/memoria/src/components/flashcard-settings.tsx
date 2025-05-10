"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import FlashcardDeckManager from "./flashcard-deck-manager"

interface FlashcardSettingsProps {
  onGenerate: (settings: {
    deckName: string
    language: string
    pageRanges: string
  }) => void
  onCancel: () => void
}

export default function FlashcardSettings({ onGenerate, onCancel }: FlashcardSettingsProps) {
  const [settings, setSettings] = useState({
    deckName: "Health",
    language: "Auto-detect",
    pageRanges: "20-40",
  })
  const [showDeckManager, setShowDeckManager] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Call the onGenerate callback to inform the parent component
    onGenerate(settings)
    // Show the deck manager
    setShowDeckManager(true)
  }

  // If showDeckManager is true, render the FlashcardDeckManager component
  if (showDeckManager) {
    return <FlashcardDeckManager deckName={settings.deckName} />
  }

  // Otherwise, render the settings form
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-xl mx-auto">
      <div className="bg-green-700 text-white p-4">
        <h2 className="text-xl font-medium">Flashcard settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="deckName">Deck Name</Label>
          <Input
            id="deckName"
            name="deckName"
            placeholder="Health"
            value={settings.deckName}
            onChange={handleChange}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            name="language"
            placeholder="Auto-detect"
            value={settings.language}
            onChange={handleChange}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pageRanges">Page ranges</Label>
          <Input
            id="pageRanges"
            name="pageRanges"
            placeholder="20-40"
            value={settings.pageRanges}
            onChange={handleChange}
            className="border-gray-300"
          />
        </div>

        <div className="flex justify-center pt-2">
          <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-8">
            Generate flashcard
          </Button>
        </div>
      </form>
    </div>
  )
}

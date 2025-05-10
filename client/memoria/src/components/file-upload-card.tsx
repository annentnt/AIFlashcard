"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Upload } from "lucide-react"
import FlashcardSettings from "./flashcard-settings"

export default function FileUploadCard() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [textContent, setTextContent] = useState("")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value)
  }

  const handleCreateFlashcard = () => {
    // Check if either file is selected or text is entered
    if (selectedFile || textContent.trim()) {
      setShowSettings(true)
    }
  }

  const handleGenerateFlashcard = (settings: {
    deckName: string
    language: string
    pageRanges: string
  }) => {
    // In a real app, you would process the file/text with these settings
    console.log("Generating flashcard with settings:", settings)
    console.log("File:", selectedFile)
    console.log("Text content:", textContent)

    // We don't need to reset the form here as we're going to show the deck manager
    // The deck manager will be rendered by the FlashcardSettings component
  }

  const handleCancelSettings = () => {
    setShowSettings(false)
  }

  if (showSettings) {
    return <FlashcardSettings onGenerate={handleGenerateFlashcard} onCancel={handleCancelSettings} />
  }

  return (
    <div>
      <Tabs defaultValue="file">
        <TabsList className="mb-4">
          <TabsTrigger value="file">File</TabsTrigger>
          <TabsTrigger value="text">Text</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            className={`border-2 border-dashed rounded-md p-8 text-center ${
              isDragging ? "border-green-500 bg-green-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />

            <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
              <Upload className="h-6 w-6" />
              <p>{selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop a file here or click to select"}</p>
              <label htmlFor="file-upload" className="text-green-700 hover:text-green-800 cursor-pointer">
                {selectedFile ? "Change file" : "Browse files"}
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="text">
          <textarea
            className="w-full h-32 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your text here..."
            value={textContent}
            onChange={handleTextChange}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Button className="w-full bg-green-700 hover:bg-green-800" onClick={handleCreateFlashcard}>
          Create flashcard
        </Button>
      </div>
    </div>
  )
}

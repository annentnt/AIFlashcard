"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
}

interface AIChatInterfaceProps {
  deckName: string
  onClose?: () => void
}

export default function AIChatInterface({ deckName, onClose }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Predefined AI responses based on common questions about fruits
  const aiResponses: Record<string, string> = {
    "what is rosaceae":
      "Rosaceae is a large family of flowering plants known as the rose family, which surprisingly includes many common edible fruits – not just flowers!",
    "what is rutaceae":
      "Rutaceae is the citrus family of flowering plants, which includes fruits like oranges, lemons, limes, and grapefruits. They're known for their aromatic oils and citrus flavor.",
    "what is bromeliaceae":
      "Bromeliaceae is the pineapple family of tropical and subtropical flowering plants. Besides pineapples, it includes many ornamental plants like bromeliads.",
    "what fruits are in rosaceae":
      "The Rosaceae family includes apples, pears, quinces, apricots, plums, cherries, peaches, raspberries, strawberries, and many more!",
    "tell me about apples":
      "Apples are pomaceous fruits from the Rosaceae family. They're one of the most widely cultivated tree fruits and come in thousands of varieties with different flavors and textures.",
    "tell me about oranges":
      "Oranges are citrus fruits from the Rutaceae family. They're known for their sweet-tart flavor, high vitamin C content, and are one of the most popular fruits worldwide.",
    "tell me about pineapples":
      "Pineapples are tropical fruits from the Bromeliaceae family. They're known for their sweet-tart flavor, distinctive appearance, and are the only edible fruit in their family.",
    help: "I can answer questions about fruits, their families, nutritional benefits, and more. Try asking about specific fruits or plant families!",
  }

  // Add initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: `Hello! I'm your AI assistant for the ${deckName} deck. How can I help you learn about these items?`,
        sender: "ai",
      },
    ])
  }, [deckName])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Generate AI response
    setTimeout(() => {
      const normalizedInput = inputValue.toLowerCase().trim()

      // Find matching response or use default
      let responseContent = "I'm not sure about that. Try asking about specific fruits or plant families in this deck!"

      for (const [key, response] of Object.entries(aiResponses)) {
        if (normalizedInput.includes(key)) {
          responseContent = response
          break
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "ai",
      }

      setMessages((prev) => [...prev, aiMessage])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-green-200 py-3 px-4 text-center font-medium">Chat with our AI!!</div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-gray-200" : "bg-gray-200"}`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this deck..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

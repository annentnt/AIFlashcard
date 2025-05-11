"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, AlertCircle, Loader } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
}

interface AIChatInterfaceProps {
  storeId: string
  onClose?: () => void
}

export default function AIChatInterface({ storeId, onClose }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: `Hello! I am the AI assistant for the document you just uploaded. Feel free to ask anything you want to know!`,
        sender: "ai",
      },
    ])
  }, [storeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessageToBackend = async (message: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get the token from localStorage (same approach as in flashcard-deck-manager.tsx)
      const accessToken = localStorage.getItem("accessToken")
      
      if (!accessToken) {
        throw new Error("You need to log in to use this feature.")
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message,
          store_id: storeId,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
        credentials: 'same-origin',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Cannot get feedback from the server.")
      }

      const data = await response.json()
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id)
      }

      return data.answer
    } catch (error) {
      console.error("Error when call API:", error)
      const errorMessage = error instanceof Error ? error.message : "Sorry, there was an error connecting to the AI."
      setError(errorMessage)
      return "I'm sorry, an error occurred while connecting to the AI. Please try again later."
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    const question = inputValue
    setInputValue("")

    const answer = await sendMessageToBackend(question)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: answer,
      sender: "ai",
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-green-200 py-3 px-4 text-center font-medium">
        Chat with AI Assistant!
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 m-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user" ? "bg-gray-200" : "bg-green-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
          placeholder="Enter a question about the document..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md disabled:bg-green-400"
          aria-label="Send message"
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  )
}
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
  storeId: string
  onClose?: () => void
}

export default function AIChatInterface({ storeId, onClose }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [conversationId, setConversationId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: `Xin chào! Mình là trợ lý AI cho tài liệu bạn vừa tải lên. Hãy hỏi bất cứ điều gì bạn muốn tìm hiểu!`,
        sender: "ai",
      },
    ])
  }, [storeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessageToBackend = async (message: string): Promise<string> => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Nếu dùng JWT: Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          store_id: storeId,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể lấy phản hồi từ server.")
      }

      const data = await response.json()
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id)
      }

      return data.answer
    } catch (error) {
      console.error("Lỗi khi gọi API:", error)
      return "Xin lỗi, có lỗi xảy ra khi kết nối tới AI."
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

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
        Chat với trợ lý AI!
      </div>

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
          placeholder="Nhập câu hỏi về tài liệu..."
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-md"
          aria-label="Gửi tin nhắn"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

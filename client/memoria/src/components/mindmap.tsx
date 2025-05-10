"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"

interface MindmapItem {
  id: string
  term: string
  pronunciation: string
  family: string
}

interface Deck {
  id: string
  name: string
  items: MindmapItem[]
}

interface MindmapVisualizationProps {
  deck: Deck
}

export default function MindmapVisualization({ deck }: MindmapVisualizationProps) {
  const [showChat, setShowChat] = useState(false)

  const handleToggleChat = () => {
    setShowChat(!showChat)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/history"
          className="bg-green-200 text-green-800 px-4 py-2 rounded-md hover:bg-green-300 transition-colors"
        >
          Back
        </Link>
        <h1 className="text-2xl font-bold">{deck.name}:</h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="aspect-video relative">
          <svg viewBox="0 0 800 500" className="w-full h-full" style={{ fontFamily: "Arial, sans-serif" }}>
            {/* Central node */}
            <g>
              <circle cx="400" cy="200" r="50" fill="#8EEDC7" />
              <text x="400" y="205" textAnchor="middle" fontSize="20" fontWeight="bold">
                {deck.name}
              </text>
            </g>

            {/* Family nodes and connections */}
            {deck.items.map((item, index) => {
              // Position families around the central node
              const familyPositions = [
                { x: 250, y: 170 }, // Left
                { x: 550, y: 170 }, // Right
                { x: 400, y: 300 }, // Bottom
              ]

              const familyPos = familyPositions[index % familyPositions.length]

              // Position items near their families
              const itemPositions = [
                { x: 210, y: 230 }, // Bottom left
                { x: 460, y: 290 }, // Bottom right
                { x: 340, y: 350 }, // Bottom
              ]

              const itemPos = itemPositions[index % itemPositions.length]

              const familyColors = ["#FFD8B1", "#FFF9B1", "#B1FFD8"]
              const itemColors = ["#FFB1B1", "#FFD8B1", "#FFF9B1"]

              return (
                <g key={item.id}>
                  {/* Family node */}
                  <circle cx={familyPos.x} cy={familyPos.y} r="40" fill={familyColors[index % familyColors.length]} />
                  <text x={familyPos.x} y={familyPos.y + 5} textAnchor="middle" fontSize="16">
                    {item.family}
                  </text>
                  <line x1="400" y1="200" x2={familyPos.x} y2={familyPos.y} stroke="#CCCCCC" strokeWidth="2" />

                  {/* Item node */}
                  <circle cx={itemPos.x} cy={itemPos.y} r="40" fill={itemColors[index % itemColors.length]} />
                  <text x={itemPos.x} y={itemPos.y - 5} textAnchor="middle" fontSize="16">
                    {item.term}
                  </text>
                  <text x={itemPos.x} y={itemPos.y + 15} textAnchor="middle" fontSize="12" fill="#666666">
                    {item.pronunciation}
                  </text>
                  <line
                    x1={familyPos.x}
                    y1={familyPos.y}
                    x2={itemPos.x}
                    y2={itemPos.y}
                    stroke="#CCCCCC"
                    strokeWidth="2"
                  />
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleToggleChat} className="bg-green-700 hover:bg-green-800 text-white px-8 py-2 rounded-md">
          Chat with our AI!
        </Button>
      </div>

      {showChat && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="border rounded-lg p-4 h-64 overflow-y-auto mb-4">
            <div className="mb-4">
              <p className="bg-green-100 p-3 rounded-lg inline-block max-w-[80%]">
                Hello! I'm your AI assistant for the {deck.name} deck. How can I help you learn about these items?
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question about this deck..."
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button className="bg-green-700 hover:bg-green-800 text-white">Send</Button>
          </div>
        </div>
      )}
    </div>
  )
}

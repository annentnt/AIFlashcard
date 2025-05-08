import Link from "next/link"

interface TopicCardProps {
  title: string
  cardCount: number
}

export default function TopicCard({ title, cardCount }: TopicCardProps) {
  return (
    <Link href={`/topics/${title.toLowerCase().replace("topic ", "")}`}>
      <div className="border border-green-200 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-gray-600">Number of cards: {cardCount}</p>
      </div>
    </Link>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Topic {
    id: number
    name: string
    flashcards: {
        id: number
        vocabulary: string
        description: string
    }[]
}

export default function TopicsCarousel() {
    const [accessToken, setAccessToken] = useState('');
    const [topics, setTopics] = useState<Topic[]>([])
    const [error, setError] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const router = useRouter();
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setAccessToken(token);
        }
    }, []);
    
    // Fetch topics only when accessToken is ready
    useEffect(() => {
        if (!accessToken) return;
        
        const fetchTopics = async () => {
            try {
            const res = await fetch("http://localhost:8000/api/flashcards/", {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error("Failed to fetch topics");
            const data = await res.json();
            setTopics(data);
            } catch (err) {
            console.error("Error loading topics:", err);
            setError("Unable to load topics.");
            }
    };
    fetchTopics();
    }, [accessToken]); // depend on accessToken

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
    }

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
    }

    const handleLearnNow = (topic: Topic) => {
        // Save params to localStorage
        const learningParams = {
          topicId: topic.id,
          topicName: topic.name,
          mode: "all"  // or dynamic if needed
        };
        localStorage.setItem("learningParams", JSON.stringify(learningParams));
    
        // Navigate to /learn
        router.push("/learn");
      };

    if (error) {
        return <p className="text-center text-red-500">{error}</p>
    }

    return (
        <div className="relative w-full max-w-6xl mx-auto">
        <div className="relative">
            <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
            onClick={scrollLeft}
            aria-label="Scroll Left"
            >
            <ChevronLeft size={24} />
            </button>

            <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth px-8 py-4 no-scrollbar"
            >
            {topics.map((topic) => (
                <div
                    key={topic.id}
                    className="min-w-[220px] max-w-[220px] bg-white border border-green-200 rounded-xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition"
                >
                <h3 className="text-xl font-semibold text-green-700 mb-2">{topic.name}</h3>
                <p className="text-gray-500 text-sm">{topic.flashcards.length} flashcards</p>
                <button
                    onClick={() => handleLearnNow(topic)}
                    className="bg-green-600 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg mt-auto"
                >
                    Learn now
                </button>
                </div>
            ))}
            </div>

            <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
            onClick={scrollRight}
            aria-label="Scroll Right"
            >
            <ChevronRight size={24} />
            </button>
        </div>
        </div>
    )
}
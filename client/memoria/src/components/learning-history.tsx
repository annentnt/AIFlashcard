"use client"
import React, { useEffect, useState } from 'react';
import { Trash2, ArrowLeft, MessageSquare } from "lucide-react"
import DeleteDeckModal from "./delete-deck"
import { useRouter } from "next/navigation"
import { log } from 'console';

interface Topic {
  id: string;
  name: string;
  store_id: string; // 👈 thêm dòng này nếu API trả về field này
  flashcards: {
    id: string;
    vocabulary: string;
    description: string;
  }[];
}


interface LearnedFlashcard {
  id: string;
  vocabulary: string;
  meaning?: string;
  description?: string;
  pronunciation?: string;
  example?: string;
  status?: string;
  [key: string]: any;
}

export default function LearningHistory() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([]);
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State to track learned cards for each topic
  const [topicStats, setTopicStats] = useState<Record<string, { keptInMind: number, learnAgain: number }>>({});
  
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null)

  // First get access token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
    } else {
      setError("No access token found. Please log in.");
      setIsLoading(false);
    }
  }, []);

  // Then fetch topics and calculate stats
  useEffect(() => {
    if (!accessToken) return;
    
    const fetchTopics = async () => {
      setIsLoading(true);
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
        
        // After we have the topics, calculate stats for each
        calculateTopicStats(data);
      } catch (err) {
        console.error("Error loading topics:", err);
        setError("Unable to load topics.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopics();
  }, [accessToken]);

  // Function to calculate stats for each topic
  const calculateTopicStats = (topicsData: Topic[]) => {
    // Get the flashcards from localStorage
    const keptInMindString = localStorage.getItem("keptInMindFlashcards");
    const learnAgainString = localStorage.getItem("learnAgainFlashcards");
    
    let keptInMindCards: LearnedFlashcard[] = [];
    let learnAgainCards: LearnedFlashcard[] = [];
    
    try {
      if (keptInMindString) {
        keptInMindCards = JSON.parse(keptInMindString);
      }
      
      if (learnAgainString) {
        learnAgainCards = JSON.parse(learnAgainString);
      }
    } catch (e) {
      console.error("Error parsing localStorage data:", e);
    }
    
    // Initialize stats object
    const stats: Record<string, { keptInMind: number, learnAgain: number }> = {};
    
    // Go through each topic and count cards for each
    topicsData.forEach(topic => {
      const topicId = String(topic.id);
      
      // Count cards that belong to this topic
      const keptInMindCount = keptInMindCards.filter(card => {
        // Try to match the card to this topic's flashcards
        return topic.flashcards.some(topicCard => String(topicCard.id) === String(card.id));
      }).length;
      
      const learnAgainCount = learnAgainCards.filter(card => {
        return topic.flashcards.some(topicCard => String(topicCard.id) === String(card.id));
      }).length;
      
      stats[topicId] = {
        keptInMind: keptInMindCount,
        learnAgain: learnAgainCount
      };
    });
    
    setTopicStats(stats);
  };

  const handleDeleteDeck = (id: string) => {
    setDeletingDeckId(id)
  }

  const handleConfirmDelete = async () => {
    
    if (deletingDeckId  && accessToken) {
      try {
        // Send delete request to API
        const res = await fetch(`http://localhost:8000/api/flashcards/${deletingDeckId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          credentials: 'same-origin',
        });
        
        if (!res.ok) throw new Error("Failed to delete topic");
        
        // Update UI by removing the deleted topic
        setTopics(topics.filter(topic => String(topic.id) !== deletingDeckId));
        setDeletingDeckId(null);
      } catch (err) {
        console.error("Error deleting topic:", err);
        setError("Failed to delete topic. Please try again.");
      }
    }
  }

  const handleCancelDelete = () => {
    setDeletingDeckId(null)
  }

  const navigateToLearn = (topicId: string, mode: string) => {
    // Find the topic name
    const topic = topics.find(t => String(t.id) === topicId);
    
    if (!topic) {
      console.error("Topic not found:", topicId);
      return;
    }
    
    // Store learning parameters in localStorage
    const learningParams = {
      topicId,
      mode,
      topicName: topic.name,
    }

    try {
      localStorage.setItem("learningParams", JSON.stringify(learningParams));
    } catch (error) {
      console.error("Error saving learning params:", error);
    }

    // Navigate to the flashcard learning page
    router.push("/flashcard-learning");
  }

  const handleLearnNewWords = (topicId: string) => {
    navigateToLearn(topicId, "new");
  }

  const handleRelearnLearntWords = (topicId: string) => {
    navigateToLearn(topicId, "learnt");
  }

  // Modified function to navigate to AI Chat - Sửa ở đây
  // Correct implementation of navigateToAiChat function
  const navigateToAiChat = (topicId: string) => {
    try {
      const topic = topics.find(t => String(t.id) === topicId);
      
      if (!topic) {
        console.error("Topic not found:", topicId);
        return;
      }

      // Use the correct store_id here
      localStorage.setItem("currentAIChatStoreId", topic.store_id);
      localStorage.setItem("currentAIChatTopicName", topic.name);
      
      router.push(`/ai-chat?storeId=${topic.store_id}`);
    } catch (error) {
      console.error("Error navigating to AI chat:", error);
      setError("Failed to open AI chat. Please try again.");
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-green-700 text-white px-4 py-2 rounded-2xl hover:bg-green-800 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Show the learning history view
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Learning History</h1>
      
      {topics.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">You haven't studied any topics yet.</p>
          <button
            onClick={() => router.push("/topics")}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-2xl"
          >
            Browse Topics
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {topics.map((topic) => {
            const topicId = String(topic.id);
            const stats = topicStats[topicId] || { keptInMind: 0, learnAgain: 0 };
            
            return (
              <div key={topicId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-green-700 text-white p-4 flex justify-between items-center">
                  <h2 className="text-xl font-medium">{topic.name}</h2>
                  <button
                    onClick={() => handleDeleteDeck(topicId)}
                    className="p-1 hover:bg-red-500 rounded-full transition-colors"
                    aria-label={`Delete ${topic.name} topic`}
                  >
                    <Trash2 className="text-white" size={20} />
                  </button>
                </div>

                <div className="p-4">
                  <p className="font-medium mb-3">Number of cards: {topic.flashcards.length}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handleLearnNewWords(topicId)}
                      className="bg-green-200 text-green-800 px-3 py-1 rounded-2xl hover:bg-green-300 transition-colors"
                    >
                      Learn new words: {stats.learnAgain}
                    </button>

                    <button
                      onClick={() => handleRelearnLearntWords(topicId)}
                      className="bg-green-200 text-green-800 px-3 py-1 rounded-2xl hover:bg-green-300 transition-colors"
                    >
                      Relearn learnt words: {stats.keptInMind}
                    </button>
                    
                    {/* Button to navigate to AI Chat */}
                    <button
                      onClick={() => navigateToAiChat(topicId)}
                      className="bg-green-600 text-white px-3 py-1 rounded-2xl hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={16} />
                      Chat with AI
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deletingDeckId && <DeleteDeckModal onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </div>
  )
}
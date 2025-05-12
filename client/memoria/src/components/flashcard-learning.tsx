"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Volume2, RefreshCw, Mic, Bug } from "lucide-react"
import MicRecorderButton from "./hold-to-record-button"
import { useRouter } from "next/navigation" // Import router for redirecting

// Kiểm tra cấu trúc của flashcard từ API
type Flashcard = {
  id: string;
  vocabulary: string;
  meaning?: string;        // Có thể là meaning
  description?: string;    // Hoặc có thể là description
  pronunciation?: string;
  example?: string;
  status?: "new" | "learnt" | "unlearnt";
  // Thêm các trường khác có thể có
  [key: string]: any;      // Cho phép bất kỳ trường nào khác
}

type CardState = "term" | "answer" | "pronunciation-check" | "debug"

interface LearningParams {
  topicId: string;
  mode: string;
  topicName: string;
}

export default function DebugFlashcardLearning() {
  const router = useRouter() // Initialize the router
  const [token, setToken] = useState<string>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>("term")
  const [topicName, setTopicName] = useState("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [learningParams, setLearningParams] = useState<LearningParams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pronunciationResult, setPronunciationResult] = useState<"correct" | "incorrect" | null>(null)
  const [rawApiResponse, setRawApiResponse] = useState<any>(null)
  
  // Add states to track the learned and unlearned flashcards
  const [keptInMindFlashcards, setKeptInMindFlashcards] = useState<Flashcard[]>([])
  const [learnAgainFlashcards, setLearnAgainFlashcards] = useState<Flashcard[]>([])
  
  // Check if we need to initialize the flashcard arrays from localStorage
  useEffect(() => {
    const storedKeptInMind = localStorage.getItem("keptInMindFlashcards");
    const storedLearnAgain = localStorage.getItem("learnAgainFlashcards");
    
    if (storedKeptInMind) {
      try {
        setKeptInMindFlashcards(JSON.parse(storedKeptInMind));
      } catch (e) {
        console.error("Error parsing kept in mind flashcards:", e);
        localStorage.removeItem("keptInMindFlashcards");
      }
    }
    
    if (storedLearnAgain) {
      try {
        setLearnAgainFlashcards(JSON.parse(storedLearnAgain));
      } catch (e) {
        console.error("Error parsing learn again flashcards:", e);
        localStorage.removeItem("learnAgainFlashcards");
      }
    }
  }, []);

  // Load learning parameters and flashcards
  useEffect(() => {
    try {
      const storedParams = localStorage.getItem("learningParams")
      if (storedParams) {
        const params = JSON.parse(storedParams) as LearningParams
        setLearningParams(params)
        setTopicName(params.topicName)

        // Get authentication token
        const token = localStorage.getItem("accessToken")
        
        if (!token) {
          setError("You need to be logged in to view flashcards.")
          setIsLoading(false)
          return
        }
        
        setToken(token)
        // Fetch flashcards for the topic from the API
        fetchFlashcards(params.topicId, params.mode, token)
      } else {
        setError("No topic selected. Please select a topic first.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error loading learning params:", error)
      setError("Error loading learning parameters. Please try again.")
      setIsLoading(false)
    }
  }, [])

  const fetchFlashcards = async (topicId: string, mode: string, token: string) => {
    try {
      // Fetch topic details including all flashcards
      console.log(`Fetching flashcards for topic ID: ${topicId}`);
      // Cập nhật URL API thành /api/learn/:id/ như bạn đề cập
      const response = await fetch(`http://127.0.0.1:8000/api/learn/${topicId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Failed to fetch flashcards: ${response.status} ${response.statusText}`);
      }
      
      const topicData = await response.json();
      console.log("RAW API RESPONSE:", topicData);
      setRawApiResponse(topicData); // Lưu lại full response để debug
      
      // Extract flashcards from the topic data
      let allFlashcards = topicData.flashcards || [];
      console.log("All flashcards extracted:", allFlashcards);
      
      if (allFlashcards.length === 0) {
        console.warn("No flashcards found in API response");
      }
      
      // Kiểm tra cấu trúc của flashcard đầu tiên nếu có
      if (allFlashcards.length > 0) {
        console.log("First flashcard structure:", allFlashcards[0]);
      }
      
      // Convert API flashcards to our format - checking many possible field names
      const formattedFlashcards = allFlashcards.map((card: any) => {
        // Tìm content hoặc meaning hoặc description
        const meaningContent = card.meaning || card.description || card.content || "No meaning provided";
        
        return {
          id: card.id,
          vocabulary: card.vocabulary || card.term || card.word || "Unknown Term",
          meaning: meaningContent,
          description: meaningContent, // Đảm bảo cả 2 trường đều có giá trị 
          pronunciation: card.pronunciation || "",
          example: card.example || "",
          status: card.status || "new",
          // Lưu toàn bộ dữ liệu gốc để debug
          _original: card
        };
      });
      
      console.log("Formatted flashcards:", formattedFlashcards);
      
      // Filter flashcards based on the learning mode
      let filteredFlashcards = [...formattedFlashcards];
      
      if (mode === "new") {
        filteredFlashcards = formattedFlashcards.filter((card) => card.status === "new");
      } else if (mode === "unlearnt") {
        filteredFlashcards = formattedFlashcards.filter((card) => card.status === "unlearnt");
      } else if (mode === "learnt") {
        filteredFlashcards = formattedFlashcards.filter((card) => card.status === "learnt");
      }
      
      console.log("Filtered flashcards for mode", mode, ":", filteredFlashcards);
      
      if (filteredFlashcards.length === 0) {
        setError(`No ${mode} flashcards available for this topic.`);
      } else {
        setFlashcards(filteredFlashcards);
      }
      
    } catch (err: any) {
      console.error("Error fetching flashcards:", err);
      setError(err.message || "Failed to load flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevCard = () => {
    setCardState("term")
    setPronunciationResult(null)
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNextCard = () => {
    setCardState("term")
    setPronunciationResult(null)
    
    // Check if this is the last card
    if (currentCardIndex >= flashcards.length - 1) {
      // This is the last card, redirect to the learning history page
      redirectToLearningHistory();
    } else {
      // Not the last card, just go to the next one
      setCurrentCardIndex((prev) => prev + 1);
    }
  }
  
  // Function to redirect to learning history page
  const redirectToLearningHistory = () => {
    // Make sure learning stats are saved to localStorage before redirecting
    const topicId = learningParams?.topicId || "unknown";
    
    // Save the current session stats for this topic
    const learningStats = {
      topicId,
      topicName: learningParams?.topicName || "Unknown Topic",
      keptInMindCount: keptInMindFlashcards.length,
      learnAgainCount: learnAgainFlashcards.length,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("lastLearningSession", JSON.stringify(learningStats));
    
    // Update topic-specific counts
    let topicStats = {};
    try {
      const savedTopicStats = localStorage.getItem("topicStats");
      if (savedTopicStats) {
        topicStats = JSON.parse(savedTopicStats);
      }
      
      topicStats = {
        ...topicStats,
        [topicId]: {
          learnt: keptInMindFlashcards.length,
          unlearnt: learnAgainFlashcards.length,
          timestamp: new Date().toISOString()
        }
      };
      
      localStorage.setItem("topicStats", JSON.stringify(topicStats));
    } catch (e) {
      console.error("Error saving topic stats:", e);
    }
    
    // Now redirect to the learning history page
    router.push("/learning-history");
  }

  const handleShowAnswer = () => {
    setCardState("answer")
  }
  
  const handleShowDebug = () => {
    setCardState("debug")
  }
  
  const handleCheckPronunciation = async (audioURL: string) => {
    console.log(audioURL);

    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file_audio", blob, "audio.webm");
      formData.append("text", flashcards[currentCardIndex].vocabulary);

      const evaluationResponse = await fetch("http://127.0.0.1:8000/api/pronunciation/evaluate/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'same-origin', 
        body: formData
      });

      const data = await evaluationResponse.json();
      console.log("Evaluation result:", data);

      const isCorrect = data.war === 0 || data.content_score > 8;
      console.log("Evaluate: ", isCorrect);

      setPronunciationResult(isCorrect ? "correct" : "incorrect");
      setCardState("pronunciation-check");
    } catch (error) {
      console.error("Error during evaluation:", error);
    }
  };

  const handleRetry = () => {
    setPronunciationResult(null);
    setCardState("term");
  }

  const handlePlaySound = () => {
    if (!flashcards[currentCardIndex]) return;
    
    const text = flashcards[currentCardIndex].vocabulary;

    fetch('http://127.0.0.1:8000/api/pronunciation/sentence/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not get audio from server');
        }
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
      })
      .catch(error => {
        console.error('Error playing pronunciation:', error);
      });
  }

  const handleRating = async (rating: "forgot" | "easy") => {
    if (!flashcards[currentCardIndex] || !learningParams) return;
    
    const currentFlashcard = flashcards[currentCardIndex];
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      setToken(token)

      // Update the flashcard status based on the rating
      let newStatus = currentFlashcard.status;
      
      if (rating === "forgot") {
        newStatus = "unlearnt";
        
        // Add to learn again flashcards (avoid duplicates by ID)
        const exists = learnAgainFlashcards.some(card => card.id === currentFlashcard.id);
        if (!exists) {
          const updatedLearnAgain = [...learnAgainFlashcards, currentFlashcard];
          setLearnAgainFlashcards(updatedLearnAgain);
          
          // Store in localStorage for access in other pages
          localStorage.setItem("learnAgainFlashcards", JSON.stringify(updatedLearnAgain));
        }
      } else if (rating === "easy") {
        newStatus = "learnt";
        
        // Add to kept in mind flashcards (avoid duplicates by ID)
        const exists = keptInMindFlashcards.some(card => card.id === currentFlashcard.id);
        if (!exists) {
          const updatedKeptInMind = [...keptInMindFlashcards, currentFlashcard];
          setKeptInMindFlashcards(updatedKeptInMind);
          
          // Store in localStorage for access in other pages
          localStorage.setItem("keptInMindFlashcards", JSON.stringify(updatedKeptInMind));
        }
      }
      
      // Send the status update to the API
      await fetch(`http://127.0.0.1:8000/api/flashcards/card/${currentFlashcard.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Update the local state
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentCardIndex] = {
        ...updatedFlashcards[currentCardIndex],
        status: newStatus
      };
      setFlashcards(updatedFlashcards);
      
    } catch (error) {
      console.error("Error updating flashcard status:", error);
    }
    
    // Check if this is the last card
    if (currentCardIndex >= flashcards.length - 1) {
      // This is the last card, redirect to the learning history page
      redirectToLearningHistory();
    } else {
      // Move to the next card
      handleNextCard();
    }
  }

  const handleBackToTopics = () => {
    window.location.href = "/topics";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="bg-green-200 text-green-800 px-6 py-2 rounded-full font-medium mb-8 inline-block">
          {topicName || "Topic"}
        </div>
        <p className="text-2xl mb-4">{error}</p>
        <button
          onClick={handleBackToTopics}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-2xl"
        >
          Back to Topics
        </button>
      </div>
    )
  }

  // If there are no flashcards, show message
  if (flashcards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <div className="bg-green-200 text-green-800 px-6 py-2 rounded-full font-medium mb-8 inline-block">
          {topicName || "Topic"}
        </div>
        <p className="text-2xl mb-4">No flashcards available for this learning mode.</p>
        <button
          onClick={handleBackToTopics}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-2xl"
        >
          Back to Topics
        </button>
      </div>
    )
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col items-center">
      <div className="bg-green-200 text-green-800 px-6 py-2 rounded-full font-medium mb-8">
        {topicName}
        {learningParams?.mode && (
          <span className="ml-2 text-sm">
            (
            {learningParams.mode === "new"
              ? "New Words"
              : learningParams.mode === "all"
                ? "All Words"
                : learningParams.mode === "unlearnt"
                  ? "Unlearnt Words"
                  : "Learnt Words"}
            )
          </span>
        )}
      </div>

      <div className="w-full max-w-xl bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 relative">
          <div className="absolute top-0 left-0 p-4 text-gray-500 text-sm">
            {currentCardIndex + 1}/{flashcards.length}
          </div>
          
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={handleShowDebug}
              className="text-gray-500 hover:text-red-500"
              title="Show Debug Info"
            >
              <Bug size={18} />
            </button>
          </div>

          <div className="pt-8 pb-4">
            {cardState === "term" && (
              <>
                <h2 className="text-xl font-bold text-center mb-4">{currentCard.vocabulary}</h2>

                <div className="flex justify-center items-center gap-2 mb-2">
                  <button
                    onClick={handlePlaySound}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={20} />
                  </button>
                  <span className="text-gray-600">{currentCard.pronunciation || ""}</span>
                </div>

                <div className="text-center">
                  <MicRecorderButton onComplete={handleCheckPronunciation} />
                </div>
              </>
            )}

            {cardState === "answer" && (
              <>
                <h2 className="text-xl font-bold text-center mb-4">{currentCard.vocabulary}</h2>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Meaning:</h3>
                  <p className="text-center mb-4">
                    {currentCard.meaning || currentCard.description || "No meaning provided"}
                  </p>
                  
                  {currentCard.example && (
                    <>
                      <h3 className="font-medium text-green-800 mb-2">Example:</h3>
                      <p className="text-center italic">"{currentCard.example}"</p>
                    </>
                  )}
                </div>
              </>
            )}
            
            {cardState === "pronunciation-check" && (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-xl font-bold mb-8">
                  {pronunciationResult === "correct" ? "Correct!" : "Incorrect!"}
                </p>
                <div className="flex gap-4">
                  <button onClick={handleRetry} className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
                    <RefreshCw size={16} />
                    Retry
                  </button>
                  <button onClick={handleShowAnswer} className="flex items-center gap-1 text-green-500 hover:text-green-700">
                    Show Answer
                  </button>
                </div>
              </div>
            )}
            
            {cardState === "debug" && (
              <div className="overflow-auto max-h-96 text-xs font-mono">
                <h3 className="font-bold mb-2">Current Flashcard Raw Data:</h3>
                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(currentCard, null, 2)}
                </pre>
                
                <h3 className="font-bold mt-4 mb-2">Available Fields:</h3>
                <ul className="list-disc pl-5 mb-4">
                  {Object.keys(currentCard).filter(k => !k.startsWith('_')).map(key => (
                    <li key={key}>
                      <strong>{key}:</strong> {
                        typeof currentCard[key] === 'object' 
                          ? JSON.stringify(currentCard[key]) 
                          : String(currentCard[key])
                      }
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => setCardState("term")}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm mt-2"
                >
                  Back to Card
                </button>
              </div>
            )}
          </div>
        </div>

        {cardState === "term" && (
          <button
            onClick={handleShowAnswer}
            className="w-full bg-green-700 text-white py-3 hover:bg-green-800 transition-colors"
          >
            Show Answer
          </button>
        )}

        {cardState === "answer" && (
          <div className="grid grid-cols-2">
            <button
              onClick={() => handleRating("forgot")}
              className="py-3 bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
            >
              <span role="img" aria-label="Sad face">
                😞
              </span>{" "}
              Learn again later
            </button>
            <button
              onClick={() => handleRating("easy")}
              className="py-3 bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
            >
              <span role="img" aria-label="Happy face">
                😊
              </span>{" "}
              Kept in mind
            </button>
          </div>
        )}
      </div>

      {cardState === "term" && (
        <div className="flex justify-between items-center w-full max-w-xl mt-4">
          <button
            onClick={handlePrevCard}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentCardIndex === 0}
            aria-label="Previous card"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handlePlaySound}
            className="bg-green-200 text-green-800 px-4 py-2 rounded-2xl hover:bg-green-300 transition-colors"
          >
            Play sound
          </button>

          <button
            onClick={handleNextCard}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentCardIndex === flashcards.length - 1}
            aria-label="Next card"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  )
}
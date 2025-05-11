"use client"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/src/components/navbar"
import Footer from "@/src/components/footer"
import FlashcardDeckManager from "@/src/components/flashcard-deck-manager"
import { Loader, AlertCircle } from "lucide-react"

export default function DeckManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("id");
  const deckName = searchParams.get("name") || "Untitled Deck";
  
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the access token from localStorage
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      setError('You need to be logged in to view this deck');
      setIsLoading(false);
      return;
    }
    
    if (deckId) {
      // Fetch the flashcards for this deck
      fetch(`http://127.0.0.1:8000/api/flashcards/${deckId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'same-origin',
      })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
          }
          throw new Error('Failed to fetch deck details');
        }
        return response.json();
      })
      .then(data => {
        // Format the data to match our FlashcardDeckManager component's expected format
        if (data && data.flashcards) {
          setFlashcards(data.flashcards);
        } else {
          // Use empty array if no flashcards found
          setFlashcards([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching deck:', err);
        setError(err.message || 'Failed to load deck. Please try again later.');
        setIsLoading(false);
      });
    } else {
      // No deck ID provided
      setError('No deck ID provided');
      setIsLoading(false);
    }
  }, [deckId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto flex justify-center items-center py-20">
          <Loader className="h-8 w-8 text-green-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-10 px-4">
          <div className="bg-red-50 p-4 rounded-lg flex items-start text-red-700 max-w-3xl mx-auto">
            <AlertCircle className="h-5 w-5 mt-0.5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6 text-green-800">{deckName}</h1>
          <FlashcardDeckManager 
            initialFlashcards={flashcards} 
            deckName={deckName} 
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
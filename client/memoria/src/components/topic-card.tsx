"use client";

import { useState, useEffect } from 'react';
import { Book, Loader, AlertCircle } from 'lucide-react';

export default function TopicList() {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    // Get token from localStorage when component mounts
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
      fetchTopics(token);
    } else {
      setIsLoading(false);
      setError('You need to be logged in to view topics');
    }
  }, []);

  const fetchTopics = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/flashcards/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Change from 'include' to 'same-origin' to avoid CORS issues
        credentials: 'same-origin',
        // Or remove credentials entirely if you're using token-based auth exclusively
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      setTopics(data);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err.message || 'Failed to load topics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to topic detail page
  const handleTopicClick = (topicId) => {
    window.location.href = `/learn?id=${topicId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {!accessToken ? (
        <div className="col-span-2 bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          <p className="text-center">You need to be logged in to view your topics. Please <a href="/login" className="underline font-medium">log in</a> first.</p>
        </div>
      ) : topics.length === 0 ? (
        <div className="col-span-2 bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          <p className="text-center">You don't have any topics yet. Create your first flashcard deck above!</p>
        </div>
      ) : (
        topics.map((topic) => (
          <div 
            key={topic.id}
            className="bg-white rounded-lg shadow-sm border border-green-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTopicClick(topic.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-green-700">{topic.name}</h3>
              <div className="bg-green-100 text-green-600 py-1 px-3 rounded-full text-sm font-medium">
                {topic.flashcards?.length || 0} cards
              </div>
            </div>
            
            <div className="flex items-center text-gray-500">
              <Book className="h-4 w-4 mr-2" />
              <p className="text-sm">Created on {new Date(topic.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
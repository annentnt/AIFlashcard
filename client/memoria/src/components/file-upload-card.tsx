"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader, MessageSquare } from 'lucide-react';

export default function FileUploadCard() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState(null);
  const [activeTab, setActiveTab] = useState('file');
  const [textContent, setTextContent] = useState('');
  const fileInputRef = useRef(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Settings state
  const [deckName, setDeckName] = useState('');
  const [numFlashcards, setNumFlashcards] = useState('10'); // Changed from pageRanges

  // Add state for authentication tokens
  const [accessToken, setAccessToken] = useState('');

  // Load token from localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is of supported format
      const supportedFormats = ['.pdf', '.docx', '.pptx', '.txt'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (supportedFormats.includes(fileExtension)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError(`Unsupported file format. Please use: ${supportedFormats.join(', ')}`);
        setFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Check if file is of supported format
      const supportedFormats = ['.pdf', '.docx', '.pptx', '.txt'];
      const fileExtension = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (supportedFormats.includes(fileExtension)) {
        setFile(droppedFile);
        setError('');
      } else {
        setError(`Unsupported file format. Please use: ${supportedFormats.join(', ')}`);
        setFile(null);
      }
    }
  };

  const openSettingsModal = () => {
    // Set a default deck name based on file name if available
    if (file) {
      const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
      setDeckName(fileName);
    } else if (textContent.trim()) {
      // Set a default name based on first few words of text content
      const words = textContent.trim().split(' ').slice(0, 3).join(' ');
      setDeckName(words + '...');
    }
    
    setShowSettingsModal(true);
  };

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    // Hide the settings modal during generation
    setShowSettingsModal(false);
    
    try {
      // Check if we have the access token
      if (!accessToken) {
        throw new Error('You are not authenticated. Please log in first.');
      }

      const formData = new FormData();
      
      if (activeTab === 'file') {
        if (!file) {
          throw new Error('Please select a file first');
        }
        formData.append('file', file);
      } else {
        if (!textContent.trim()) {
          throw new Error('Please enter some text content first');
        }
        // Create a text file from the content
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        formData.append('file', textBlob, 'user_text.txt');
      }
      
      // Use numFlashcards instead of fixed value
      formData.append('num_flashcards', numFlashcards);
      formData.append('evaluator', 'both');  // Default value
      
      // Add the deck name from settings
      formData.append('deck_name', deckName);
      
      const response = await fetch('http://127.0.0.1:8000/api/flashcards/generate/', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate flashcards');
      }
      
      const data = await response.json();
      setFlashcardsData(data);
      setSuccess(true);
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError(err.message || 'An error occurred while generating flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTopic = async () => {
    if (!flashcardsData) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Check if we have the access token
      if (!accessToken) {
        throw new Error('You are not authenticated. Please log in first.');
      }

      const response = await fetch('http://127.0.0.1:8000/api/flashcards/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: flashcardsData.name,
          flashcards: flashcardsData.flashcards,
          entities: flashcardsData.entities,
          original_text: flashcardsData.original_text,
          store_id: flashcardsData.store_id
        }),
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save topic');
      }
      
      // Reset form after successful save
      setSuccess(true);
      setFile(null);
      setTextContent('');
      setFlashcardsData(null);
      
      // Navigate to deck manager page with the new deck
      const responseData = await response.json();
      if (responseData && responseData.id) {
        window.location.href = `/deck-manager?id=${responseData.id}&name=${encodeURIComponent(responseData.name)}`;
      } else {
        // Fallback to homepage if we don't have the ID
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error saving topic:', err);
      setError(err.message || 'An error occurred while saving the topic');
      setIsLoading(false);
    }
  };

  // New function to open chatbot with the current store_id
  const handleOpenChatbot = () => {
    if (!flashcardsData || !flashcardsData.store_id) return;
    
    // Navigate to chatbot page with store_id
    window.location.href = `/chatbot?store_id=${flashcardsData.store_id}&topic=${encodeURIComponent(flashcardsData.name)}`;
  };

  const renderFileUploadArea = () => (
    <div 
      className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center">
        <Upload className="h-12 w-12 text-green-500 mb-4" />
        
        {file ? (
          <div className="flex items-center bg-green-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-600 font-medium">{file.name}</span>
            <Check className="h-5 w-5 text-green-600 ml-2" />
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-2">Drag & drop a file here or click to select</p>
            <p className="text-gray-500 text-sm mb-4">Supported formats: PDF, DOCX, PPTX, TXT</p>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              onClick={() => fileInputRef.current.click()}
            >
              Browse files
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.txt"
            />
          </>
        )}
      </div>
    </div>
  );

  const renderTextInputArea = () => (
    <div className="border-2 border-dashed border-green-300 rounded-lg p-4">
      <textarea
        className="w-full h-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Enter your text here..."
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
      ></textarea>
    </div>
  );

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="bg-green-700 text-white p-3">
            <h2 className="text-lg font-medium">Flashcard settings</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Deck Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Number of flashcards</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={numFlashcards}
                onChange={(e) => setNumFlashcards(e.target.value)}
                placeholder="10"
                min="5"
                max="30"
              />
            </div>
            
            <div className="pt-2">
              <button
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md"
                onClick={handleGenerateFlashcards}
              >
                Generate flashcards
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlashcardPreview = () => {
    if (!flashcardsData) return null;
    
    return (
      <div className="mt-6 bg-white p-4 rounded-lg border border-green-200">
        <h3 className="text-lg font-medium text-green-700 mb-3">Generated Flashcards - {flashcardsData.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {flashcardsData.flashcards.slice(0, 4).map((card, index) => (
            <div key={index} className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="font-medium text-green-800">{card.vocabulary}</p>
              <p className="text-gray-600 mt-2">{card.description}</p>
            </div>
          ))}
        </div>
        
        {flashcardsData.flashcards.length > 4 && (
          <p className="text-gray-500 mt-3 text-center">
            + {flashcardsData.flashcards.length - 4} more flashcards
          </p>
        )}
        
        <div className="mt-6 flex justify-center space-x-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center"
            onClick={handleSaveTopic}
          >
            <Check className="h-5 w-5 mr-2" />
            Edit flashcard deck
          </button>
          
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
            onClick={handleOpenChatbot}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Chat with AI
          </button>
        </div>
      </div>
    );
  };

  // Loading overlay to show during flashcard generation
  const renderLoadingOverlay = () => {
    if (!isLoading) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <Loader className="animate-spin h-10 w-10 text-green-600 mb-4" />
          <p className="text-lg font-medium">Generating flashcards...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Show warning if not authenticated */}
      {!accessToken && (
        <div className="mb-4 bg-yellow-50 text-yellow-700 p-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>You need to be logged in to create flashcards. Please log in first.</span>
        </div>
      )}
      
      {/* Tab Selection */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'file' 
            ? 'text-green-600 border-b-2 border-green-600' 
            : 'text-gray-500 hover:text-green-500'}`}
          onClick={() => setActiveTab('file')}
        >
          File
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'text' 
            ? 'text-green-600 border-b-2 border-green-600' 
            : 'text-gray-500 hover:text-green-500'}`}
          onClick={() => setActiveTab('text')}
        >
          Text
        </button>
      </div>
      
      {/* Upload Area */}
      {activeTab === 'file' ? renderFileUploadArea() : renderTextInputArea()}
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && !flashcardsData && (
        <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <span>Topic saved successfully!</span>
        </div>
      )}
      
      {/* Generate Button */}
      <div className="mt-6">
        <button
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center
            ${isLoading || !accessToken
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'}`}
          onClick={openSettingsModal}
          disabled={isLoading || !accessToken || (activeTab === 'file' && !file) || (activeTab === 'text' && !textContent.trim())}
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            'Create flashcards'
          )}
        </button>
      </div>
      
      {/* Settings Modal */}
      {renderSettingsModal()}
      
      {/* Loading Overlay */}
      {renderLoadingOverlay()}
      
      {/* Flashcard Preview */}
      {renderFlashcardPreview()}
    </div>
  );
}
'use client';

import { useRef, useState } from 'react';
import { Mic } from 'lucide-react';

interface props {
  onComplete: (audioUrl: string) => void;
}

export default function MicRecorderButton({ onComplete }: props) {
  // const mediaRecorderRef = useRef(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm'});
        const audioURL = URL.createObjectURL(blob);
        console.log('Ghi âm xong! Audio URL:', audioURL);
        onComplete(audioURL);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Không thể truy cập micro:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onMouseDown={handleStartRecording}
      onMouseUp={handleStopRecording}
      onTouchStart={handleStartRecording}
      onTouchEnd={handleStopRecording}
      className={`p-4 rounded-full shadow-md transition ${
        isRecording ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
      } text-white focus:outline-none focus:ring-2 focus:ring-blue-300`}
    >
      <Mic className="w-6 h-6" />
    </button>
  );
}

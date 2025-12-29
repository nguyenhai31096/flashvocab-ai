import React, { useState, useEffect } from 'react';
import { VocabItem } from '../types';
import { explainWord } from '../services/geminiService';
import Button from './Button';

interface FlashcardProps {
  item: VocabItem;
  onTogglePin?: (id: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ item, onTogglePin }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Reset flip state when item changes
  useEffect(() => {
    setIsFlipped(false);
    setAiExplanation(null);
  }, [item]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAskAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiExplanation) return;
    
    setIsLoadingAi(true);
    const explanation = await explainWord(item.word);
    setAiExplanation(explanation);
    setIsLoadingAi(false);
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin(item.id);
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(item.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser.');
    }
  };

  return (
    <div className="w-full h-96 perspective-1000 cursor-pointer group" onClick={handleFlip}>
      <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Star Button - Visible on both sides via absolute positioning relative to the container faces */}
        {onTogglePin && (
          <button 
            onClick={handlePinClick}
            className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-colors duration-200 ${
              isFlipped ? 'opacity-0 pointer-events-none delay-200' : 'opacity-100 bg-white/50 hover:bg-white'
            }`}
            title={item.pinned ? "Unpin word" : "Pin word"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 ${item.pinned ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}

        {/* Front Side (English) */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl flex flex-col items-center justify-center p-8 border-2 border-indigo-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-4">English Word</span>
          <h2 className="text-5xl font-bold text-gray-800 break-words max-w-full">{item.word}</h2>
          <p className="mt-8 text-gray-400 text-sm">Click to flip</p>

          {/* Speaker Button (Front only) */}
          <button 
            onClick={handlePlayAudio}
            className="absolute bottom-4 right-4 p-3 rounded-full text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors z-20"
            title="Listen to pronunciation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        {/* Back Side (Vietnamese) */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl flex flex-col items-center justify-center p-8 overflow-y-auto">
          {/* Star Button Duplicate for Back Side */}
           {onTogglePin && (
            <button 
              onClick={handlePinClick}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              title={item.pinned ? "Unpin word" : "Pin word"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 ${item.pinned ? 'text-yellow-400 fill-current' : 'text-white/70'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}
          
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">Meaning</span>
          <h3 className="text-3xl font-bold mb-4">{item.meaning}</h3>
          
          {item.example && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg text-sm italic w-full">
              "{item.example}"
            </div>
          )}

          {aiExplanation && (
             <div className="mt-4 p-3 bg-white/20 rounded-lg text-xs text-left w-full max-h-32 overflow-y-auto whitespace-pre-wrap">
               <strong className="block mb-1 text-indigo-200">AI Explanation:</strong>
               {aiExplanation}
             </div>
          )}

          {!aiExplanation && (
             <Button 
                variant="ghost" 
                className="mt-6 text-white hover:bg-white/20 hover:text-white text-xs border border-white/30"
                onClick={handleAskAI}
                isLoading={isLoadingAi}
             >
               Ask AI to Explain
             </Button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Flashcard;
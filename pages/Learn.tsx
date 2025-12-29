import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import Flashcard from '../components/Flashcard';
import Button from '../components/Button';
import { AppActionType } from '../types';
import { Link } from 'react-router-dom';

const Learn: React.FC = () => {
  const { state, dispatch } = useStore();
  
  // Initialize currentIndex from localStorage if available
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const savedIndex = localStorage.getItem('learn_session_index');
      return savedIndex ? parseInt(savedIndex, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Validate index when vocabList changes or component mounts
  // This prevents index out of bounds errors if items are deleted or cleared
  useEffect(() => {
    if (state.vocabList.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= state.vocabList.length) {
      setCurrentIndex(Math.max(0, state.vocabList.length - 1));
    }
  }, [state.vocabList.length]);

  // Save learning session (current index) whenever it changes
  useEffect(() => {
    localStorage.setItem('learn_session_index', currentIndex.toString());
  }, [currentIndex]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % state.vocabList.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + state.vocabList.length) % state.vocabList.length);
  };

  const togglePin = (id: string) => {
    dispatch({ type: AppActionType.TOGGLE_PIN, payload: id });
  };

  const currentItem = state.vocabList[currentIndex];

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-gray-500 mb-4">No vocabulary found. Please go to Admin to add some words.</p>
        <Link to="/admin">
          <Button variant="secondary">Go to Admin</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Learn</h2>
        <span className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
          {currentIndex + 1} / {state.vocabList.length}
        </span>
      </div>

      <div className="mb-8">
        <Flashcard 
          item={currentItem} 
          onTogglePin={togglePin}
        />
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="secondary" onClick={prevCard} className="flex-1">
          <span className="mr-2">←</span> Previous
        </Button>
        <Button variant="primary" onClick={nextCard} className="flex-1">
          Next <span className="ml-2">→</span>
        </Button>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        Tip: Tap the card to flip. Click the star to pin to favorites.
      </div>
    </div>
  );
};

export default Learn;

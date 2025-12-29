import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import Flashcard from '../components/Flashcard';
import Button from '../components/Button';
import { AppActionType } from '../types';
import { Link } from 'react-router-dom';

const Pin: React.FC = () => {
  const { state, dispatch } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter only pinned items
  const pinnedList = state.vocabList.filter(item => item.pinned);

  // Adjust index if list shrinks (e.g., unpinning the last item)
  useEffect(() => {
    if (currentIndex >= pinnedList.length && pinnedList.length > 0) {
      setCurrentIndex(Math.max(0, pinnedList.length - 1));
    }
  }, [pinnedList.length, currentIndex]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % pinnedList.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + pinnedList.length) % pinnedList.length);
  };

  const togglePin = (id: string) => {
    dispatch({ type: AppActionType.TOGGLE_PIN, payload: id });
  };

  if (pinnedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className="bg-yellow-100 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Favorite Words</h3>
        <p className="text-gray-500 mb-6">Star words in the Learn section to review them here.</p>
        <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-800">
          Go to Learn →
        </Link>
      </div>
    );
  }

  const currentItem = pinnedList[currentIndex];

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="text-yellow-500 mr-2">★</span> Favorite Items
        </h2>
        <span className="text-sm font-medium text-gray-500 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          {currentIndex + 1} / {pinnedList.length}
        </span>
      </div>

      <div className="mb-8">
        <Flashcard 
          item={currentItem} 
          onTogglePin={togglePin}
        />
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="secondary" onClick={prevCard} className="flex-1" disabled={pinnedList.length <= 1}>
          <span className="mr-2">←</span> Previous
        </Button>
        <Button variant="primary" onClick={nextCard} className="flex-1" disabled={pinnedList.length <= 1}>
          Next <span className="ml-2">→</span>
        </Button>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        Reviewing your favorites
      </div>
    </div>
  );
};

export default Pin;
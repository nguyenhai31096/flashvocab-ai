import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, AppActionType, VocabItem } from '../types';
import { DEFAULT_VOCAB } from '../constants';

const initialState: AppState = {
  vocabList: DEFAULT_VOCAB,
};

// Load from local storage if available
const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem('vocab_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure vocabList exists
      if (!parsed.vocabList) {
        return initialState;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return initialState;
};

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case AppActionType.SET_VOCAB:
      return { ...state, vocabList: action.payload };
    case AppActionType.ADD_VOCAB:
      return { ...state, vocabList: [...state.vocabList, ...action.payload] };
    case AppActionType.RESET_DEFAULT:
      return { ...state, vocabList: DEFAULT_VOCAB };
    case AppActionType.CLEAR_ALL_VOCAB:
      return { ...state, vocabList: [] };
    case AppActionType.DELETE_VOCAB:
      return { 
        ...state, 
        vocabList: state.vocabList.filter(item => item.id !== action.payload) 
      };
    case AppActionType.EDIT_VOCAB:
      return {
        ...state,
        vocabList: state.vocabList.map(item => 
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        )
      };
    case AppActionType.TOGGLE_PIN:
      return {
        ...state,
        vocabList: state.vocabList.map(item => 
          item.id === action.payload ? { ...item, pinned: !item.pinned } : item
        )
      };
    default:
      return state;
  }
};

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, loadState());

  useEffect(() => {
    localStorage.setItem('vocab_app_state', JSON.stringify(state));
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
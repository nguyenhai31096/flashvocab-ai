export interface VocabItem {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  pinned?: boolean;
}

export interface AppState {
  vocabList: VocabItem[];
}

export enum AppActionType {
  SET_VOCAB = 'SET_VOCAB',
  ADD_VOCAB = 'ADD_VOCAB',
  RESET_DEFAULT = 'RESET_DEFAULT',
  CLEAR_ALL_VOCAB = 'CLEAR_ALL_VOCAB',
  DELETE_VOCAB = 'DELETE_VOCAB',
  EDIT_VOCAB = 'EDIT_VOCAB',
  TOGGLE_PIN = 'TOGGLE_PIN',
}

export interface AppAction {
  type: AppActionType;
  payload?: any;
}
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AppActionType, VocabItem } from '../types';
import Button from '../components/Button';
import { generateVocabFromTopic } from '../services/geminiService';

const Admin: React.FC = () => {
  const { state, dispatch } = useStore();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Data State
  const [jsonInput, setJsonInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);

  // --- Login Handler ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0000') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  // --- Import Handler ---
  const handleImport = () => {
    setError('');
    setSuccessMsg('');
    try {
      const parsed = JSON.parse(jsonInput);
      
      let newItems: VocabItem[] = [];

      // Handle simple Key-Value pair object: {"hello": "xin chào"}
      if (!Array.isArray(parsed) && typeof parsed === 'object') {
        newItems = Object.entries(parsed).map(([key, value]) => ({
          id: Math.random().toString(36).substr(2, 9),
          word: key,
          meaning: String(value),
        }));
      } 
      // Handle Array of objects
      else if (Array.isArray(parsed)) {
        newItems = parsed.map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          word: item.word,
          meaning: item.meaning,
          example: item.example
        }));
      } else {
        throw new Error("Invalid format. Use Object {'word': 'meaning'} or Array of Objects.");
      }

      if (newItems.length === 0) {
        throw new Error("No valid items found.");
      }

      dispatch({ type: AppActionType.ADD_VOCAB, payload: newItems });
      setSuccessMsg(`Successfully added ${newItems.length} words!`);
      setJsonInput('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  // --- AI Generation Handler ---
  const handleGenerate = async () => {
    if (!topicInput.trim()) return;
    setIsGenerating(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const newItems = await generateVocabFromTopic(topicInput);
      dispatch({ type: AppActionType.ADD_VOCAB, payload: newItems });
      setSuccessMsg(`AI generated ${newItems.length} words for "${topicInput}"!`);
      setTopicInput('');
    } catch (e: any) {
      setError("AI generation failed. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Reset/Delete Handlers ---
  const handleReset = () => {
    if (window.confirm("Bạn có chắc muốn KHÔI PHỤC MẶC ĐỊNH? Mọi từ vựng bạn đã thêm sẽ bị mất và quay về danh sách gốc.")) {
      dispatch({ type: AppActionType.RESET_DEFAULT });
      setSuccessMsg("Đã khôi phục dữ liệu gốc.");
      setError('');
    }
  };

  const handleClearAll = () => {
    if (state.vocabList.length === 0) {
        setError("Danh sách đã trống.");
        return;
    }
    if (window.confirm("CẢNH BÁO: Bạn có chắc muốn XÓA TẤT CẢ từ vựng không? Hành động này không thể hoàn tác.")) {
      dispatch({ type: AppActionType.CLEAR_ALL_VOCAB });
      setSuccessMsg("Đã xóa sạch toàn bộ từ vựng.");
      setError('');
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Xóa từ này?")) {
      dispatch({ type: AppActionType.DELETE_VOCAB, payload: id });
    }
  };

  // --- Edit Handlers ---
  const handleEditClick = (item: VocabItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      dispatch({ type: AppActionType.EDIT_VOCAB, payload: editingItem });
      setEditingItem(null);
      setSuccessMsg("Word updated successfully.");
    }
  };

  const handleAddNewManual = () => {
    setEditingItem({
        id: Math.random().toString(36).substr(2, 9),
        word: '',
        meaning: '',
        example: ''
    });
  }

  // --- Render Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-sm w-full border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passcode</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                maxLength={4}
                className="w-full text-center tracking-widest text-2xl p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                placeholder="0000"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Admin Dashboard ---
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        <button 
            onClick={handleAddNewManual} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
            + Add New Word
        </button>
      </div>

      {/* AI Generation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center">
          <span className="mr-2">✨</span> Generate with AI
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Enter a topic (e.g., "Medical", "Travel", "Job Interview") and Gemini will create a vocabulary deck for you.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter a topic..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!topicInput.trim()}>
            Generate
          </Button>
        </div>
      </div>

      {/* JSON Import Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Import JSON</h3>
        <p className="text-gray-500 text-sm mb-4">
          Paste a list of words in JSON format:
        </p>
        
        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-gray-900"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[
  {
    "word": "Project",
    "meaning": "Dự án",
    "example": "The project is on time."
  },
  {
    "word": "Agile",
    "meaning": "Linh hoạt"
  }
]`}
        />
        
        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={!jsonInput.trim()}>
            Import JSON
          </Button>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r">
          <strong>Error:</strong> {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border-l-4 border-green-500 rounded-r">
          {successMsg}
        </div>
      )}

      {/* Current List Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-4">
          <h3 className="font-semibold text-gray-700">Current Vocabulary ({state.vocabList.length})</h3>
          <div className="flex items-center gap-2">
            <Button 
                variant="secondary" 
                onClick={handleReset} 
                className="!text-xs !py-1.5 !px-3 border-gray-300"
                title="Khôi phục danh sách gốc"
            >
              Reset Defaults
            </Button>
            <Button 
                variant="danger" 
                onClick={handleClearAll} 
                className="!text-xs !py-1.5 !px-3"
                title="Xóa sạch danh sách"
            >
              Clear All
            </Button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {state.vocabList.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No vocabulary items.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase bg-gray-50">Word</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase bg-gray-50">Meaning</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase bg-gray-50 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.vocabList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.word}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.meaning}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="text-indigo-400 hover:text-indigo-600 transition-colors mr-3"
                        title="Edit word"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete word"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingItem.id && state.vocabList.find(i => i.id === editingItem.id) ? 'Edit Word' : 'Add New Word'}
            </h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Word</label>
                <input 
                  type="text" 
                  value={editingItem.word}
                  onChange={(e) => setEditingItem({ ...editingItem, word: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vietnamese Meaning</label>
                <input 
                  type="text" 
                  value={editingItem.meaning}
                  onChange={(e) => setEditingItem({ ...editingItem, meaning: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Example Sentence (Optional)</label>
                <textarea 
                  value={editingItem.example || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, example: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none bg-white text-gray-900"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button 
                    type="button"
                    variant="primary" 
                    className="flex-1"
                    onClick={() => {
                        // Check if it's an existing item update or a new item add
                        const exists = state.vocabList.find(i => i.id === editingItem.id);
                        if (exists) {
                            dispatch({ type: AppActionType.EDIT_VOCAB, payload: editingItem });
                            setSuccessMsg("Word updated successfully.");
                        } else {
                            dispatch({ type: AppActionType.ADD_VOCAB, payload: [editingItem] });
                            setSuccessMsg("New word added successfully.");
                        }
                        setEditingItem(null);
                    }}
                    disabled={!editingItem.word || !editingItem.meaning}
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
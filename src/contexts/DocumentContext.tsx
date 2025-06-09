'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Document, SearchResult } from '@/types';

interface DocumentState {
  documents: Document[];
  searchQuery: string;
  searchResults: SearchResult[];
  selectedFileType: string;
  sortBy: 'name' | 'date' | 'size';
  isSearching: boolean;
}

type DocumentAction =
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'CLEAR_ALL_DOCUMENTS' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_SELECTED_FILE_TYPE'; payload: string }
  | { type: 'SET_SORT_BY'; payload: 'name' | 'date' | 'size' }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'CLEAR_SEARCH'};


const initialState: DocumentState = {
  documents: [],
  searchQuery: '',
  searchResults: [],
  selectedFileType: 'all',
  sortBy: 'date',
  isSearching: false,
};

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        searchResults: state.searchResults.filter(result => result.document.id !== action.payload),
      };
    case 'CLEAR_ALL_DOCUMENTS':
      return {
        ...state,
        documents: [],
        searchQuery: '',
      };
    case 'CLEAR_SEARCH':
      return { ...state, searchQuery: '', searchResults: [] };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_SELECTED_FILE_TYPE':
      return { ...state, selectedFileType: action.payload };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.payload };
    default:
      return state;
  }
}

interface DocumentContextType {
  state: DocumentState;
  dispatch: React.Dispatch<DocumentAction>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Load documents from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('documents');
    if (stored) {
      try {
        const documents = JSON.parse(stored);
        dispatch({ type: 'SET_DOCUMENTS', payload: documents });
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    if (state.documents.length > 0) {
      localStorage.setItem('documents', JSON.stringify(state.documents));
    }
  }, [state.documents]);

  return (
    <DocumentContext.Provider value={{ state, dispatch }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
}

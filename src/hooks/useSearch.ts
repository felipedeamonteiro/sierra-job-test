import { useCallback } from 'react';
import { SearchResult } from '../types';
import { useDocumentContext } from '../contexts/DocumentContext';

export function useSearch() {
  const { state, dispatch } = useDocumentContext();

  const getSearchSnippets = (text: string, query: string): { snippet: string; page?: number }[] => {
    const snippets: { snippet: string; page?: number }[] = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let lastIndex = 0;
    
    // Estimate page breaks (assuming ~500 characters per page for rough estimation)
    const estimatedCharsPerPage = 500;

    while (true) {
      const index = lowerText.indexOf(lowerQuery, lastIndex);
      if (index === -1) break;

      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + query.length + 50);
      let snippet = text.substring(start, end);
      
      // Add ellipsis if needed
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      // Highlight the search term
      snippet = snippet.replace(new RegExp(query, 'gi'), `<mark class="bg-yellow-200 px-1 rounded">$&</mark>`);
      
      // Estimate page number
      const estimatedPage = Math.floor(index / estimatedCharsPerPage) + 1;
      
      snippets.push({ 
        snippet, 
        page: estimatedPage 
      });
      lastIndex = index + 1;
    }

    return snippets;
  };

  const performSearch = useCallback(async () => {
    if (!state.searchQuery.trim()) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      return;
    }

    dispatch({ type: 'SET_IS_SEARCHING', payload: true });
    
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 100));

    const query = state.searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    state.documents.forEach(doc => {
      if (state.selectedFileType !== 'all' && doc.type !== state.selectedFileType) {
        return;
      }

      const content = doc.content.toLowerCase();
      const matches = content.split(query).length - 1;
      
      if (matches > 0) {
        const snippets = getSearchSnippets(doc.content, state.searchQuery);
        results.push({
          document: doc,
          snippets,
          matchCount: matches
        });
      }
    });

    // Sort results by relevance (match count)
    results.sort((a, b) => b.matchCount - a.matchCount);
    
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    dispatch({ type: 'SET_IS_SEARCHING', payload: false });
  }, [state.searchQuery, state.documents, state.selectedFileType, dispatch]);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  const setSelectedFileType = useCallback((fileType: string) => {
    dispatch({ type: 'SET_SELECTED_FILE_TYPE', payload: fileType });
  }, [dispatch]);

  return {
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    selectedFileType: state.selectedFileType,
    isSearching: state.isSearching,
    performSearch,
    setSearchQuery,
    setSelectedFileType,
  };
}

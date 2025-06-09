import { useCallback, useMemo } from 'react';
import { useDocumentContext } from '../contexts/DocumentContext';

export function useDocumentManagement() {
  const { state, dispatch } = useDocumentContext();

  const deleteDocument = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: id });
  }, [dispatch]);

  const clearAllDocuments = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('documents');
    // Reset state
    dispatch({ type: 'CLEAR_ALL_DOCUMENTS' });
    // Show confirmation
    alert('All documents have been cleared!');
  }, [dispatch]);

  const setSortBy = useCallback((sort: 'name' | 'date' | 'size') => {
    dispatch({ type: 'SET_SORT_BY', payload: sort });
  }, [dispatch]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string): string => {
    switch (type) {
      case 'application/pdf': return '📄';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '📝';
      case 'text/plain': return '📃';
      default: return '📄';
    }
  };

  const sortedDocuments = useMemo(() => {
    return [...state.documents].sort((a, b) => {
      switch (state.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return b.size - a.size;
        case 'date': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        default: return 0;
      }
    });
  }, [state.documents, state.sortBy]);

  return {
    documents: state.documents,
    sortBy: state.sortBy,
    sortedDocuments,
    deleteDocument,
    clearAllDocuments,
    setSortBy,
    formatFileSize,
    getFileTypeIcon,
  };
}

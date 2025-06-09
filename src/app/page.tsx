'use client';

import { useState, useCallback, useEffect } from 'react';
import mammoth from 'mammoth/mammoth.browser';

import Header from '../components/Header';
import UploadArea from '../components/UploadArea';
import SearchSection from '../components/SearchSection';
import DocumentLibrary from '../components/DocumentLibrary';
import { Document, SearchResult, UploadProgress } from '../types';

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [isSearching, setIsSearching] = useState(false);

  // Load documents from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('documents');
    if (stored) {
      try {
        setDocuments(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('documents', JSON.stringify(documents));
    }
  }, [documents]);

  const extractTextFromFile = async (file: File): Promise<{ text: string; pageCount?: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          let text = '';
          let pageCount: number | undefined;

          if (file.type === 'application/pdf') {
            try {
              const pdfjsLib = await import('pdfjs-dist');
              
              // Use local worker file to avoid CDN issues
              pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';

              const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
              const pdf = await loadingTask.promise;
              pageCount = pdf.numPages;

              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: unknown) => (typeof item === 'object' && item !== null && 'str' in item ? (item as { str: string }).str : '')).join(' ') + '\n';
              }
            } catch (pdfError) {
              console.error('PDF processing failed:', pdfError);
              throw new Error('PDF processing failed. This may be due to a complex PDF format or network issues. Please try again or use a TXT/DOCX file instead.');
            }
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
          } else if (file.type === 'text/plain') {
            text = new TextDecoder().decode(arrayBuffer);
          } else {
            throw new Error(`Unsupported file type: ${file.type}`);
          }

          resolve({ text, pageCount });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    // Initialize progress tracking
    const initialProgress: UploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    setUploadProgress(initialProgress);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Validate file type
        if (!supportedTypes.includes(file.type)) {
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error', error: `Unsupported file type: ${file.type}` } : p
          ));
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error', error: 'File size exceeds 10MB limit' } : p
          ));
          continue;
        }

        // Update progress to processing
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, progress: 50, status: 'processing' } : p
        ));

        // Extract text content
        const { text, pageCount } = await extractTextFromFile(file);

        // Create document object
        const newDocument: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: text,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          pageCount
        };

        // Add to documents
        setDocuments(prev => [...prev, newDocument]);

        // Update progress to completed
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, progress: 100, status: 'completed' } : p
        ));

      } catch (error) {
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' } : p
        ));
      }
    }

    // Clear progress after 3 seconds
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 100));

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    documents.forEach(doc => {
      if (selectedFileType !== 'all' && doc.type !== selectedFileType) {
        return;
      }

      const content = doc.content.toLowerCase();
      const matches = content.split(query).length - 1;
      
      if (matches > 0) {
        const snippets = getSearchSnippets(doc.content, searchQuery);
        results.push({
          document: doc,
          snippets,
          matchCount: matches
        });
      }
    });

    // Sort results by relevance (match count)
    results.sort((a, b) => b.matchCount - a.matchCount);
    
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, documents, selectedFileType]);

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

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setSearchResults(prev => prev.filter(result => result.document.id !== id));
  };

  const clearAllDocuments = () => {
    // Clear localStorage
    localStorage.removeItem('documents');
    // Reset state
    setDocuments([]);
    setSearchResults([]);
    setSearchQuery('');
    // Show confirmation
    alert('All documents have been cleared!');
  };

  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Header />
        
        <UploadArea
          isDragOver={isDragOver}
          uploadProgress={uploadProgress}
          onFileUpload={handleFileUpload}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />

        <SearchSection
          searchQuery={searchQuery}
          searchResults={searchResults}
          selectedFileType={selectedFileType}
          isSearching={isSearching}
          onSearchQueryChange={setSearchQuery}
          onFileTypeChange={setSelectedFileType}
          onSearch={performSearch}
        />

        <DocumentLibrary
          documents={documents}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onDeleteDocument={deleteDocument}
          onClearAll={clearAllDocuments}
        />
      </div>
    </div>
  );
}

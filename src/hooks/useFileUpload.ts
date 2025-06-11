import { useState, useCallback } from 'react';
import { Document, UploadProgress } from '../types';
import { useDocumentContext } from '../contexts/DocumentContext';

export function useFileUpload() {
  const { dispatch } = useDocumentContext();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

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
            const mammoth = await import('mammoth/mammoth.browser');
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

  const processFiles = useCallback(async (files: FileList) => {
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
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          name: file.name,
          content: text,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          pageCount
        };

        // Add to documents via context
        dispatch({ type: 'ADD_DOCUMENT', payload: newDocument });

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
  }, [dispatch]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return {
    uploadProgress,
    isDragOver,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
}

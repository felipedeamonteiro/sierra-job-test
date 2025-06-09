export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadDate: string;
  pageCount?: number;
}

export interface SearchSnippet {
  snippet: string;
  page?: number;
}

export interface SearchResult {
  document: Document;
  snippets: SearchSnippet[];
  matchCount: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

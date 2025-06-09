'use client';

import Header from '../components/Header';
import UploadArea from '../components/UploadArea';
import SearchSection from '../components/SearchSection';
import DocumentLibrary from '../components/DocumentLibrary';
import { DocumentProvider } from '../contexts/DocumentContext';

export default function HomePage() {
  return (
    <DocumentProvider>
      <div className="min-h-screen bg-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Header />
          <UploadArea />
          <SearchSection />
          <DocumentLibrary />
        </div>
      </div>
    </DocumentProvider>
  );
}

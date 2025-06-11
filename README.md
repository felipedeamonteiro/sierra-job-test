# Sierra Studio Job Test - Document Search Hub

A modern, feature-rich document upload and search application built with Next.js, TypeScript, and Tailwind CSS.

## Live PoC website of this application

- Open [Document Search Hub](https://sierra-job-test-vdlu.vercel.app/) on your browser.

## Features

### 🚀 Enhanced User Experience
- **Drag & Drop Interface**: Intuitive file dropping with visual feedback
- **Progress Indicators**: Real-time upload progress and processing status
- **Responsive Design**: Works seamlessly across all devices
- **Loading States**: Clear feedback during file processing

### 📄 Advanced File Processing
- **Multiple File Support**: Batch upload and processing
- **File Type Support**: PDF, DOCX, and TXT files
- **File Validation**: Type and size validation (10MB limit)
- **Metadata Extraction**: File size, type, upload date, page count

### 🔍 Powerful Search Capabilities
- **Full-Text Search**: Advanced search with highlighting
- **Search Filters**: Filter by file type
- **Search Snippets**: Context-rich search results with highlighting
- **Real-time Search**: Instant search as you type
- **Match Count**: Shows number of matches per document

### 💾 Data Management
- **Persistent Storage**: Documents saved in localStorage
- **File Management**: Delete files with one click
- **Sorting Options**: Sort by name, date, or size
- **Document Library**: Visual grid layout with file previews

### 🛡️ Error Handling & Accessibility
- **Comprehensive Error Handling**: User-friendly error messages
- **File Size Limits**: Prevents oversized uploads
- **Type Validation**: Clear feedback for unsupported formats

## Requirements Analysis

### Why These Features Provide the Best Experience

1. **User-Centric Design**: The drag & drop interface reduces friction and makes file uploading intuitive
2. **Performance**: Optimized text extraction and instant search provide immediate results
3. **Reliability**: Proper error handling prevents user frustration and provides clear feedback
4. **Scalability**: Supports multiple files and handles large document collections efficiently
5. **Accessibility**: Clean, responsive design ensures usability across devices

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **PDF.js**: PDF text extraction
- **Mammoth.js**: DOCX text extraction
- **React Hooks**: Modern state management

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd take-home-challenge-sierra
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Uploading Files
1. **Drag & Drop**: Simply drag files onto the upload area
2. **Click to Upload**: Click the "Choose Files" button to select files
3. **Multiple Files**: Upload multiple files at once
4. **Progress Tracking**: Watch real-time upload and processing progress

### Searching Documents
1. **Enter Search Terms**: Type in the search box
2. **Filter by Type**: Use the dropdown to filter by file type
3. **View Results**: See highlighted snippets with match counts
4. **Navigate Results**: Click through search results with context

### Managing Documents
1. **View Library**: Browse all uploaded documents in the library
2. **Sort Documents**: Sort by name, date, or size
3. **Delete Files**: Click the trash icon to remove documents
4. **View Metadata**: See file size, upload date, and page count

## Supported File Types

- **PDF** (.pdf): Extracts text from all pages
- **DOCX** (.docx): Extracts formatted text content
- **TXT** (.txt): Plain text files

## File Size Limits

- Maximum file size: 10MB per file
- No limit on number of files
- Batch processing supported

## Performance Considerations

- Text extraction is performed client-side
- Documents stored in localStorage (browser storage limits apply)
- Search is performed in-memory for instant results
- Optimized for files up to 10MB

## License

This project is licensed under the MIT License.

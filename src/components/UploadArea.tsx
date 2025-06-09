import { useRef } from 'react';
import { UploadProgress } from '../types';

interface UploadAreaProps {
  isDragOver: boolean;
  uploadProgress: UploadProgress[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
}

export default function UploadArea({
  isDragOver,
  uploadProgress,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragLeave,
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl text-gray-300 font-semibold mb-2">Drop files here or click to upload</h3>
        <p className="text-gray-400 mb-4">Supports PDF, DOCX, and TXT files (max 10MB each)</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-6 py-2 font-bold rounded-lg hover:cursor-pointer hover:bg-blue-800 transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={onFileUpload}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{progress.fileName}</span>
                <span className={`text-sm ${
                  progress.status === 'error' ? 'text-red-600' : 
                  progress.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {progress.status === 'error' ? 'Error' :
                   progress.status === 'completed' ? 'Completed' :
                   progress.status === 'processing' ? 'Processing...' : 'Uploading...'}
                </span>
              </div>
              {progress.status !== 'error' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              )}
              {progress.error && (
                <p className="text-red-600 text-sm mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

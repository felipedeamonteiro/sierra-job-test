import { useDocumentManagement } from '../hooks/useDocumentManagement';

export default function DocumentLibrary() {
  const {
    documents,
    sortBy,
    sortedDocuments,
    deleteDocument,
    clearAllDocuments,
    setSortBy,
    formatFileSize,
    getFileTypeIcon,
  } = useDocumentManagement();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Document Library ({documents.length})</h2>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
            className="px-3 py-1 border text-gray-700 border-gray-300 hover:cursor-pointer rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          {documents.length > 0 && (
            <button
              onClick={clearAllDocuments}
              className="px-4 py-2 bg-red-600 text-white font-bold hover:cursor-pointer text-sm rounded-lg hover:bg-red-800 transition-colors"
              title="Clear all documents and localStorage"
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📚</div>
          <p>No documents uploaded yet. Start by uploading some files!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDocuments.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-2xl flex-shrink-0">{getFileTypeIcon(doc.type)}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-700 break-words line-clamp-2" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-red-500 hover:cursor-pointer hover:text-red-700 text-sm flex-shrink-0 ml-2"
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                {doc.pageCount && <p>Pages: {doc.pageCount}</p>}
                <p>Characters: {doc.content.length.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

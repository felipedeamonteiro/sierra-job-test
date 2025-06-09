import {useDocumentContext} from '@/contexts/DocumentContext';
import { useSearch } from '../hooks/useSearch';

export default function SearchSection() {
  const {
    searchQuery,
    searchResults,
    selectedFileType,
    isSearching,
    performSearch,
    setSearchQuery,
    setSelectedFileType,
  } = useSearch();
  const { dispatch } = useDocumentContext();

  const getFileTypeIcon = (type: string): string => {
    switch (type) {
      case 'application/pdf': return '📄';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '📝';
      case 'text/plain': return '📃';
      default: return '📄';
    }
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
    setSelectedFileType('all');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search through your documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleClear}
          disabled={searchResults.length === 0 || isSearching}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:cursor-pointer font-bold hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Clear Search
        </button>
        <select
          value={selectedFileType}
          onChange={(e) => setSelectedFileType(e.target.value)}
          className="px-4 py-2 border hover:cursor-pointer border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="application/pdf">PDF</option>
          <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
          <option value="text/plain">TXT</option>
        </select>
        <button
          onClick={performSearch}
          disabled={isSearching}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:cursor-pointer font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 sticky top-0 bg-white py-2">
            Search Results ({searchResults.length} documents)
          </h3>
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                title={`View all matches in ${result.document.name}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getFileTypeIcon(result.document.type)}</span>
                    <h4 className="font-semibold text-gray-700 break-words">{result.document.name}</h4>
                    <span className="text-sm text-gray-500 flex-shrink-0">({result.matchCount} matches)</span>
                  </div>
                </div>
                
                {/* Scrollable matches container */}
                <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                  {result.snippets.map((snippetObj, snippetIndex) => (
                    <div 
                      key={snippetIndex} 
                      className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border-l-4 border-blue-200"
                    >
                      <div 
                        className="mb-2"
                        dangerouslySetInnerHTML={{ __html: snippetObj.snippet }}
                      />
                      {snippetObj.page && (
                        <div className="text-xs text-gray-500 text-right font-medium">
                          Page {snippetObj.page}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-8 text-gray-500">
          No results found for &ldquo;{searchQuery}&rdquo;
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { FaEdit, FaDownload, FaTrash, FaSearch, FaTrashAlt } from 'react-icons/fa';

interface Note {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
}

interface NoteLibraryProps {
  notes: Note[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onDeleteAll: () => void;
  isDarkMode: boolean;
}

const NoteLibrary: React.FC<NoteLibraryProps> = ({
  notes,
  loading,
  onEdit,
  onDelete,
  onDownload,
  onDeleteAll,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    console.log('Notes received:', notes.length);
    console.log('Note titles:', notes.map(note => note.title).join(', '));
  }, [notes]);

  useEffect(() => {
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className={isDarkMode ? 'text-[#f9f6e5]/60' : 'text-gray-500'}>
          Loading your Frames...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Your Frames
          <span className={`ml-2 text-sm font-normal ${
            isDarkMode ? 'text-[#f9f6e5]/40' : 'text-gray-500'
          }`}>
            {notes.length > 0 ? `(${notes.length})` : ''}
          </span>
        </h2>
        {notes.length > 0 && (
          <button
            onClick={onDeleteAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
              isDarkMode 
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' 
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            <FaTrashAlt />
            Delete All
          </button>
        )}
      </div>

      {notes.length > 0 && (
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDarkMode ? 'text-[#f9f6e5]/40' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-300 outline-none ${
              isDarkMode 
                ? 'bg-white/5 border border-white/10 text-[#f9f6e5] focus:border-blue-500/50 focus:ring focus:ring-blue-500/20' 
                : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-500/20'
            }`}
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="text-6xl opacity-20">📝</div>
          <p className={isDarkMode ? 'text-[#f9f6e5]/60' : 'text-gray-500'}>
            No notes yet. Start creating!
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="text-6xl opacity-20">🔍</div>
          <p className={isDarkMode ? 'text-[#f9f6e5]/60' : 'text-gray-500'}>
            No notes match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group relative rounded-xl overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.01] ${
                isDarkMode 
                  ? 'bg-[#111]/80 hover:bg-[#222]/80' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="aspect-video w-full relative">
                {note.thumbnail ? (
                  <img
                    src={note.thumbnail}
                    alt={note.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'placeholder.png';
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ease-in-out ${
                    isDarkMode ? 'bg-black/50' : 'bg-gray-100'
                  }`}>
                    <span className="text-4xl opacity-20">📝</span>
                  </div>
                )}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out ${
                  isDarkMode 
                    ? 'bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm'
                    : 'bg-gradient-to-t from-black/60 via-black/30 to-transparent'
                }`}>
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-end gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                    <button
                      onClick={() => onEdit(note.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300'
                          : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600'
                      }`}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDownload(note.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-green-500/10 hover:bg-green-500/20 text-green-300'
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-600'
                      }`}
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => onDelete(note.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300'
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-600'
                      }`}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className={`text-lg font-medium mb-1 transition-colors duration-300 ease-in-out ${
                  isDarkMode ? 'text-[#f9f6e5]' : 'text-gray-900'
                }`} style={{ fontFamily: 'Geist, sans-serif' }}>
                  {note.title}
                </h3>
                <p className={`transition-colors duration-300 ease-in-out ${isDarkMode ? 'text-[#f9f6e5]/40' : 'text-gray-500'}`}>
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteLibrary; 
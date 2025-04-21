import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import CanvasEditor from './components/CanvasEditor';
import NoteLibrary from './components/NoteLibrary';
import AuthWrapper from './components/AuthWrapper';
import LandingPage from './components/LandingPage';
import { Note, Font } from './types';
import { 
  supabase,
  getNotes,
  saveNote,
  updateNote,
  deleteNoteById,
  deleteAllNotes,
  uploadImage,
  deleteImage,
  dataURLtoBlob,
  signInWithGoogle,
  signOut
} from './supabase';
import logo from './logo.svg';
import { FaTrash } from 'react-icons/fa';
import { User } from '@supabase/supabase-js';
import './styles/fonts.css';  // Import the font styles

// Helper function to get image URL from path
const getImageUrl = (path: string): string => {
  const { data } = supabase.storage.from('writing-frames').getPublicUrl(path);
  return data.publicUrl;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme === 'dark' || (!savedTheme && prefersDark);
    }
    return false;
  });
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savingCanvas, setSavingCanvas] = useState<fabric.Canvas | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [frameSize, setFrameSize] = useState<{name: string, width: number, height: number, category: string}>({
    name: 'Custom',
    width: 800,
    height: 600,
    category: 'Custom'
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Extract loadNotes function to use it elsewhere in the component
  const loadNotes = async () => {
    if (user) {
      setIsLoading(true);
      console.log("Starting to load notes for user:", user.id);
      try {
        // Get notes from Supabase instead of Firestore
        const userNotes = await getNotes(user.id);
        
        if (userNotes.length === 0) {
          console.log("No notes found for user");
          setNotes([]);
        } else {
          // Process notes
          const processedNotes = userNotes.map((note: any) => {
            // Check if thumbnail exists and is valid
            if (!note.thumbnail || note.thumbnail === "") {
              console.log("Missing thumbnail for note:", note.id);
              // Try to regenerate thumbnail URL from path if available
              if (note.thumbnailPath) {
                console.log("Regenerating thumbnail URL from path:", note.thumbnailPath);
                note.thumbnail = getImageUrl(note.thumbnailPath);
              }
            }
            
            // Process dates if needed
            return {
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            };
          });
          
          console.log("Processed notes:", processedNotes.length);
          setNotes(processedNotes);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("No user, clearing notes");
      setNotes([]);
    }
  };

  // Check for current session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkSession();
  }, []);

  // Listen for auth state changes using Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        console.log("User signed in:", session.user.email);
      } else {
        console.log("User signed out");
      }
    });

    return () => {
      subscription.unsubscribe(); // Clean up the listener on unmount
    };
  }, []);

  useEffect(() => {
    // Load Google Fonts
    const loadFonts = async () => {
      try {
        const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAm1fQ7YNAnO8yeQCSGZC0A7_7aCLNOxJk');
        const data = await response.json();
        setFonts(data.items);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    // Load user's notes when authenticated
    loadNotes();
    
    // If we have a canvas waiting to be saved and the user just logged in, show the save dialog
    if (user && savingCanvas && !showSaveDialog) {
      console.log('User authenticated and canvas waiting to be saved, showing save dialog...');
      setShowSaveDialog(true);
    }
  }, [user]);

  const handleSignIn = async () => {
    setIsLoading(true);
    console.log("Starting sign in process");
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Error signing in:', error);
      setAuthError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setNotes([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  const handleSave = async (canvas: fabric.Canvas) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not authenticated, show a message and trigger login flow
        console.log('User not authenticated, initiating sign in...');
        
        // Store canvas for saving after auth completes
        setSavingCanvas(canvas);
        
        // Show a temporary alert that we're redirecting to login
        alert("You need to sign in to save your frame. You'll be redirected to the Google login page.");
        
        // Trigger the sign-in process
        await signInWithGoogle();
        
        // The auth state change listener will handle setting the user after successful login
        // We'll show the save dialog after authentication in the useEffect that monitors user changes
        return;
      }
      
      // User is already authenticated, proceed with save
      console.log('User authenticated, proceeding with save...');
      setSavingCanvas(canvas);
      setShowSaveDialog(true);
    } catch (error: any) {
      console.error('Error in save process:', error);
      alert("There was a problem saving your frame. Please try again.");
    }
  };

  const completeSave = async (title: string, canvas: fabric.Canvas) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!title.trim()) {
        alert("Please enter a title for your frame.");
        setIsLoading(false);
        return;
      }
      
      if (!user || !canvas) {
        throw new Error('User not logged in or canvas not available');
      }

      const json = canvas.toJSON(['id', 'selectable']);
      const dataURL = canvas.toDataURL({ format: 'png' });
      const blob = dataURLtoBlob(dataURL);
      
      console.log('Preparing to save note with user ID:', user.id);
      
      try {
      // For new notes
      if (!editingNote) {
        // Generate a unique path for the image
        const imagePath = `${user.id}/${Date.now()}.png`;
        console.log('Generated image path:', imagePath);
        
        // Upload image to Supabase Storage
        const imageUrl = await uploadImage(blob, imagePath);
        console.log('Image uploaded, received URL:', imageUrl);
        
        if (!imageUrl) {
          throw new Error('Failed to upload image to Supabase');
        }
        
        const newNote: Omit<Note, 'id'> = {
          title,
          content: '',
            thumbnail: imageUrl,
            thumbnailPath: imagePath,
            userid: user.id,
            canvasState: json as any,
          frameSize: {
            name: frameSize.name,
            width: frameSize.width,
            height: frameSize.height,
            category: 'custom'
          }
        };
        
        console.log('Saving new note to Supabase:', title);
        const savedNote = await saveNote(newNote);
          
          if (!savedNote) {
            throw new Error('Failed to save note to database');
          }
          
          console.log('Note saved with ID:', savedNote.id);
          alert(`Your frame "${title}" has been saved successfully and is now available in the "Your Frames" section.`);
      } 
      // For editing existing notes
      else {
        // If we already have a path, use it, otherwise generate a new one
        const imagePath = editingNote.thumbnailPath || `${user.id}/${Date.now()}.png`;
        console.log('Updating note with path:', imagePath);
        
        // Upload image to Supabase Storage
        const imageUrl = await uploadImage(blob, imagePath);
        console.log('Image updated, received URL:', imageUrl);
        
        if (!imageUrl) {
          throw new Error('Failed to upload image to Supabase');
        }
        
        const updatedNote = {
          title,
          thumbnail: imageUrl, 
          thumbnailPath: imagePath,
          updatedAt: new Date(),
          canvasState: json as any, // Use the canvas state object directly
          frameSize: {
            name: frameSize.name,
            width: frameSize.width,
            height: frameSize.height,
            category: 'custom'
          }
        };
        
        await updateNote(editingNote.id, updatedNote);
        console.log('Note updated successfully');
          alert(`Your frame "${title}" has been updated successfully.`);
      }

      // Reset the editing state
      setEditingNote(null);
      setNoteTitle('');
      setShowSaveDialog(false);
      setSavingCanvas(null);
      
      // Refresh the notes list
      await loadNotes();
      console.log('Notes list refreshed');
      } catch (uploadError: any) {
        console.error("Error during upload/save:", uploadError);
        throw new Error(`Failed to save: ${uploadError?.message || 'Unknown error during upload/save'}`);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save your frame. Please try again: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      setIsLoading(true);
      // Get the note to find its image path
      const noteToDelete = notes.find(note => note.id === noteId);
      if (noteToDelete && noteToDelete.thumbnailPath) {
        // Delete the image from Supabase Storage
        await deleteImage(noteToDelete.thumbnailPath);
      }
      
      // Delete the note from Supabase
      await deleteNoteById(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      // Delete all images from Supabase Storage
      for (const note of notes) {
        if (note.thumbnailPath) {
          await deleteImage(note.thumbnailPath);
        }
      }
      
      // Delete all notes from Supabase
      await deleteAllNotes(user.id);
      setNotes([]);
    } catch (error) {
      console.error('Error deleting all notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (note: Note) => {
    try {
      // Create a temporary canvas element
      const canvas = new fabric.Canvas(null, {
        width: note.canvasState.width || 800,
        height: note.canvasState.height || 600,
        backgroundColor: note.canvasState.background
      });
      
      // Handle canvasState if it's a string
      let canvasState = note.canvasState;
      if (typeof canvasState === 'string') {
        try {
          canvasState = JSON.parse(canvasState);
        } catch (e) {
          console.error('Error parsing canvasState:', e);
        }
      }
      
      // Load the objects from the note
      if (canvasState && canvasState.objects) {
        canvasState.objects.forEach((obj: any) => {
          if (obj.type === 'textbox') {
            const text = new fabric.Textbox(obj.text, {
              left: obj.left,
              top: obj.top,
              width: obj.width,
              fontSize: obj.fontSize,
              fontFamily: obj.fontFamily,
              fill: obj.fill,
              fontWeight: obj.fontWeight,
              fontStyle: obj.fontStyle,
              underline: obj.underline,
              textAlign: obj.textAlign
            });
            canvas.add(text);
          }
        });
      }
      
      // Generate and download the image
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      const link = document.createElement('a');
      link.download = `${note.title}.png`;
      link.href = dataURL;
      link.click();
      
      // Dispose of the temporary canvas
      canvas.dispose();
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    console.log("Editing note:", note.id);
    setEditingNote(note);
    
    if (canvas) {
      try {
        // Clear the current canvas
        canvas.clear();
        
        // Parse canvasState if it's a string
        let canvasState = note.canvasState;
        if (typeof canvasState === 'string') {
          try {
            canvasState = JSON.parse(canvasState);
            console.log("Parsed canvasState from string");
          } catch (error) {
            console.error("Error parsing canvasState:", error);
            return;
          }
        }
        
        // Set canvas size and background from note
        canvas.setWidth(canvasState.width || 800);
        canvas.setHeight(canvasState.height || 600);
        canvas.setBackgroundColor(canvasState.background || "#ffffff", canvas.renderAll.bind(canvas));
        
        console.log("Canvas size set to:", canvasState.width, "x", canvasState.height);
        console.log("Loading", canvasState.objects?.length || 0, "objects into canvas");
        
        // Load objects from the saved state
        if (canvasState.objects && Array.isArray(canvasState.objects)) {
          canvasState.objects.forEach((obj: any) => {
            if (obj.type === 'textbox') {
              const text = new fabric.Textbox(obj.text || '', {
                left: obj.left || 0,
                top: obj.top || 0,
                width: obj.width || 200,
                fontSize: obj.fontSize || 16,
                fontFamily: obj.fontFamily || 'Arial',
                fill: obj.fill || '#000000',
                fontWeight: obj.fontWeight || 'normal',
                fontStyle: obj.fontStyle || 'normal',
                underline: obj.underline || false,
                textAlign: obj.textAlign || 'left'
              });
              canvas.add(text);
            }
          });
        } else {
          console.warn("No objects found in canvas state or invalid objects array");
        }
        
        // Update frame size
        if (note.frameSize) {
          const frameSize = {
            name: note.frameSize.name || 'Custom',
            width: note.frameSize.width || 800,
            height: note.frameSize.height || 600,
            category: note.frameSize.category || 'Custom'
          };
          setFrameSize(frameSize);
        }
        
        canvas.renderAll();
        console.log("Note loaded into canvas");
        
        // Set the note title for when saving
        setNoteTitle(note.title || 'Untitled Note');
      } catch (error) {
        console.error("Error loading note into canvas:", error);
        alert("Error loading note for editing. Please try again.");
      }
    } else {
      console.error("Canvas not available for editing");
      alert("Canvas not ready. Please try again in a moment.");
    }
  };

  // Function to handle theme toggle with animation trigger
  const handleThemeToggle = () => {
    setThemeTransitioning(true);
    setIsDarkMode((prev) => !prev);
    
    // Reset the transition trigger after animations complete
    setTimeout(() => {
      setThemeTransitioning(false);
    }, 1000);
  };

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      
      // Add or remove the 'dark' class to the document
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ease-in-out ${
      isDarkMode ? 'bg-black text-[#f9f6e5]' : 'bg-white text-gray-900'
    }`}>
      {/* Animated background gradient */}
      <div className={`fixed inset-0 pointer-events-none transition-all duration-500 ease-in-out ${
        isDarkMode 
          ? 'bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-black opacity-80' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-white opacity-100'
      }`} />
      
      {/* Floating blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[10%] left-[15%] w-32 h-32 rounded-full blur-xl transition-all duration-500 ease-in-out ${
          isDarkMode ? 'bg-purple-500/5 scale-110' : 'bg-purple-200/40 scale-100'
        }`} />
        <div className={`absolute top-[40%] right-[10%] w-40 h-40 rounded-full blur-xl transition-all duration-500 ease-in-out ${
          isDarkMode ? 'bg-blue-500/5 scale-110' : 'bg-blue-200/40 scale-100'
        }`} />
        <div className={`absolute bottom-[20%] left-[20%] w-36 h-36 rounded-full blur-xl transition-all duration-500 ease-in-out ${
          isDarkMode ? 'bg-pink-500/5 scale-110' : 'bg-pink-200/40 scale-100'
        }`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <header className={`p-6 border-b transition-colors duration-300 ease-in-out ${
          isDarkMode ? 'border-white/5' : 'border-gray-200'
        }`}>
          <div className="container mx-auto flex justify-between items-center h-10">
          <h1
           className="text-2xl font-semibold tracking-tight leading-none pt-[25px]"
           style={{ fontFamily: 'Geist, sans-serif' }}
             >
           Noteee Frames
         </h1>
            <div className="flex items-center gap-6">
              <button
                onClick={handleThemeToggle}
                className={`p-2 hover:scale-105 transition-all duration-300 ease-in-out rounded-full ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl block transform transition-all duration-500 ease-in-out" 
                  style={{ transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  {isDarkMode ? '☀️' : '🌙'}
                </span>
              </button>
              {user && (
                <div className="flex items-center gap-4">
                  <span className={isDarkMode ? 'text-[#f9f6e5]/80' : 'text-gray-600'}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className={`px-5 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' 
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              )}
              {!user && (
                <button
                  onClick={handleSignIn}
                  className={`px-5 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300' 
                      : 'bg-green-50 hover:bg-green-100 text-green-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto p-6 md:p-10">
          {authError && (
            <div className={`mb-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'
            }`}>
              Authentication Error: {authError}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Geist, sans-serif' }}>
                Create New Frame
              </h2>
              <div className={`rounded-xl p-4 transition-colors duration-300 ease-in-out ${
                isDarkMode ? 'bg-[#111]/80 backdrop-blur-sm' : 'bg-gray-50' 
              }`}>
                <CanvasEditor onSave={handleSave} fonts={fonts} isDarkMode={isDarkMode} />
              </div>
            </div>
            <div>
              <NoteLibrary
                notes={notes.map(note => ({
                  id: note.id,
                  title: note.title || 'Untitled Note',
                  thumbnail: note.thumbnail || '',
                  createdAt: String(note.created_at || '')
                }))}
                loading={isLoading}
                onEdit={(noteId) => {
                  const noteToEdit = notes.find(n => n.id === noteId);
                  if (noteToEdit) handleEdit(noteToEdit);
                }}
                onDelete={handleDelete}
                onDownload={(noteId) => {
                  const noteToDownload = notes.find(n => n.id === noteId);
                  if (noteToDownload) handleDownload(noteToDownload);
                }}
                onDeleteAll={handleDeleteAll}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </main>

        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`p-8 rounded-xl shadow-2xl max-w-md w-full transition-all duration-300 ease-in-out ${
              isDarkMode 
                ? 'bg-black border border-white/5 shadow-2xl shadow-purple-500/5' 
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Geist, sans-serif' }}>
                Save Your Note
              </h2>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-[#f9f6e5]/60' : 'text-gray-600'
                }`} htmlFor="note-title">
                  Title
                </label>
                <input
                  id="note-title"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter a title for your note"
                  className={`w-full p-3 rounded-lg transition-all duration-300 outline-none ${
                    isDarkMode 
                      ? 'bg-white/5 border border-white/10 text-[#f9f6e5] focus:border-green-500/50 focus:ring focus:ring-green-500/20' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-green-500 focus:ring focus:ring-green-500/20'
                  }`}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSavingCanvas(null);
                  }}
                  className={`px-5 py-2 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'border border-white/10 text-[#f9f6e5] hover:bg-white/5' 
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (savingCanvas) {
                      completeSave(noteTitle, savingCanvas);
                    }
                  }}
                  className={`px-5 py-2 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300' 
                      : 'bg-green-50 hover:bg-green-100 text-green-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

import { createClient, User } from '@supabase/supabase-js';
import { Note } from './types';

// Use environment variables if available, otherwise fallback to hardcoded values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://difuqmmmvrzieksvhpwh.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZnVxbW1tdnJ6aWVrc3ZocHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDE0MTksImV4cCI6MjA2MDQ3NzQxOX0.oE6IpUh3lmWy_jVRukxf76ZuilCzy8tHFlIx0IGT21s';

// Initialize the Supabase client with explicit options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  },
  db: {
    schema: 'public'
  }
});

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    // Get the current URL's origin
    const origin = window.location.origin;
    console.log('Current origin:', origin);
    
    // Construct the callback URL
    const redirectUrl = `${origin}/auth/callback`;
    console.log('Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account', // Forces Google to show the account selector
          access_type: 'offline',   // Request a refresh token
        }
      },
    });
    
    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

export const listenToAuthChanges = (callback: (user: User | null) => void) => {
  try {
    // Initially get current session
    supabase.auth.getSession().then(({ data }) => {
      callback(data.session?.user || null);
    });

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        callback(session?.user || null);
      }
    );

    // Return unsubscribe function
    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  } catch (error) {
    console.error('Error in listenToAuthChanges:', error);
    // Return a no-op unsubscribe in case of error
    return () => {};
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Database functions to replace Firebase
export const getNotes = async (userid: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('userid', userid)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
};

export const saveNote = async (note: any) => {
  try {
    // Get current user to ensure proper authentication
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error('User must be authenticated to save notes');
    }

    console.log('Saving note:', note.title);
    // Map the fields to match exact database column names and types
    const noteData = {
      title: note.title || 'Untitled',
      content: note.content || '',
      thumbnail: note.thumbnail || null,
      thumbnailPath: note.thumbnailPath || null,
      userid: user.id,
      canvasState: note.canvasState || null,
      frameSize: note.frameSize || null
      // Let Supabase handle the timestamps
    };
    
    console.log('Saving note data:', noteData);
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select();
    
    if (error) {
      console.error('Error saving note:', error);
      throw new Error(`Failed to save: ${error.message}`);
    }
    
    if (!data?.[0]) {
      throw new Error('Note saved but no data returned');
    }
    
    console.log('Note saved with ID:', data[0].id);
    return data[0];
  } catch (error) {
    console.error('Error in saveNote:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save note');
  }
};

export const updateNote = async (id: string, updates: any) => {
  try {
    console.log('Updating note:', id);
    // Map the fields to match exact database column names and types
    const updateData = {
      title: updates.title,
      content: updates.content || '',
      thumbnail: updates.thumbnail,
      thumbnailPath: updates.thumbnailPath,
      canvasState: updates.canvasState,
      frameSize: updates.frameSize
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
    
    console.log('Note updated successfully');
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in updateNote:', error);
    throw error;
  }
};

export const deleteNoteById = async (id: string) => {
  try {
    console.log('Deleting note:', id);
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
    
    console.log('Note deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteNote:', error);
    return false;
  }
};

export const deleteAllNotes = async (userid: string) => {
  try {
    console.log('Deleting all notes for user:', userid);
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('userid', userid);
    
    if (error) {
      console.error('Error deleting all notes:', error);
      throw error;
    }
    
    console.log('All notes deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteAllNotes:', error);
    return false;
  }
};

// Function to upload an image to Supabase storage
export const uploadImage = async (imageFile: File | Blob, path: string): Promise<string | null> => {
  try {
    console.log('Starting upload to Supabase path:', path);

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    // Check if the file is valid
    if (!imageFile) {
      throw new Error('No file provided for upload');
    }

    // Sanitize the path - remove any colons and other special characters
    const sanitizedPath = path.replace(/[^a-zA-Z0-9-_/.]/g, '_');
    console.log('Sanitized path:', sanitizedPath);

    // Get session to verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      throw new Error('No valid session found');
    }

    console.log('Authenticated as:', session.user.id);
    console.log('File size:', imageFile.size, 'bytes');
    console.log('File type:', imageFile.type);

    // Check if the file is too large (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (imageFile.size > MAX_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Ensure we have a valid content type
    const contentType = imageFile.type || 'image/png';
    if (!contentType.startsWith('image/')) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    // Perform the upload with explicit headers and content type
    const { data, error } = await supabase.storage
      .from('writing-frames')
      .upload(sanitizedPath, imageFile, {
        upsert: true,
        contentType: contentType,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        cause: error.cause
      });
      // Throw a more descriptive error
      throw new Error(`Storage error: ${error.message}`);
    }

    if (!data?.path) {
      throw new Error('Upload successful but no path returned');
    }

    console.log('Image uploaded successfully:', data);

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('writing-frames')
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    console.log('Generated public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    // Ensure we always throw an Error object with a descriptive message
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    // If it's not an Error object, convert it to a string
    throw new Error(`Upload failed: ${String(error)}`);
  }
};

// Function to get a data URL from Supabase storage
export const getImageUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('writing-frames')
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Function to delete an image from Supabase storage
export const deleteImage = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('writing-frames')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
};

// Function to convert a data URL to a Blob
export const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}; 
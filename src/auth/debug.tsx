import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthDebug = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        addLog('Checking auth state...');
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          addLog(`Session error: ${sessionError.message}`);
          setError(sessionError.message);
        } else {
          addLog(`Session data: ${sessionData.session ? 'Active session' : 'No active session'}`);
          setSession(sessionData.session);
        }
        
        // Get user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          addLog(`User data error: ${userError.message}`);
          setError(userError.message);
        } else {
          addLog(`User data: ${userData.user ? 'User found' : 'No user'}`);
          setUser(userData.user);
        }
      } catch (err: any) {
        addLog(`Unexpected error: ${err.message}`);
        setError(err.message);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event}`);
      setSession(session);
      if (session) {
        setUser(session.user);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleSignIn = async () => {
    try {
      addLog('Initiating sign in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        addLog(`Sign in error: ${error.message}`);
        setError(error.message);
      } else {
        addLog('Sign in initiated successfully');
      }
    } catch (err: any) {
      addLog(`Sign in exception: ${err.message}`);
      setError(err.message);
    }
  };
  
  const handleSignOut = async () => {
    try {
      addLog('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        addLog(`Sign out error: ${error.message}`);
        setError(error.message);
      } else {
        addLog('Signed out successfully');
        setSession(null);
        setUser(null);
      }
    } catch (err: any) {
      addLog(`Sign out exception: ${err.message}`);
      setError(err.message);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Actions</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In with Google
          </button>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Session</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {session ? JSON.stringify(session, null, 2) : 'No active session'}
          </pre>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">User</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {user ? JSON.stringify(user, null, 2) : 'No user data'}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Logs</h2>
        <div className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug; 
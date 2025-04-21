import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get all URL parameters and components for debugging
        const hash = window.location.hash;
        const query = window.location.search;
        const fullUrl = window.location.href;
        const params = new URLSearchParams(query);
        
        // Log all URL parameters for debugging
        const allParams: Record<string, string> = {};
        params.forEach((value, key) => {
          allParams[key] = key === 'code' ? value.substring(0, 5) + '...' : value;
        });

        // Save comprehensive debug info
        const info = { 
          hash, 
          query, 
          fullUrl,
          allParams,
          origin: window.location.origin,
          path: window.location.pathname,
          referrer: document.referrer || 'none', 
          timestamp: new Date().toISOString()
        };
        setDebugInfo(info);
        console.log('Auth callback URL info:', info);

        // Check if we have an error parameter from OAuth provider
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(`OAuth error: ${errorParam}${errorDescription ? ': ' + errorDescription : ''}`);
          setLoading(false);
          return;
        }

        // Check if we have a code in the URL
        const code = params.get('code');
        
        if (code) {
          console.log('Detected auth code in URL:', code.substring(0, 5) + '...');
          
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code for session:', error);
              setError(`Auth error: ${error.message}`);
              setLoading(false);
              return;
            }
            
            console.log('Session created successfully:', !!data.session);
            
            if (data.session) {
              console.log('User authenticated:', data.session.user?.email);
              
              // Wait a moment to ensure the session is stored
              setTimeout(() => {
                // Use replaceState instead of href to avoid breaking the history
                window.history.replaceState({}, document.title, '/');
                window.location.href = '/'; 
              }, 1000);
              return;
            } else {
              setError('Session created but no user data returned');
              setLoading(false);
              return;
            }
          } catch (exchangeError) {
            console.error('Exception during code exchange:', exchangeError);
            setError(`Exchange error: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`);
            setLoading(false);
            return;
          }
        } else {
          console.log('No auth code found in URL. URL params:', query);
          setError('No authentication code found in URL. This usually means the OAuth provider (Google) denied the authorization request. Please check your Google Cloud Console configuration.');
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'Unknown error during authentication');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  const tryAgain = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded shadow max-w-md w-full">
        {error ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-center text-red-600 dark:text-red-400">Authentication Error</h1>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
            <div className="mb-4 text-sm text-gray-500 overflow-auto max-h-40 bg-gray-100 dark:bg-gray-900 p-2 rounded">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            <button 
              onClick={tryAgain}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">Completing Login...</h1>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-sm text-gray-500">Processing authentication response...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 
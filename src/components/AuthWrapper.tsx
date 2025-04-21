import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Uncomment the real auth check
    
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Check current session
        console.log('Checking current session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth:', error);
          setAuthError(error.message);
          setIsAuthenticated(false);
        } else {
          const hasSession = !!data.session;
          console.log('Auth status:', hasSession ? 'Authenticated' : 'Not authenticated');
          setIsAuthenticated(hasSession);
          
          // If not authenticated, redirect to debug page after a delay
          if (!hasSession) {
            console.log('No session, will continue as guest or redirect to login');
            // You can uncomment this to force redirect to debug page
            // setTimeout(() => {
            //   window.location.href = '/auth/debug';
            // }, 2000);
          }
        }
      } catch (err: any) {
        console.error('Unexpected error in auth check:', err);
        setAuthError('Unexpected error checking authentication: ' + err.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth listener
    console.log('Setting up auth listener...');
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      setIsLoading(false);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    // Initial check
    checkAuth();

    // Cleanup
    return () => {
      console.log('AuthWrapper unmounting, cleaning up...');
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
    
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      
      // Log the exact redirect URL to help with debugging
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Using redirect URL:', redirectUrl);
      
      console.log('Initiating sign in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
            scope: 'email profile', // Explicitly request minimal scopes
          },
        },
      });
      
      if (error) {
        console.error('Sign in error:', error);
        setAuthError(error.message);
      } else {
        console.log('Sign in initiated, redirecting to Google...');
        console.log('Auth URL:', data?.url || 'No URL returned');
      }
    } catch (err: any) {
      console.error('Sign in exception:', err);
      setAuthError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[#0071e3]/10 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-[#0071e3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>  
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Preparing Writing Frames...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7] dark:bg-black">
        <div className="p-8 bg-white dark:bg-[#1d1d1f] rounded-2xl shadow-xl max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff3b30]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Authentication Error</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{authError}</p>
          <button 
            onClick={handleSignIn}
            className="w-full px-6 py-3 bg-[#0071e3] text-white rounded-full hover:bg-[#0077ED] transition-all duration-300 font-medium text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-black overflow-hidden">
        {/* Background gradient effect */}
        <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/10 dark:to-black opacity-70 z-0"></div>
        
        {/* Background blur circle - Apple-like design element */}
        <div className="fixed top-1/4 -right-20 w-96 h-96 bg-[#0071e3]/10 rounded-full blur-3xl z-0"></div>
        <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0"></div>
        
        <div className="p-8 md:p-10 bg-white/80 dark:bg-[#1d1d1f]/80 backdrop-blur-xl rounded-3xl shadow-xl max-w-md w-full mx-4 z-10 transition-all duration-500">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-900 dark:text-white tracking-tight">Welcome to Writing Frames</h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Sign in to create and organize your notes with our beautiful writing templates.
            </p>
            
            <button 
              onClick={handleSignIn}
              className="w-full px-6 py-3.5 bg-[#0071e3] text-white rounded-full hover:bg-[#0077ED] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-base shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
            
            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <a href="/auth/debug" className="inline-flex items-center space-x-1 text-[#0071e3] hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Need help with authentication?</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper; 
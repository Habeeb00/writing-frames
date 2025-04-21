import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, signInWithGoogle, signOut } from '../supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth error:', error);
          setError(error.message);
          return;
        }
        
        if (data?.session) {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => {
      if (authListener && 'subscription' in authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const signIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
      throw err;
    }
  };
  
  const logOut = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
      throw err;
    }
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    logOut,
    error
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 
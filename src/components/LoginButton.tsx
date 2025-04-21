import React from 'react';
import { signInWithGoogle } from '../supabase';

interface LoginButtonProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
  isDarkMode?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  className = '',
  onSuccess,
  onError,
  buttonText = 'Sign In',
  isDarkMode = false
}) => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error signing in:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const defaultClassName = isDarkMode
    ? 'px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200'
    : 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200';

  return (
    <button
      onClick={handleSignIn}
      className={className || defaultClassName}
    >
      {buttonText}
    </button>
  );
};

export default LoginButton; 
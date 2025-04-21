import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './styles/fonts.css';
import App from './App';
import AuthCallback from './auth/callback';
import AuthDebug from './auth/debug';
import { AuthProvider } from './auth/AuthContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes that don't require authentication */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/debug" element={<AuthDebug />} />
          
          {/* Main application route */}
          <Route path="/" element={<App />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

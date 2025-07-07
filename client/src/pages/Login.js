import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate('/dashboard');
        }
      }
    });

    return unsubscribe;
  }, [navigate, returnUrl]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess('Login successful! Redirecting...');
      
      // Navigate after successful login
      setTimeout(() => {
        if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-section">
      <h2 className="page-title">Sign Up / login</h2>
      <div className="login-card">
        <button className="google-btn" onClick={handleGoogleLogin}>
          <span className="google-icon">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <g>
                <path fill="#4285F4" d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.836H9v3.481h4.844c-.208 1.12-.834 2.07-1.78 2.713v2.243h2.884c1.69-1.56 2.672-3.86 2.672-6.601z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.19l-2.884-2.243c-.8.54-1.82.86-3.076.86-2.36 0-4.36-1.59-5.07-3.73H.98v2.293C2.47 16.98 5.52 18 9 18z"/>
                <path fill="#FBBC05" d="M3.93 10.637c-.18-.54-.28-1.12-.28-1.637s.1-1.097.28-1.637V5.07H.98A8.996 8.996 0 0 0 0 9c0 1.43.34 2.78.98 3.93l2.95-2.293z"/>
                <path fill="#EA4335" d="M9 3.579c1.32 0 2.5.45 3.43 1.34l2.57-2.57C13.47.81 11.43 0 9 0 5.52 0 2.47 1.02.98 2.93l2.95 2.293C4.64 5.02 6.64 3.579 9 3.579z"/>
              </g>
            </svg>
          </span>
          Continue with Google
        </button>
        <div className="login-divider">
          <span>Or</span>
        </div>
        <input className="login-input" type="email" placeholder="Enter your email" />
        <input className="login-input" type="password" placeholder="Enter your password" />
        <button className="login-btn">Signin</button>
      </div>
    </div>
  );
};

export default Login; 
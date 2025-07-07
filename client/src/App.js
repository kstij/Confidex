import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import FormSubmit from './pages/FormSubmit';
import ThankYou from './pages/ThankYou';
import HeroSection from './HeroSection';
import FeaturesSection from './components/FeaturesSection';
import SubscribeSection from './SubscribeSection';
import CollaborateAccept from './pages/CollaborateAccept';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import FormClosed from './pages/FormClosed';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user token for backend verification
          const token = await firebaseUser.getIdToken();
          
          // Fetch user data from backend
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              isAdmin: userData.isAdmin || false
            });
          } else {
            console.error('Failed to verify user with backend');
            setUser(null);
          }
        } catch (error) {
          console.error('Error verifying user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setUserLoading(false);
    });

    return unsubscribe;
  }, []);

  // Spinner for protected routes only
  const ProtectedSpinner = () => (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="App">
        {!(location.pathname.startsWith('/form/') || location.pathname.startsWith('/thank-you/')) && <Navbar user={user} />}
        <Routes>
          <Route path="/" element={
            <div className="home-page">
              <HeroSection />
              <FeaturesSection />
              <SubscribeSection />
            </div>
          } />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={userLoading ? <ProtectedSpinner /> : <ProtectedRoute user={user}><UserDashboard /></ProtectedRoute>} />
          <Route path="/create-form" element={userLoading ? <ProtectedSpinner /> : <ProtectedRoute user={user}><CreateForm /></ProtectedRoute>} />
          <Route path="/edit-form/:formId" element={userLoading ? <ProtectedSpinner /> : <ProtectedRoute user={user}><EditForm /></ProtectedRoute>} />
          <Route path="/form/:formId" element={<FormSubmit />} />
          <Route path="/thank-you/:formId" element={<ThankYou />} />
          <Route path="/collaborate/:formId/:token" element={<CollaborateAccept user={user} />} />
          <Route path="/settings" element={userLoading ? <ProtectedSpinner /> : <ProtectedRoute user={user}><Settings user={user} /></ProtectedRoute>} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/form-closed" element={<FormClosed />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
  );
}

export default App;

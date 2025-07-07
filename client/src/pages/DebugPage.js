import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const DebugPage = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('authToken', token);
          
          // Test backend connection
          const response = await axios.get('http://localhost:5000/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Check admin status
          const adminEmails = ['admin@example.com', 'hr@company.com', 'kshitijvarma21@gmail.com'];
          const adminStatus = adminEmails.includes(firebaseUser.email);
          setIsAdmin(adminStatus);
          
          setDebugInfo({
            userEmail: firebaseUser.email,
            token: token ? 'Present' : 'Missing',
            backendResponse: response.data,
            isAdmin: adminStatus,
            adminEmails: adminEmails
          });
        } catch (error) {
          setDebugInfo({
            userEmail: firebaseUser.email,
            error: error.message,
            isAdmin: false
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const testAdminAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/admin/forms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(`Admin access successful! Found ${response.data.length} forms.`);
    } catch (error) {
      alert(`Admin access failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const testFormCreation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const testForm = {
        title: 'Test Form',
        description: 'Debug test form',
        questions: [
          {
            id: 'q1',
            type: 'short',
            label: 'Test question',
            required: true
          }
        ],
        domainRestrictions: ['example.com'],
        isActive: true
      };
      
      const response = await axios.post('http://localhost:5000/api/form/create', testForm, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert(`Form creation successful! Form ID: ${response.data._id}`);
    } catch (error) {
      alert(`Form creation failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Debug Page</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Authentication Status</h2>
        <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
        <p><strong>Admin Status:</strong> {isAdmin ? '✅ Admin' : '❌ Not Admin'}</p>
        <p><strong>Token:</strong> {debugInfo.token || 'Unknown'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Debug Information</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test Functions</h2>
        <button 
          onClick={testAdminAccess}
          style={{ 
            marginRight: '1rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#2196f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Test Admin Access
        </button>
        <button 
          onClick={testFormCreation}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#4caf50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Test Form Creation
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Navigation Test</h2>
        <button 
          onClick={() => window.location.href = '/create-form'}
          style={{ 
            marginRight: '1rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#ff9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Go to Create Form
        </button>
        <button 
          onClick={() => window.location.href = '/admin'}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#9c27b0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Go to Admin Dashboard
        </button>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/" style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          🏠 Go to Home
        </a>
      </div>
    </div>
  );
};

export default DebugPage; 
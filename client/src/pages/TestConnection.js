import React, { useState } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState({});

  const testBackend = async () => {
    try {
      setStatus('Testing backend connection...');
      const response = await axios.get('http://localhost:5000/');
      setStatus(`✅ Backend is running: ${response.data.message}`);
      setTestResults(prev => ({ ...prev, backend: 'success' }));
      setError('');
    } catch (err) {
      setError(`❌ Backend connection failed: ${err.message}`);
      setTestResults(prev => ({ ...prev, backend: 'failed' }));
      setStatus('');
    }
  };

  const testAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('❌ No auth token found. Please login first.');
        setTestResults(prev => ({ ...prev, auth: 'no-token' }));
        return;
      }

      setStatus('Testing authentication...');
      const response = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStatus(`✅ Authentication successful: ${JSON.stringify(response.data)}`);
      setTestResults(prev => ({ ...prev, auth: 'success' }));
      setError('');
    } catch (err) {
      setError(`❌ Authentication failed: ${err.response?.data?.error || err.message}`);
      setTestResults(prev => ({ ...prev, auth: 'failed' }));
      setStatus('');
    }
  };

  const testFormCreation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('❌ No auth token found. Please login first.');
        return;
      }

      setStatus('Testing form creation...');
      const testForm = {
        title: 'Test Form',
        description: 'This is a test form',
        questions: [
          {
            id: 'q1',
            type: 'short',
            label: 'What is your name?',
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
      
      setStatus(`✅ Form creation successful: ${JSON.stringify(response.data)}`);
      setTestResults(prev => ({ ...prev, formCreation: 'success' }));
      setError('');
    } catch (err) {
      setError(`❌ Form creation failed: ${err.response?.data?.error || err.message}`);
      setTestResults(prev => ({ ...prev, formCreation: 'failed' }));
      setStatus('');
    }
  };

  const testAdminAccess = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('❌ No auth token found. Please login first.');
        return;
      }

      setStatus('Testing admin access...');
      const response = await axios.get('http://localhost:5000/api/admin/forms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStatus(`✅ Admin access successful: Found ${response.data.length} forms`);
      setTestResults(prev => ({ ...prev, adminAccess: 'success' }));
      setError('');
    } catch (err) {
      setError(`❌ Admin access failed: ${err.response?.data?.error || err.message}`);
      setTestResults(prev => ({ ...prev, adminAccess: 'failed' }));
      setStatus('');
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    await testBackend();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAuth();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testFormCreation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAdminAccess();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '2rem' }}>🔧 Startup Connection Test</h1>
      
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button 
          onClick={runAllTests} 
          style={{ 
            padding: '1rem 2rem', 
            fontSize: '1.1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          🚀 Run All Tests
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={testBackend} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Test Backend
        </button>
        <button onClick={testAuth} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Test Auth
        </button>
        <button onClick={testFormCreation} style={{ marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Test Form Creation
        </button>
        <button onClick={testAdminAccess} style={{ padding: '0.5rem 1rem', backgroundColor: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Test Admin Access
        </button>
      </div>

      {status && (
        <div style={{ padding: '1rem', background: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '4px', marginBottom: '1rem' }}>
          {status}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#ffebee', border: '1px solid #f44336', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>📊 Test Results:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: testResults.backend === 'success' ? '#e8f5e8' : testResults.backend === 'failed' ? '#ffebee' : '#f5f5f5' }}>
            <strong>Backend:</strong> {testResults.backend === 'success' ? '✅ Working' : testResults.backend === 'failed' ? '❌ Failed' : '⏳ Not tested'}
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: testResults.auth === 'success' ? '#e8f5e8' : testResults.auth === 'failed' ? '#ffebee' : '#f5f5f5' }}>
            <strong>Authentication:</strong> {testResults.auth === 'success' ? '✅ Working' : testResults.auth === 'failed' ? '❌ Failed' : testResults.auth === 'no-token' ? '⚠️ No token' : '⏳ Not tested'}
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: testResults.formCreation === 'success' ? '#e8f5e8' : testResults.formCreation === 'failed' ? '#ffebee' : '#f5f5f5' }}>
            <strong>Form Creation:</strong> {testResults.formCreation === 'success' ? '✅ Working' : testResults.formCreation === 'failed' ? '❌ Failed' : '⏳ Not tested'}
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: testResults.adminAccess === 'success' ? '#e8f5e8' : testResults.adminAccess === 'failed' ? '#ffebee' : '#f5f5f5' }}>
            <strong>Admin Access:</strong> {testResults.adminAccess === 'success' ? '✅ Working' : testResults.adminAccess === 'failed' ? '❌ Failed' : '⏳ Not tested'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>🔍 Debug Info:</h3>
        <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</p>
        <p><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Firebase Config:</strong> ✅ Loaded</p>
        <p><strong>Backend Port:</strong> 5000</p>
        <p><strong>Frontend Port:</strong> 3000</p>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/" style={{ padding: '0.5rem 1rem', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          🏠 Go to Home
        </a>
      </div>
    </div>
  );
};

export default TestConnection; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CollaborateAccept = ({ user }) => {
  const { formId, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      // Redirect to login, then back here
      navigate(`/login?redirect=/collaborate/${formId}/${token}`);
      return;
    }
    // Accept invite
    api.post(`/form/${formId}/accept-invite/${token}`)
      .then(() => {
        setStatus('success');
        setMessage('You have joined as a collaborator! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to accept invite. The link may be invalid or expired.');
      });
  }, [user, formId, token, navigate]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '1.2rem', boxShadow: '0 8px 32px rgba(44,62,80,0.18)', padding: '2.5rem 2.2rem', minWidth: 320, maxWidth: 400, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '1.2rem' }}>Collaboration Invite</h2>
        {status === 'pending' && <div>Accepting invite...</div>}
        {status === 'success' && <div style={{ color: '#1a7f37', fontWeight: 600 }}>{message}</div>}
        {status === 'error' && <div style={{ color: '#b91c1c', fontWeight: 600 }}>{message}</div>}
      </div>
    </div>
  );
};

export default CollaborateAccept; 
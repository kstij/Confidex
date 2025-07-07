import React from 'react';

const FormClosed = () => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <h1 style={{ fontSize: '2.5rem', color: '#e11d48', marginBottom: 16 }}>Form Closed</h1>
    <p style={{ fontSize: '1.2rem', color: '#333', maxWidth: 400, textAlign: 'center' }}>
      Sorry, this form is no longer accepting responses.<br />
      If you believe this is a mistake, please contact the form owner.
    </p>
  </div>
);

export default FormClosed; 
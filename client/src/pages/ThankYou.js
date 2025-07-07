import React from 'react';
import { Link } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
  return (
    <div className="page-section">
      <h2 className="page-title">Thank You!</h2>
      <div className="page-content">
        <div className="thankyou-card">
          <div className="thankyou-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" stroke="#111" strokeWidth="4" fill="#fff"/>
              <path d="M24 42L36 54L56 30" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="thankyou-title">Thank You!</h2>
          <p className="thankyou-message">Your feedback has been submitted successfully.</p>
          <button className="thankyou-home-btn" onClick={() => window.location.href = '/'}>Go to Home</button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 
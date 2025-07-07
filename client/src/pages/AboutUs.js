import React from 'react';
import { Link } from 'react-router-dom';

const accent = '#111';
const accent2 = '#e11d48';

const iconShield = (
  <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#f3f4f6"/><path d="M18 8l9 4v5c0 6.075-3.6 11.025-9 13-5.4-1.975-9-6.925-9-13V12l9-4z" stroke={accent} strokeWidth="2" fill="#fff"/><path d="M18 16v5" stroke={accent2} strokeWidth="2" strokeLinecap="round"/><circle cx="18" cy="14" r="1.5" fill={accent2}/></svg>
);
const iconAnon = (
  <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#f3f4f6"/><ellipse cx="18" cy="15" rx="7" ry="6" stroke={accent} strokeWidth="2" fill="#fff"/><ellipse cx="18" cy="28" rx="10" ry="5" stroke={accent} strokeWidth="2" fill="#fff"/><circle cx="18" cy="15" r="2" fill={accent2}/></svg>
);
const iconLock = (
  <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#f3f4f6"/><rect x="10" y="16" width="16" height="10" rx="3" stroke={accent} strokeWidth="2" fill="#fff"/><path d="M14 16v-2a4 4 0 018 0v2" stroke={accent2} strokeWidth="2"/><circle cx="18" cy="21" r="1.5" fill={accent2}/></svg>
);

export default function AboutUs() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: accent, fontFamily: 'Poppins, Segoe UI, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1.2rem' }}>
      <div style={{ maxWidth: 700, width: '100%', margin: '0 auto', padding: '3.5rem 0 2.5rem 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-1px' }}>About Confidex</h1>
        <p style={{ color: '#555', fontSize: '1.2rem', marginBottom: 32, lineHeight: 1.7 }}>
          Confidex is a modern, secure, and anonymous feedback platform designed for organizations that value <b>honest voices</b> and <b>privacy</b>.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fafbfc', borderRadius: 16, padding: '2rem 1.2rem', boxShadow: '0 2px 8px rgba(44,62,80,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {iconShield}
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '1.2rem 0 0.5rem 0' }}>Security First</h3>
            <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.6 }}>All data is encrypted in transit and at rest. Only you and your team can access your feedback.</p>
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fafbfc', borderRadius: 16, padding: '2rem 1.2rem', boxShadow: '0 2px 8px rgba(44,62,80,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {iconAnon}
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '1.2rem 0 0.5rem 0' }}>True Anonymity</h3>
            <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.6 }}>No personal data is ever linked to answers. Responses are shuffled and cannot be traced back to individuals.</p>
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fafbfc', borderRadius: 16, padding: '2rem 1.2rem', boxShadow: '0 2px 8px rgba(44,62,80,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {iconLock}
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '1.2rem 0 0.5rem 0' }}>Private by Design</h3>
            <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.6 }}>We never sell or share your data. Your organization's privacy is our top priority.</p>
          </div>
        </div>
        <section style={{ textAlign: 'left', margin: '0 auto', maxWidth: 700, marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 10, color: accent }}>How Confidex Maintains Anonymity</h2>
          <ul style={{ color: '#444', fontSize: '1.05rem', lineHeight: 1.7, paddingLeft: 22, marginBottom: 18 }}>
            <li>Answers are stored without any link to responder identity or email.</li>
            <li>Responses are shuffled before being shown to form owners, so order cannot be used to identify anyone.</li>
            <li>Even admins cannot see who submitted which answer.</li>
            <li>We use secure, industry-standard encryption for all data in transit and at rest.</li>
          </ul>
        </section>
        <section style={{ textAlign: 'left', margin: '0 auto', maxWidth: 700, marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 10, color: accent }}>Why Security Matters</h2>
          <p style={{ color: '#444', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 0 }}>
            In today's world, honest feedback is only possible when people feel safe. Confidex is built so you can gather real insights without risking anyone's privacy. We believe trust is the foundation of every great organization.
          </p>
        </section>
        <Link to="/login" style={{ display: 'inline-block', background: accent, color: '#fff', fontWeight: 700, fontSize: '1.1rem', borderRadius: 12, padding: '1rem 2.5rem', textDecoration: 'none', marginTop: 10, boxShadow: '0 2px 8px rgba(44,62,80,0.08)', transition: 'background 0.15s' }}>Get Started</Link>
      </div>
      <footer style={{ marginTop: 'auto', color: '#aaa', fontSize: '0.98rem', padding: '2.5rem 0 1.2rem 0', textAlign: 'center', width: '100%' }}>
        &copy; {new Date().getFullYear()} Confidex. All rights reserved.
      </footer>
    </div>
  );
} 
import React, { useState } from 'react';
import { updateProfile, updatePassword, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, storage } from '../firebase';
import api from '../utils/api';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Settings = ({ user }) => {
  const [language, setLanguage] = useState('English');
  const [tailorMade, setTailorMade] = useState(true);
  const [relevantContent, setRelevantContent] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Change name
  const handleNameSave = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setMsg('Name updated!');
      setEditingName(false);
      window.location.reload();
    } catch (e) {
      setMsg('Failed to update name.');
    }
    setLoading(false);
  };

  // Change avatar (upload)
  const handleAvatarSave = async () => {
    setLoading(true);
    try {
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, avatarFile);
        const url = await getDownloadURL(storageRef);
        await updateProfile(auth.currentUser, { photoURL: url });
        setMsg('Avatar updated!');
        setEditingAvatar(false);
        window.location.reload();
      }
    } catch (e) {
      setMsg('Failed to update avatar.');
    }
    setLoading(false);
  };

  // Set new password
  const handlePasswordSave = async () => {
    setLoading(true);
    setPasswordMsg('');
    try {
      await updatePassword(auth.currentUser, newPassword);
      setPasswordMsg('Password updated!');
      setShowPasswordModal(false);
    } catch (e) {
      setPasswordMsg('Failed to update password.');
    }
    setLoading(false);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Re-authenticate user before deleting account
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(auth.currentUser, provider);
      
      // First delete user data from backend
      await api.delete('/users/me');
      
      // Then delete Firebase account
      await deleteUser(auth.currentUser);
      setMsg('Account deleted.');
      window.location.href = '/';
    } catch (e) {
      console.error('Delete account error:', e);
      if (e.code === 'auth/requires-recent-login') {
        setMsg('Please re-authenticate to delete your account.');
      } else {
        setMsg('Failed to delete account.');
      }
    }
    setLoading(false);
  };

  // Handle avatar file change
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user?.photoURL || '');
    }
  };

  return (
    <div style={{ maxWidth: 650, margin: '2.5rem auto', background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2.2rem' }}>
      <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Your settings</h2>
      <div style={{ color: '#555', marginBottom: 28 }}>Put a face to your name, edit your login details, and set preferences</div>
      {/* Profile Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
        <img src={user?.photoURL || 'https://ui-avatars.com/api/?name=User'} alt="avatar" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.displayName || user?.email}</div>
          <div style={{ color: '#888', fontSize: 14 }}>Joined Confidex on Aug 19, 2023</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          {editingName ? (
            <div style={{ width: '100%', marginTop: 0 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 15, marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleNameSave} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Save</button>
                <button onClick={() => setEditingName(false)} style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, width: '100%' }} onClick={() => setEditingName(true)}>Change name</button>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {editingAvatar ? (
            <div style={{ width: '100%', marginTop: 0 }}>
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ marginBottom: 10 }} />
              {avatarPreview && <img src={avatarPreview} alt="Preview" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleAvatarSave} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Save</button>
                <button onClick={() => { setEditingAvatar(false); setAvatarFile(null); setAvatarPreview(user?.photoURL || ''); }} style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, width: '100%' }} onClick={() => setEditingAvatar(true)}>Change Avatar</button>
          )}
        </div>
      </div>
      <hr style={{ margin: '1.2rem 0' }} />
      {/* Login Details */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, letterSpacing: 0.5 }}>LOGIN DETAILS</div>
      <div style={{ color: '#444', marginBottom: 6 }}>Your email is:<br /><span style={{ fontWeight: 600 }}>{user?.email}</span></div>
      <div style={{ background: '#eaf6fb', color: '#1a4b6b', borderRadius: 8, padding: '0.7rem 1rem', fontSize: 15, marginBottom: 10 }}>
        Your email and password are currently linked to a social account<br />
        <button onClick={() => setShowPasswordModal(true)} style={{ color: '#1a4b6b', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Set a new password</button>
      </div>
      {showPasswordModal && (
        <div style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 10, padding: 18, marginBottom: 18 }}>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 15, marginRight: 10 }} />
          <button onClick={handlePasswordSave} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Save</button>
          <button onClick={() => setShowPasswordModal(false)} style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600 }}>Cancel</button>
          {passwordMsg && <div style={{ marginTop: 8, color: passwordMsg.includes('Failed') ? '#dc2626' : '#2563eb' }}>{passwordMsg}</div>}
        </div>
      )}
      {/* Language */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, letterSpacing: 0.5 }}>LANGUAGE</div>
      <div style={{ color: '#444', marginBottom: 8 }}>Your account language is:</div>
      <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 15, marginBottom: 18 }}>
        <option>English</option>
        <option>Hindi</option>
        <option>Spanish</option>
      </select>
      {/* Account Data */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, letterSpacing: 0.5 }}>ACCOUNT DATA</div>
      <div style={{ color: '#444', marginBottom: 6 }}>Choose how Confidex uses your account data to personalize its services<br /><a href="#" style={{ color: '#1a4b6b', textDecoration: 'underline', fontWeight: 500 }}>See Privacy Policy</a></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600 }}>Tailor-made Confidex</div>
          <div style={{ color: '#666', fontSize: 14 }}>Get a more personalized experience based on your activity</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={tailorMade} onChange={() => setTailorMade(v => !v)} style={{ width: 0, height: 0, opacity: 0 }} />
          <span style={{ width: 36, height: 20, background: tailorMade ? '#2563eb' : '#e5e7eb', borderRadius: 12, position: 'relative', display: 'inline-block', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', left: tailorMade ? 18 : 2, top: 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'left 0.2s' }}></span>
          </span>
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 600 }}>More relevant content</div>
          <div style={{ color: '#666', fontSize: 14 }}>We may enrich your data using third parties to offer better content</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={relevantContent} onChange={() => setRelevantContent(v => !v)} style={{ width: 0, height: 0, opacity: 0 }} />
          <span style={{ width: 36, height: 20, background: relevantContent ? '#2563eb' : '#e5e7eb', borderRadius: 12, position: 'relative', display: 'inline-block', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', left: relevantContent ? 18 : 2, top: 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'left 0.2s' }}></span>
          </span>
        </label>
      </div>
      <hr style={{ margin: '1.2rem 0' }} />
      {/* Danger Zone */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, letterSpacing: 0.5, color: '#b91c1c' }}>DANGER ZONE</div>
      <div style={{ color: '#b91c1c', marginBottom: 10, fontSize: 15 }}>If you do this, all your forms and the data they collected get removed from our system—forever</div>
      <button onClick={() => setShowDeleteModal(true)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16 }}>Delete account</button>
      {showDeleteModal && (
        <div style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 10, padding: 18, marginTop: 18 }}>
          <div style={{ color: '#b91c1c', marginBottom: 10 }}>Are you sure you want to delete your account? This cannot be undone.</div>
          <button onClick={handleDeleteAccount} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, marginRight: 10 }}>Yes, delete my account</button>
          <button onClick={() => setShowDeleteModal(false)} style={{ background: '#f3f4f6', color: '#18181b', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 600 }}>Cancel</button>
        </div>
      )}
      {msg && <div style={{ marginTop: 18, color: msg.includes('Failed') ? '#dc2626' : '#2563eb' }}>{msg}</div>}
    </div>
  );
};

export default Settings; 
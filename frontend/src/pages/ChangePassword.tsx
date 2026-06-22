import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('resetEmail');
    if (!token || !email) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/auth/change-password`,
        { newPassword },
        { headers: getAuthHeader() }
      );
      setSuccess('Password changed successfully! Redirecting to login...');
      localStorage.removeItem('resetEmail');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '40px', width: '450px', maxWidth: '90%', boxShadow: '0 20px 35px -8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '48px' }}>🔐</span>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px' }}>Change Password</h1>
          <p style={{ color: '#64748b' }}>Please set a new password for your account</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChangePassword;

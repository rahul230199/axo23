import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { realApi } from '../services/realApi';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'buyer',
    companyName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await realApi.register(formData);
      setSuccess('Registration submitted! An admin will review and approve your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '40px', width: '550px', maxWidth: '100%', boxShadow: '0 20px 35px -8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Create Account</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Join AXO Networks as a buyer or supplier</p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}><label>Full Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
          <div style={{ marginBottom: '16px' }}><label>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
          <div style={{ marginBottom: '16px' }}><label>Role *</label><select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}><option value="buyer">Buyer</option><option value="supplier">Supplier</option></select></div>
          <div style={{ marginBottom: '16px' }}><label>Company Name</label><input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
          <div style={{ marginBottom: '16px' }}><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
          <div style={{ marginBottom: '24px' }}><label>Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '40px', fontWeight: '600', cursor: 'pointer' }}>{loading ? 'Submitting...' : 'Register'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>Already have an account? <Link to="/login" style={{ color: '#2d3561', fontWeight: '600' }}>Sign in</Link></p>
      </div>
    </div>
  );
};
export default Register;

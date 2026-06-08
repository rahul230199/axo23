import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer' as 'buyer' | 'supplier',
    companyName: '',
    phone: '',
    address: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await authService.register({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        companyName: formData.companyName,
        phone: formData.phone,
        address: formData.address
      });
      
      setSuccessMessage('Registration submitted! Admin will review and approve your account.');
      setTimeout(() => {
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'buyer',
          companyName: '',
          phone: '',
          address: ''
        });
        setIsLogin(true);
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.success && response.user) {
        if (response.needsReset) {
          navigate('/force-reset-password');
        } else if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (response.user.role === 'buyer') {
          navigate('/buyer/dashboard');
        } else {
          navigate('/supplier/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px' }}>🔗</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px' }}>AXO NETWORKS</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            {isLogin ? 'Welcome back!' : 'Request Access'}
          </p>
        </div>

        {successMessage && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#f3f4f6',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              backgroundColor: isLogin ? '#2563eb' : 'transparent',
              color: isLogin ? 'white' : '#4b5563'
            }}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              backgroundColor: !isLogin ? '#2563eb' : 'transparent',
              color: !isLogin ? 'white' : '#4b5563'
            }}
          >
            Request Access
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Processing...' : 'Login'}
            </button>

            <hr style={{ margin: '20px 0' }} />

            <button
              type="button"
              onClick={handleAdminLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Admin Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role *</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: formData.role === 'buyer' ? '#2563eb' : '#e5e7eb',
                    backgroundColor: formData.role === 'buyer' ? '#eff6ff' : 'white',
                    color: formData.role === 'buyer' ? '#2563eb' : '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  🛒 Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'supplier' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: formData.role === 'supplier' ? '#2563eb' : '#e5e7eb',
                    backgroundColor: formData.role === 'supplier' ? '#eff6ff' : 'white',
                    color: formData.role === 'supplier' ? '#2563eb' : '#4b5563',
                    cursor: 'pointer'
                  }}
                >
                  🔧 Supplier
                </button>
              </div>
            </div>

            {formData.role === 'supplier' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  placeholder="Your Manufacturing Company"
                />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="Your business address"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
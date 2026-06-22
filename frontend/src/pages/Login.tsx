import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { realApi } from '../services/realApi';
import { Home } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await realApi.login(email, password);
      const { user } = response;

      if (user.hasResetPassword === false) {
        localStorage.setItem('resetEmail', email);
        navigate('/change-password');
        return;
      }

      if (user.role === 'buyer') navigate('/buyer/dashboard');
      else if (user.role === 'supplier') navigate('/supplier/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', position: 'relative' }}>
      {/* ── Back to Home Link (goes to root) ── */}
      <a 
        href="/" 
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          padding: '8px 16px',
          borderRadius: '40px',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease'
        }}
        className="home-link"
      >
        <Home size={18} /> Back to Home
      </a>

      <div style={{ background: 'white', borderRadius: '28px', padding: '40px', width: '450px', maxWidth: '90%', boxShadow: '0 20px 35px -8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginTop: '8px' }}>AXO Networks</h1>
          <p style={{ color: '#64748b' }}>Sign in to your account</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }} 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'linear-gradient(135deg, #2d3561, #1e293b)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '40px', 
              fontWeight: '600', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #eef2f6', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2d3561', fontWeight: '600', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .home-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          color: #1e293b;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45,53,97,0.3);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Login;

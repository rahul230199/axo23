import React, { useState, useEffect } from 'react';

interface PendingUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName: string;
  phone: string;
  address: string;
  registeredAt: string;
}

interface ApprovedUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  companyName: string;
  phone: string;
  address: string;
  approvedAt: string;
  isActive: boolean;
  hasResetPassword: boolean;
}

const AdminDashboard: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTempPassword, setShowTempPassword] = useState<{ email: string; password: string; username: string; name: string } | null>(null);

  const token = localStorage.getItem('token');

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPendingUsers(data.pending);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setApprovedUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchApprovedUsers();
  }, []);

  const handleApprove = async (registrationId: string) => {
    try {
      const response = await fetch('/api/admin/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ registrationId })
      });
      const data = await response.json();
      
      if (data.success) {
        setShowTempPassword({
          email: data.user.email,
          username: data.user.username,
          password: data.user.tempPassword,
          name: data.user.name
        });
        
        await fetchPendingUsers();
        await fetchApprovedUsers();
        
        setMessage({ type: 'success', text: 'User approved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve user' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = async (registrationId: string) => {
    const reason = prompt('Enter rejection reason:');
    try {
      const response = await fetch('/api/admin/reject-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ registrationId, reason })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'User rejected successfully' });
        fetchPendingUsers();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject user' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Copied to clipboard!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const buyerCount = approvedUsers.filter(u => u.role === 'buyer').length;
  const supplierCount = approvedUsers.filter(u => u.role === 'supplier').length;

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Manage user registrations and approvals</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Pending Approvals</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingUsers.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Buyers</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{buyerCount}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Suppliers</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{supplierCount}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Users</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{approvedUsers.length}</p>
        </div>
      </div>

      {/* Temp Password Modal */}
      {showTempPassword && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxWidth: '500px',
          width: '90%'
        }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              ✅ User Approved: {showTempPassword.name}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
              Share these credentials with the user:
            </p>
            
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#065f46', marginBottom: '12px' }}>
                🔐 LOGIN INFORMATION (USE THESE):
              </p>
              
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>Email (Login):</p>
                <code style={{
                  display: 'block',
                  backgroundColor: '#dcfce7',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#065f46',
                  wordBreak: 'break-all'
                }}>
                  {showTempPassword.email}
                </code>
                <p style={{ fontSize: '11px', color: '#065f46', marginTop: '4px' }}>
                  ⚠️ IMPORTANT: Use this email address to login
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>Temporary Password:</p>
                <code style={{
                  display: 'block',
                  backgroundColor: '#dcfce7',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#065f46'
                }}>
                  {showTempPassword.password}
                </code>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>
                💡 Username (for reference only, NOT for login):
              </p>
              <code style={{ fontSize: '12px', color: '#b45309' }}>
                {showTempPassword.username}
              </code>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => copyToClipboard(showTempPassword.email)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Copy Email
              </button>
              <button
                onClick={() => copyToClipboard(showTempPassword.password)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Copy Password
              </button>
              <button
                onClick={() => setShowTempPassword(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {showTempPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }} />
      )}

      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          zIndex: 1000
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'pending' ? '2px solid #2563eb' : 'none',
            color: activeTab === 'pending' ? '#2563eb' : '#6b7280',
            fontWeight: activeTab === 'pending' ? '600' : '500',
            marginBottom: '-2px'
          }}
        >
          ⏳ Pending Approvals ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'approved' ? '2px solid #2563eb' : 'none',
            color: activeTab === 'approved' ? '#2563eb' : '#6b7280',
            fontWeight: activeTab === 'approved' ? '600' : '500',
            marginBottom: '-2px'
          }}
        >
          👥 Approved Users ({approvedUsers.length})
        </button>
      </div>

      {/* Pending Users Tab */}
      {activeTab === 'pending' && (
        <div>
          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>✨ No pending registrations</p>
              <p style={{ color: '#9ca3af', marginTop: '8px' }}>New user requests will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingUsers.map((user) => (
                <div key={user.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{user.name}</h3>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: user.role === 'buyer' ? '#dbeafe' : '#d1fae5',
                          color: user.role === 'buyer' ? '#1e40af' : '#065f46'
                        }}>
                          {user.role === 'buyer' ? '🛒 Buyer' : '🔧 Supplier'}
                        </span>
                      </div>
                      <p style={{ color: '#6b7280', marginBottom: '4px' }}>📧 {user.email}</p>
                      {user.companyName && <p style={{ color: '#6b7280', marginBottom: '4px' }}>🏢 {user.companyName}</p>}
                      {user.phone && <p style={{ color: '#6b7280', marginBottom: '4px' }}>📞 {user.phone}</p>}
                      {user.address && <p style={{ color: '#6b7280', fontSize: '14px' }}>📍 {user.address}</p>}
                      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                        Requested: {new Date(user.registeredAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleApprove(user.id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Users Tab */}
      {activeTab === 'approved' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
              <p>Loading users...</p>
            </div>
          ) : approvedUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>👥 No approved users yet</p>
              <p style={{ color: '#9ca3af', marginTop: '8px' }}>Approve pending users to see them here</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>User</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Login Email</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Role</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Company</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Approved</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontWeight: '500', color: '#1f2937' }}>{user.name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Username: {user.username}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <code style={{
                            backgroundColor: '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#059669'
                          }}>
                            {user.email}
                          </code>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: user.role === 'buyer' ? '#dbeafe' : '#d1fae5',
                            color: user.role === 'buyer' ? '#1e40af' : '#065f46'
                          }}>
                            {user.role === 'buyer' ? '🛒 Buyer' : '🔧 Supplier'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                          {user.companyName || '-'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                          {new Date(user.approvedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: user.hasResetPassword ? '#10b981' : '#f59e0b',
                            marginRight: '6px'
                          }} />
                          <span style={{ fontSize: '14px', color: user.hasResetPassword ? '#065f46' : '#92400e' }}>
                            {user.hasResetPassword ? 'Active' : 'Password Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
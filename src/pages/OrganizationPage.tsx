import React from 'react';

const OrganizationPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Organization Profile</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Build trust and discoverability</p>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
        <h3>Company Information</h3>
        <div style={{ marginTop: '16px' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username || 'Not assigned yet'}</p>
          <p><strong>Role:</strong> {user.role === 'buyer' ? '🛒 Buyer' : '🔧 Supplier'}</p>
          {user.companyName && <p><strong>Company:</strong> {user.companyName}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
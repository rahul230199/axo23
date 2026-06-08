import React from 'react';

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back, {user.name}!</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>🎉 Your dashboard is ready!</h2>
        <p style={{ color: '#6b7280' }}>
          Your account has been approved. We're now building the full features:
        </p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto', color: '#6b7280' }}>
          <li>📊 Real-time KPI cards</li>
          <li>📋 RFQ creation and management</li>
          <li>📦 Order tracking with timeline</li>
          <li>💬 Real-time chat</li>
          <li>⭐ Reliability scoring system</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
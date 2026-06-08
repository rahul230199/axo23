import React from 'react';

const OrdersPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Orders</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Track and manage all your purchase orders</p>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <h3>📦 Orders Module (Coming Soon)</h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Track orders, update milestones, and communicate with suppliers
        </p>
      </div>
    </div>
  );
};

export default OrdersPage;
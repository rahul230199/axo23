import React from 'react';

const RFQPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>RFQ → Quote → PO</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Your commerce engine for sourcing</p>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <h3>📋 RFQ Module (Coming Soon)</h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Create RFQs, receive quotes, and issue purchase orders
        </p>
      </div>
    </div>
  );
};

export default RFQPage;